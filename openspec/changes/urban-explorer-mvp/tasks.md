# Tareas: Urban Explorer MVP

## Pronóstico de Carga de Review

| Campo | Valor |
|-------|-------|
| Líneas modificadas estimadas | 1,200-1,800 |
| Riesgo de presupuesto de 400 líneas | Alto |
| PRs encadenados recomendados | Sí |
| División sugerida | PR1 bootstrap+base de Supabase -> PR2 flujo de completado -> PR3 progresión+deploy en Vercel+demo |
| Estrategia de entrega | auto-chain |
| Estrategia de cadena | feature-branch-chain |
| Estado de CI | Presente en `.github/workflows/ci.yml`; ejecuta `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build`. |

Decisión necesaria antes de aplicar: Sí - elegir la ciudad exacta y comprometer el dataset semilla inicial de 8-12 desafíos antes de comenzar la tarea 1.3 de PR1.
PRs encadenados recomendados: Sí
Estrategia de cadena: feature-branch-chain
Riesgo de presupuesto de 400 líneas: Alto

### Unidades de Trabajo Sugeridas

| Unidad | Objetivo | PR probable | Comando de test enfocado | Harness de runtime | Límite de rollback |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Bootstrap de la app + ruta semilla de auth/datos/storage de Supabase | PR1 base=rama de feature | `npm run test -- app-shell supabase seed` | `npm run dev` + smoke de login/list local/proyecto de Supabase | `package.json`, `src/app`, `src/lib/supabase`, `supabase/{migrations,seed}` |
| 2 | Validación de completado + flujo de subida de evidencia | PR2 base=PR1 | `npm run test -- completion submit-completion` | smoke de completado con geolocalización mockeada + subida de archivo | `src/features/completion`, `src/shared/browser`, límite de validación de `supabase/migrations` |
| 3 | Progresión, compartir, deploy en Vercel, pulido de demo | PR3 base=PR2 | `npm run test -- progression e2e` | `npm run build` + checklist de demo alojada en Vercel | `src/features/progression`, `playwright`, docs/config de deploy |

## Lanes de Responsables

- Dev A: shell del frontend, límite de sesión de Supabase Auth, descubrimiento.
- Dev B: esquema de Supabase, RLS, storage, semilla, validación de completado, env/deploy de Vercel.
- Dev C: UX de completado, visualización de progresión, tests, demo.

## Fase 1: Fundación / Bootstrap

- [x] 1.1 [A] Crear `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/app/App.tsx`; AC: la app arranca y existen scripts reales para las compuertas disponibles; Verificar: `npm install && npm run dev`.
- [x] 1.2 [B] Crear `src/lib/supabase/*`, `.env.example` y `supabase/migrations/*` para perfiles de Auth, desafíos, completados, storage privado de evidencia y RLS; AC: el cliente del navegador usa solo anon key y la service role está ausente del entorno del cliente; Verificar: smoke local/proyecto de Supabase cuando esté configurado. Verificado: proyecto Supabase real creado, migración aplicada (tablas, RLS, bucket `evidence` con políticas) más fix de `GRANT` de tabla que la migración original omitía; smoke test de lectura vía cliente anon confirmado en verde.
- [x] 1.3 [B] Agregar `supabase/seed/challenges.json` más la ruta de validación; Dependencia: ciudad exacta y dataset semilla aprobados; AC: 8-12 desafíos de una sola ciudad usan los campos/categorías aceptados y existe guía de rollback de semilla; Verificar: `npm run seed:check`. Verificado: ciudad decidida (Ciudad de México), `challenges.json` con 12 desafíos (5 categorías cubiertas), `npm run seed:check` en verde, guía de rollback en `supabase/seed/README.md`, migración `20260725000000_add_challenge_contract_fields.sql` agrega `radius_meters`/`photo_prompt`/`estimated_minutes` y el check de categorías, dataset cargado al proyecto Supabase real y smoke test de lectura confirmado en verde.
- [ ] 1.4 [B+C] Agregar reglas de progresión derivada sin recompensas escribibles por el cliente; AC: los puntos/badges derivan de completados aceptados; Verificar: `npm run test -- progressionRules`.
- [x] 1.5 [A+B+C] Agregar CI en `.github/workflows/*` una vez que existan los scripts de npm; AC: el workflow ejecuta compuertas reales de build/test/lint/typecheck y documenta las compuertas omitidas; Verificar: inspeccionar el workflow más la primera corrida de checks del PR. Verificado: `.github/workflows/ci.yml` ejecuta `typecheck`, `lint`, `test` y `build` con scripts reales.

## Fase 2: Lanes de Features

