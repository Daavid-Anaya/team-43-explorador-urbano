# Propuesta: Urban Explorer MVP

## Intención

Construir una aplicación web lista para hackathon para explorer urbanos. Los usuarios descubren 8-12 desafíos curados de una sola ciudad, prueban sus visitas con geolocalización más evidencia fotográfica, ven progreso derivado y comparten logros. La plataforma aceptada es Supabase para auth/datos/storage y Vercel para hosting, para reducir el tiempo de setup respecto al plan superado de AWS/Amplify.

## Alcance

### Dentro de Alcance
- Catálogo de desafíos curados de una sola ciudad, ordenado por distancia cuando hay ubicación disponible.
- Identidad con Supabase Auth, perfil de usuario, historial de completados y puntos/insignias derivados visualmente.
- Envío de completado usando chequeos de proximidad más evidencia fotográfica subida.
- Contrato fijo de desafío MVP: `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, `estimatedMinutes`.
- Validación mínima de completado derivada de servidor/DB; los clientes nunca deben enviar recompensas, puntos ni insignias.
- Aplicación web alojada en Vercel con configuración de entorno Supabase.
- Compartir nativo de logros completados cuando esté disponible.
- Shell PWA instalable con acceso offline de solo lectura al catálogo de desafíos cacheado (manifest, service worker, app shell precacheado, prompt de actualización); completar un desafío siempre requiere conexión.

### Fuera de Alcance
- Soporte multi-ciudad, descubrimiento centrado en mapa, cobertura global de ciudades y desafíos generados por usuarios.
- Gestión dinámica del catálogo de desafíos.
- Multijugador en tiempo real, feeds sociales, leaderboards más allá del progreso básico.
- Anti-cheat complejo, detección avanzada de fraude, moderación de fotos y sincronización completa offline-first.
- Sincronización completa offline-first: sin encolado vía Background Sync de completados offline, y sin escrituras offline de ningún tipo. La validación de completado permanece 100% server-side (`submit_completion`) y por lo tanto siempre requiere conectividad.
- Trabajo de implementación AWS/Amplify; esa dirección quedó superada.

## Capacidades

### Capacidades Nuevas
- `user-identity`: login simple, perfil de usuario y propiedad de progreso autenticado.
- `challenge-discovery`: lista curada de desafíos de una ciudad con distancia y vista de detalle.
- `challenge-completion`: validación de proximidad por geolocalización más captura/envío de evidencia fotográfica.
- `progression-sharing`: puntos derivados, insignias, historial de completados y compartir logros.
- `supabase-vercel-platform`: Supabase Auth/Postgres/RLS/Storage, validación segura server/DB, hosting en Vercel, datos semilla y configuración de entorno.
- `pwa-shell`: Web App Manifest instalable, service worker con app shell precacheado, cacheo de catálogo de solo lectura con stale-while-revalidate, indicación de estado offline, prompt de actualización y Share Target opcional; sin encolado de escritura/completado offline.

### Capacidades Modificadas
- Ninguna.

## Enfoque

Usar el MVP de plataforma administrada liviana: app Vite React en Vercel, Supabase Auth para identidad, Postgres con RLS para desafíos/perfiles/completados, Supabase Storage para evidencia privada, y validación server/DB-side para completado y recompensas derivadas. Mantener la validación de prueba mínima: usuario autenticado + `radiusMeters = 80` + `maxGpsAccuracyMeters = 100` + evidencia fotográfica subida obligatoria + rechazo de completado duplicado.

Decisiones base aceptadas:
- Persona del MVP: explorer urbano.
- Primer slice funcional: auth + desafíos + subida de evidencia.
- Alcance de ciudad: MVP de una sola ciudad con 8-12 desafíos curados manualmente.
- Categorías de desafío: Art, History, Nature, Landmark, Hidden Gem.
- Progresión: solo visual/derivada para el MVP; puntos/insignias enviados por el cliente son inválidos.

## Áreas Afectadas

| Área | Impacto | Descripción |
|------|--------|-------------|
| `src/app` | Nuevo | UI de descubrimiento, auth, completado, progresión |
| `src/lib/supabase`, `supabase/*` | Nuevo | Límite del cliente Supabase, esquema, RLS, seed, storage y contratos de validación server/DB |
| `vercel.json`, `.env.example`, `README.md` | Nuevo/Modificado | Guía de despliegue Vercel y configuración de entorno |
| Shell PWA (manifest, service worker, iconos) | Nuevo | App shell instalable y cacheo offline de solo lectura del catálogo |
| `openspec/changes/urban-explorer-mvp` | Modificado | Artefactos de propuesta/spec/diseño/tareas |

## Supuestos y Decisiones Abiertas

- Supuesto: el contenido de los desafíos es curado y sembrado por el equipo.
- Supuesto: el anti-cheat del MVP es suficientemente bueno, no de nivel producción.
- Abierto: ciudad exacta y valores iniciales del dataset de POI.

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|------|------------|------------|
| Permisos de GPS/foto rompen el completado | Media | estados de error claros y rutas de reintento |
| Las políticas de Supabase confían accidentalmente en input del cliente | Alta | RLS y validación server/DB; sin recompensas/progreso enviados por el cliente |
| El service role se filtra al cliente | Alta | service role solo en entorno server-side/privado; nunca exponer `SUPABASE_SERVICE_ROLE_KEY` a Vite |
| El alcance se expande entre 3 desarrolladores | Alta | dividir por capacidades y proteger reviews de 400 líneas |

## Plan de Rollback

Antes del merge, remover los artefactos de cambio y cualquier slice de app/plataforma generado de la rama feature si la dirección del MVP se abandona.

Después del despliegue, usar la ruta de recuperación más pequeña y segura:
- Falla de despliegue frontend: redesplegar el despliegue Vercel conocido-bueno anterior cuando esté disponible, o revertir con un PR pequeño y redesplegar.
- Falla de datos semilla: deshabilitar/remover registros semilla malos mediante una tarea de rollback de seed y restaurar el archivo semilla conocido-bueno.
- Falla de política/función de Supabase: arreglar hacia adelante con un PR pequeño, reaplicar migraciones/configuración y capturar evidencia de smoke.
- Seguridad de datos de producción: no se permiten migraciones destructivas de datos de producción sin un plan explícito de migración y recuperación.

## Dependencias

- Acceso al proyecto Supabase para Auth, Postgres, RLS, Storage y variables de entorno server-side.
- Acceso al proyecto Vercel y configuración del entorno de despliegue.
- Permisos de geolocalización y cámara/archivo del navegador.
- Dataset semilla curado de POI/desafíos de una sola ciudad.

## Criterios de Éxito

- [ ] Un usuario logueado puede ver desafíos cercanos como una lista ordenada por distancia.
- [ ] Un usuario puede subir evidencia fotográfica y completar un desafío tras validación server/DB.
- [ ] El progreso muestra puntos/insignias/historial derivados e ignora datos de recompensa enviados por el cliente.
- [ ] El MVP es desplegable en Vercel con auth/datos/storage respaldados por Supabase y repartible en tareas entre 3 desarrolladores.
