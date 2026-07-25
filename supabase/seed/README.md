# Datos Semilla de Desafíos

## Contenido

`challenges.json` contiene el catálogo curado de 8-12 desafíos para el MVP, con ciudad ancla **Ciudad de México**. Cada desafío usa el contrato aceptado: `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, `estimatedMinutes`. Las categorías están limitadas a Art, History, Nature, Landmark y Hidden Gem.

## Validación

Correr `npm run seed:check` antes de cargar el dataset a Supabase. El script (`challenges.seed-check.test.ts`) verifica:

- Cantidad de desafíos entre 8 y 12.
- Todos los campos requeridos presentes.
- Categorías y dificultades dentro de los valores aceptados.
- Coordenadas válidas y puntos/radio positivos.
- Sin títulos duplicados.

Para validar en base de datos la restricción de categorías, usar el test pgTAP versionado en `supabase/tests/challenge_category_constraint_test.sql`:

```bash
supabase start
npm run seed:test:db
```

Este comando es opt-in y requiere Supabase CLI con el stack local iniciado. No forma parte del CI por defecto porque depende de Docker y de una configuración local de Supabase (`supabase/config.toml` no se versiona en este repo).

## Carga a Supabase

El JSON no se inserta de forma automática. Cargar el dataset vía SQL Editor de Supabase o un script de carga que lea `challenges.json` e inserte filas en `public.challenges` después de aplicar las migraciones del repo.

## Guía de Rollback

Si el dataset cargado tiene errores (coordenadas incorrectas, categoría inválida, duplicados):

1. **No borrar filas con `completions` asociadas.** Si un desafío ya tiene completados de usuarios reales, marcarlo `is_active = false` en lugar de eliminarlo, para no romper la referencia `completions.challenge_id`.
2. **Desafíos sin completados**: se pueden eliminar o actualizar directamente con `update`/`delete` en `public.challenges`.
3. **Restaurar el dataset conocido-bueno**: usar la versión de `challenges.json` en el historial de git (`git log -- supabase/seed/challenges.json`) como fuente de verdad y volver a cargar.
4. **Siempre correr `npm run seed:check` sobre el archivo antes de recargar**, para evitar repetir el mismo error.
