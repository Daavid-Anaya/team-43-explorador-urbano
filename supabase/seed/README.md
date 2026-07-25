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

## Carga a Supabase

El JSON no se inserta todavía de forma automática porque la tabla `public.challenges` no tiene aún las columnas `radiusMeters`, `photoPrompt` ni `estimatedMinutes` (ver nota de esquema pendiente en `tasks.md`, tarea 1.3). Una vez que exista la migración que agregue esas columnas, cargar el dataset vía SQL Editor de Supabase o un script de carga que lea `challenges.json` e inserte filas en `public.challenges`.

## Guía de Rollback

Si el dataset cargado tiene errores (coordenadas incorrectas, categoría inválida, duplicados):

1. **No borrar filas con `completions` asociadas.** Si un desafío ya tiene completados de usuarios reales, marcarlo `is_active = false` en lugar de eliminarlo, para no romper la referencia `completions.challenge_id`.
2. **Desafíos sin completados**: se pueden eliminar o actualizar directamente con `update`/`delete` en `public.challenges`.
3. **Restaurar el dataset conocido-bueno**: usar la versión de `challenges.json` en el historial de git (`git log -- supabase/seed/challenges.json`) como fuente de verdad y volver a cargar.
4. **Siempre correr `npm run seed:check` sobre el archivo antes de recargar**, para evitar repetir el mismo error.