- [ ] 2.1 [A] Agregar `src/features/discovery/*` y `src/shared/browser/locationService.ts`; AC: lista ordenada, fallback de navegación con permiso denegado, vista de detalle; Verificar: `npm run test -- discovery location`.
- [ ] 2.2 [B] Agregar tests de contrato RED para casos no autenticado, fuera del radio de 80m, precisión de GPS mayor a 100m, duplicado, evidencia ausente, recompensas falsificadas y denegación de RLS; Verificar: `npm run test -- submit-completion` falla primero.
- [ ] 2.3 [B] Implementar la validación de completado de Supabase vía RPC/Edge Function o función Postgres más políticas de RLS/storage; AC: valida auth, radio, precisión de GPS, evidencia, prevención de duplicados y recompensas derivadas; Verificar: `npm run test -- submit-completion` pasa.
- [ ] 2.4 [C] Agregar `src/shared/browser/photoEvidenceService.ts` y `src/features/completion/*`; AC: subida privada de evidencia, bloqueo con permiso denegado, reintento sin completado duplicado; Verificar: `npm run test -- completion photo`.
- [ ] 2.5 [C] Agregar `src/features/progression/*` y `src/shared/browser/shareService.ts`; AC: restauración de puntos/badges/historial derivados y fallback de compartir nativo funcionan; Verificar: `npm run test -- progression share`.

## Fase 3: Integración / Verificación / Demo

- [ ] 3.1 [A+C] Cablear el estado de sesión de Supabase, los guards de auth y el refresco de perfil en `src/app/App.tsx`; AC: los flujos persistidos requieren login y los fallbacks de navegación coinciden con los specs; Verificar: `npm run test -- auth app`.
- [ ] 3.2 [C] Agregar flujos de Playwright en `playwright/e2e/urban-explorer.spec.ts`; AC: login, navegar sin ubicación, subida de evidencia/completado, fallback de compartir; Verificar: `npm run test:e2e`.
- [ ] 3.3 [B] Agregar scripts/docs de despliegue de Vercel/Supabase en `package.json`, `vercel.json`, `.env.example`, `README.md`; AC: los pasos de build/deploy, los logs de Vercel, los logs de Supabase, la seguridad de entorno y el rollback están documentados; Verificar: `npm run build` más un dry run de deploy cuando esté configurado.
- [ ] 3.4 [A+B+C] Crear `docs/demo-checklist.md`; AC: la ciudad semilla, la ruta de smoke, las fallas esperadas, la verificación de seguridad de service-role, las notas de rollback y la guía de corrección hacia adelante de política/función están documentadas; Verificar: revisión manual del runbook de demo.

## Review de Brechas (2026-07-24)

Hallazgos de una revisión exhaustiva del workspace contra `proposal.md`, `design.md` y `specs/*/spec.md`. Estado verificado: `npm install`, `npm run dev`, `npm run test`, `npm run lint` y `npm run typecheck` pasan todos en el bootstrap actual.

| Área | Faltante | Bloquea |
|------|---------|--------|
| Credenciales | No hay `.env` real; solo marcadores de posición en `.env.example` | Cualquier conexión real a Supabase |
| Datos semilla | `supabase/seed/challenges.json` y `npm run seed:check` referenciados en este archivo y en `CONTRIBUTING.md` aún no existen | Tarea 1.3, descubrimiento real |
| Decisión de ciudad/dataset | Pregunta abierta en `design.md`: valores exactos de la ciudad y de los 8-12 desafíos iniciales | Bloquea 1.3 directamente |
| Reglas de progresión | No hay código en `src/features/progression`, aunque los umbrales de nivel/badge ya están fijados en `specs/progression-sharing/spec.md` | Tarea 1.4 |
| UI de descubrimiento | `src/features/discovery/*` no existe | Tarea 2.1 |
| Flujo de completado | `src/features/completion/*`, `locationService`, `photoEvidenceService` no existen | Tareas 2.2-2.4 |
| Validación del lado del servidor | No hay RPC/Edge Function `submit_completion`; la tabla `completions` solo tiene una política SELECT, aún no hay ruta INSERT desde el navegador | Tarea 2.3 |
| UI de progresión + compartir | `src/features/progression/*`, `shareService` no existen | Tarea 2.5 |
| Cableado de auth | `App.tsx` no usa el cliente Supabase ni gestiona el estado de sesión | Tarea 3.1 |
| Tests E2E | No hay configuración de Playwright a pesar de ser requerida por la estrategia de testing de `design.md` | Tarea 3.2 |
| Deploy | No hay `vercel.json` ni docs de deploy reales | Tarea 3.3 |
| Checklist de demo | `docs/demo-checklist.md` no existe | Tarea 3.4 |

### Nota de CI

- La redundancia previa del test de contrato de migración fue resuelta: CI ya no tiene un paso separado para `npm run test:supabase-contract`; la suite corre una vez dentro de `npm run test`.

No se encontró ninguna otra redundancia estructural entre los artefactos de OpenSpec, `.kiro/steering/*` y `CONTRIBUTING.md` — son consistentes y no se solapan (el steering de Kiro difiere explícitamente a OpenSpec como la fuente de verdad y no duplica specs).
