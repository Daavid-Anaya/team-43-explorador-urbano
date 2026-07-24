# Size Exception Justification: PR #18

## Summary

PR #18 excede el presupuesto de 400 líneas modificadas (~1000 líneas totales) pero se justifica como una unidad atómica de trabajo que no puede dividirse sin introducir dependencias circulares o estados incompletos.

## Line Breakdown

| Category | Lines | Justification |
|----------|-------|---------------|
| SQL Migrations | ~500 | Schema base, RLS, storage, validación - debe ser atómico |
| TypeScript Client | ~200 | Cliente + tipos - mínimo viable |
| Documentation | ~300 | Guías de setup, seguridad y verificación |
| **Total** | **~1000** | |

## Why Not Split?

### Option 1: Split by Layer (SQL vs TS)
❌ **Blocker**: El cliente TypeScript depende del schema SQL. Sin las migraciones aplicadas, el cliente no compila (tipos inválidos) y CI falla.

### Option 2: Split by Feature (Auth vs Challenges vs Completions)
❌ **Blocker**: Las políticas RLS y la función `submit_completion` requieren que todas las tablas existan. Un PR parcial dejaría el sistema en un estado inseguro (algunas tablas sin RLS, otras sí).

### Option 3: Split Schema and Security
❌ **Blocker**: Aplicar schema sin RLS crea una ventana de vulnerabilidad. Supabase sin RLS permite acceso completo a cualquier cliente anon.

## Why Atomic?

1. **Security Unit**: RLS debe aplicarse JUNTO con el schema, no después. Una migración de schema sin RLS deja datos expuestos.

2. **Type Safety**: Los tipos TypeScript se generan desde el schema. Sin schema completo → tipos incorrectos → CI falla.

3. **Functional Boundary**: `submit_completion` es la validación server-side que protege contra falsificación de datos. Debe existir ANTES de que el cliente pueda enviar completions.

4. **Testing Dependency**: Los smoke tests requieren schema completo + RLS + función. Dividir el PR significa que algunos tests no pueden ejecutarse hasta que se mergeen múltiples PRs.

## Risk Mitigation

Para reducir el riesgo de review de un PR grande:

1. ✅ **Documentación exhaustiva**: 
   - `supabase/README.md` - Setup y schema
   - `src/lib/supabase/README.md` - Uso del cliente
   - `docs/verification/task-1.2-supabase-config.md` - Checklist completo

2. ✅ **Smoke tests incluidos**: 
   - `supabase/tests/security.test.sql` - Pruebas de seguridad RLS
   - Validación de políticas
   - Tests de función `submit_completion`

3. ✅ **Estructura clara**:
   - Migraciones numeradas y secuenciales
   - Una responsabilidad por archivo
   - Comentarios inline explicando decisiones

4. ✅ **Idempotencia**:
   - Migraciones usan `IF NOT EXISTS`
   - Storage bucket usa `ON CONFLICT DO NOTHING`
   - Rollback documentado

## Security Review Priority

Los reviewers deben enfocarse en:

1. **RLS Policies** (`20240101000002_rls_policies.sql`)
   - ✅ Verificar que NO hay INSERT policies en `completions` ni `badges`
   - ✅ Verificar que storage solo permite acceso por user_id

2. **submit_completion** (`20240101000004_submit_completion_function.sql`)
   - ✅ `SECURITY DEFINER` con `search_path` fijo
   - ✅ Validaciones de auth, GPS, radio, evidencia
   - ✅ Prevención de duplicados
   - ✅ Derivación server-side de puntos/badges

3. **Client Safety** (`src/lib/supabase/client.ts`)
   - ✅ Solo usa `VITE_SUPABASE_ANON_KEY`
   - ✅ Nunca expone service role key

## Alternative Considered: Multi-PR Chain

**Chain Structure**:
1. PR1: Schema only
2. PR2: RLS policies
3. PR3: Validation function
4. PR4: TypeScript client
5. PR5: Documentation

**Why Rejected**:
- 5 PRs secuenciales → review bottleneck
- PRs 1-3 dejan el sistema en estado inseguro entre merges
- CI fallaría en PR1-3 (no hay cliente funcional)
- Total review time > single large PR debido a overhead de contexto

## Approval Strategy

**Request**:
1. Aprobar `size:exception` para este PR
2. Focus review en secciones críticas de seguridad (listadas arriba)
3. Usar smoke tests para validación automatizada
4. Future PRs volverán a presupuesto de 400 líneas

**Commitment**:
- Este es un bootstrap one-time necesario
- PRs futuros (1.3 seed data, 2.x features) respetarán el presupuesto de 400 líneas
- Si se requiere otro size:exception, se documentará con igual nivel de detalle

## Conclusion

Este PR excede el presupuesto de líneas pero constituye la unidad atómica mínima para un backend Supabase seguro. Dividirlo introduciría estados intermedios inseguros, dependencias circulares, o CI roto.

**Recommendation**: Aprobar con `size:exception` y enfocar review en puntos críticos de seguridad listados arriba.
