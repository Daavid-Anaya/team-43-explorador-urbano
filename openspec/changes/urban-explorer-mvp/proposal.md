# Propuesta: Urban Explorer MVP

## Intención

Construir una aplicación web lista para hackathon para exploradores urbanos. Los usuarios descubren 8-12 desafíos curados de una sola ciudad, prueban las visitas con geolocalización más evidencia fotográfica, ven el progreso derivado y comparten logros. La plataforma aceptada es Supabase para auth/datos/storage y Vercel para hosting, con el fin de reducir el tiempo de configuración frente al plan de AWS/Amplify que queda reemplazado.

## Alcance

### En Alcance
- Catálogo curado de desafíos de una sola ciudad, ordenado por distancia cuando la ubicación está disponible.
- Identidad con Supabase Auth, perfil de usuario, historial de completados y puntos/badges derivados visuales.
- Envío de completado usando verificaciones de proximidad más evidencia fotográfica subida.
- Contrato fijo de challenge para el MVP: `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, `estimatedMinutes`.
- Validación mínima de completado derivada del servidor/DB; los clientes nunca deben enviar recompensas, puntos ni badges.
- Aplicación web alojada en Vercel con configuración de entorno de Supabase.
- Compartir de forma nativa los logros completados cuando esté soportado.

### Fuera de Alcance
- Soporte multi-ciudad, descubrimiento centrado en mapa, cobertura global de ciudades y desafíos generados por usuarios.
- Gestión dinámica del catálogo de desafíos.
- Multijugador en tiempo real, feeds sociales, leaderboards más allá del progreso básico.
- Anti-cheat complejo, detección avanzada de fraude, moderación de fotos y sincronización offline-first completa.
- Trabajo de implementación con AWS/Amplify; esa dirección queda reemplazada.

## Capacidades

### Nuevas Capacidades
- `user-identity`: login simple, perfil de usuario y propiedad autenticada del progreso.
- `challenge-discovery`: lista curada de desafíos de una sola ciudad con visualización de distancia y vista de detalle.
- `challenge-completion`: validación de proximidad por geolocalización más captura/envío de evidencia fotográfica.
- `progression-sharing`: puntos derivados, badges, historial de completados y compartir logros.
- `supabase-vercel-platform`: Supabase Auth/Postgres/RLS/Storage, validación segura del servidor/DB, hosting en Vercel, datos semilla y configuración de entorno.

### Capacidades Modificadas
- Ninguna.

## Enfoque

Usar el MVP liviano de plataforma gestionada: aplicación Vite React en Vercel, Supabase Auth para identidad, Postgres con RLS para desafíos/perfiles/completados, Supabase Storage para evidencia privada y validación del lado del servidor/DB para el completado y las recompensas derivadas. Mantener la validación de prueba al mínimo: usuario autenticado + `radiusMeters = 80` + `maxGpsAccuracyMeters = 100` + evidencia fotográfica subida requerida + rechazo de completado duplicado.

Decisiones base aceptadas:
- Persona del MVP: explorador urbano.
- Primer slice funcional: auth + desafíos + subida de evidencia.
- Alcance de ciudad: MVP de una sola ciudad con 8-12 desafíos curados manualmente.
- Categorías de desafíos: Art, History, Nature, Landmark, Hidden Gem.
- Progresión: solo visual/derivada para el MVP; los puntos/badges enviados por el cliente son inválidos.

## Áreas Afectadas

| Área | Impacto | Descripción |
|------|--------|-------------|
| `src/app` | Nuevo | UI de descubrimiento, auth, completado y progresión |
| `src/lib/supabase`, `supabase/*` | Nuevo | Límite del cliente Supabase, esquema, RLS, semilla, storage y contratos de validación del servidor/DB |
| `vercel.json`, `.env.example`, `README.md` | Nuevo/Modificado | Guía de despliegue en Vercel y de entorno |
| `openspec/changes/urban-explorer-mvp` | Modificado | Artefactos proposal/spec/design/tasks |

## Supuestos y Decisiones Abiertas

- Supuesto: el contenido de los desafíos es curado y sembrado por el equipo.
- Supuesto: el anti-cheat del MVP es suficientemente bueno, no de nivel producción.
- Abierto: los valores exactos de la ciudad y del dataset inicial de POI.

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|------|------------|------------|
| Los permisos de GPS/foto rompen el completado | Media | estados de error claros y rutas de reintento |
| Las políticas de Supabase confían accidentalmente en la entrada del cliente | Alta | RLS y validación del servidor/DB; sin recompensas/progreso enviados por el cliente |
| La clave service role se filtra al cliente | Alta | service role solo en entorno del lado del servidor/privado; nunca exponer `SUPABASE_SERVICE_ROLE_KEY` a Vite |
| El alcance se expande entre 3 desarrolladores | Alta | dividir por capacidades y proteger reviews de 400 líneas |

## Plan de Rollback

Antes del merge, eliminar los artefactos del cambio y cualquier slice de app/plataforma generado de la rama de feature si se abandona la dirección del MVP.

Después del despliegue, usar la ruta de recuperación segura más pequeña:
- Falla de deploy del frontend: redesplegar el despliegue de Vercel previo conocido como bueno cuando esté disponible, o revertir con un PR pequeño y redesplegar.
- Falla de datos semilla: deshabilitar/eliminar los registros semilla defectuosos mediante una tarea de rollback de semilla y restaurar el archivo semilla conocido como bueno.
- Falla de política/función de Supabase: corregir hacia adelante con un PR pequeño, reaplicar migraciones/config y capturar evidencia de smoke.
- Seguridad de datos de producción: no se permiten migraciones destructivas de datos de producción sin un plan explícito de migración y recuperación.

## Dependencias

- Acceso al proyecto Supabase para Auth, Postgres, RLS, Storage y variables de entorno del lado del servidor.
- Acceso al proyecto Vercel y configuración del entorno de despliegue.
- Permisos del navegador de Geolocation y de cámara/archivo.
- Dataset semilla curado de POI/desafíos de una sola ciudad.

## Criterios de Éxito

- [ ] Un usuario logueado puede ver los desafíos cercanos como una lista ordenada por distancia.
- [ ] Un usuario puede subir evidencia fotográfica y completar un desafío tras la validación del servidor/DB.
- [ ] El progreso muestra puntos/badges/historial derivados e ignora los datos de recompensa enviados por el cliente.
- [ ] El MVP es desplegable en Vercel con auth/datos/storage respaldados por Supabase y se puede repartir en tareas entre 3 desarrolladores.
