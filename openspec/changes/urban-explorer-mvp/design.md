# Diseño: Urban Explorer MVP

## Enfoque Técnico

Iniciar una SPA React con TypeScript sobre Vite, alojada en Vercel y respaldada por Supabase. Supabase posee auth, tablas Postgres, RLS, storage privado de evidencia y el límite de validación server/DB para completados; React posee descubrimiento, UX de evidencia, visualización de progresión derivada y compartir. Esto reemplaza la dirección superada de AWS/Amplify para reducir el tiempo de setup del hackathon.

## Decisiones de Arquitectura

| Tema | Elección | Alternativas consideradas | Justificación |
|---|---|---|---|
| Stack web | Vite + React + TypeScript | Next.js, HTML plano | Bootstrap rápido de SPA, acceso simple a APIs del navegador, sin necesidad de SSR. |
| Plataforma | Supabase + Vercel | AWS Amplify Gen 2, stack AWS personalizado | Setup más rápido de auth/datos/storage/deploy para la ventana restante del hackathon. |
| Auth | Supabase Auth | Auth personalizado, Cognito | Identidad administrada con integración de sesión simple y soporte de RLS. |
| Límite de completado | RPC/Edge Function de Supabase o función Postgres protegida por RLS | Escrituras solo del cliente | Server/DB valida radio, completado duplicado, evidencia y recompensas derivadas. |
| Storage de evidencia | Bucket privado de Supabase Storage con clave por usuario autenticado | Bucket público, solo metadata | La evidencia fotográfica es sensible y no debe ser pública por defecto. |
| Estado de recompensa | Derivado de completados aceptados y reglas semilla | Puntos/insignias enviados por el cliente | Previene progreso forjado y mantiene las recompensas del MVP visuales/mínimas. |
| Catálogo de desafíos | 8-12 registros semilla de una sola ciudad | UI de admin dinámica, catálogo multi-ciudad | Datos de demo predecibles sin trabajo de backoffice. |
| Herramienta PWA | `vite-plugin-pwa` con Workbox `generateSW` | Workbox `injectManifest` con un service worker personalizado escrito a mano | `generateSW` auto-genera el manifest de precache/routing desde el build de Vite con mínimo código de service worker escrito a mano, lo cual se ajusta al cronograma del hackathon; `injectManifest` se reconsidera solo si surge una necesidad de manejo de fetch personalizado (más allá del cacheo stale-while-revalidate del catálogo y las exclusiones estrictas de auth/storage). |

## Flujo de Datos

```text
Pantallas React -> cliente Supabase -> Auth/Postgres/RLS/Storage
Lista de desafíos -> adaptador de Geolocalización -> ordenamiento local por distancia
Completar -> cámara/selector de archivo -> subida privada de evidencia -> submit_completion
submit_completion -> valida auth/radio/precisión/evidencia/duplicado -> inserta Completion
Vista de progreso -> lee puntos/insignias/historial derivados desde vista de DB o respuesta del servidor
```

Las APIs del navegador se mantienen detrás de adaptadores: `locationService` envuelve los estados de Geolocation, `photoEvidenceService` envuelve la cámara/input de archivo, y `shareService` envuelve Web Share con fallback de copia. La denegación de permisos permite navegar pero bloquea el completado donde sea necesario.

El shell PWA agrega una capa de service worker frente al límite del cliente Supabase: el app shell (HTML/JS/CSS/iconos) se precachea en tiempo de build, y las respuestas de solo lectura del catálogo de desafíos se cachean con una estrategia stale-while-revalidate. Esta capa es estrictamente de solo lectura. Nota de seguridad: el service worker NO DEBE cachear los endpoints de Supabase Auth, ninguna URL privada de evidencia en Storage, ni ninguna respuesta de escritura autenticada; esas solicitudes siempre pasan de largo el caché y van a la red. Las escrituras de completado permanecen online-only por arquitectura, no solo por convención: `submit_completion` es un límite validado server/DB (ver Interfaces / Contratos abajo), así que no hay nada seguro para servir desde caché para una escritura, y el service worker no registra Background Sync para encolar intentos de completado offline.

## Cambios de Archivos

| Archivo | Acción | Descripción |
|------|--------|-------------|
| `package.json` | Crear/Modificar | Scripts React/Vite/TypeScript más scripts de verificación Supabase/Vercel cuando estén disponibles. |
| `src/main.tsx`, `src/app/App.tsx` | Crear | App shell, límite de sesión de auth, rutas. |
| `src/lib/supabase/*` | Crear | Cliente Supabase seguro para navegador usando solo la anon key. |
| `src/features/discovery/*` | Crear | lista, detalle, formato de distancia, estados de permiso. |
| `src/features/completion/*` | Crear | UX de proximidad, subida de foto, flujo de envío. |
| `src/features/progression/*` | Crear | perfil derivado, puntos, insignias, historial, compartir. |
| `src/shared/browser/*` | Crear | adaptadores de geolocalización, foto, compartir. |
| `supabase/migrations/*` | Crear | Tablas, políticas RLS, bucket/políticas de storage, límite de validación de completado. |
| `supabase/seed/challenges.json` | Crear | 8-12 desafíos curados de una sola ciudad. |
| `.env.example`, `README.md`, `vercel.json` | Crear/Modificar | Env público anon, guía de env privado del servidor, docs de despliegue en Vercel. |
| `vite.config.ts` (config del plugin PWA), manifest, iconos, assets de splash, registro/UI de actualización del service worker | Crear | Manifest instalable, app shell precacheado, cacheo runtime de catálogo de solo lectura, indicador offline, prompt de actualización, Share Target opcional. |

## Interfaces / Contratos

Registros centrales: `profiles(user_id, display_name)`, `challenges(...)`, `completions(user_id, challenge_id, completed_at, latitude, longitude, accuracy_meters, evidence_path, points_awarded)`, `badges(...)`. Clave única de completado: `(user_id, challenge_id)`.

Input de `submit_completion`: `{ challengeId, latitude, longitude, accuracyMeters, evidencePath }`. Rechaza usuarios no autenticados, ubicación denegada/faltante, GPS inexacto, intentos fuera de radio, completados duplicados, evidencia faltante/inaccesible-privada, y cualquier campo de recompensa enviado por el cliente. Devuelve el completado aceptado más un resumen de progreso derivado.

Límite de seguridad: Vite solo recibe la URL de Supabase y la anon key. `SUPABASE_SERVICE_ROLE_KEY` está permitida solo en tooling server-side/privado y nunca debe exponerse a través de `VITE_*`, bundles del navegador, o docs versionados con valores reales.

Límite PWA: `submit_completion` sigue siendo la única ruta de escritura de completado y permanece validada server/DB exactamente como se describe arriba, así que siempre se llama online; el service worker nunca intercepta, cachea, ni encola esta llamada, y nunca cachea respuestas de Supabase Auth o Storage privado.

## Estrategia de Testing

| Capa | Qué Testear | Enfoque |
|-------|-------------|----------|
| Unit | matemática de distancia, cálculo derivado de nivel/insignia, validación de seed, estados de permiso | Vitest con funciones puras y adaptadores de navegador mockeados. |
| Integration | RLS, política de storage, validación de completado, sin escrituras de recompensa del cliente | Tests de Supabase local o de contrato SQL/RPC cuando exista tooling. |
| E2E | login, navegar sin ubicación, subir evidencia, completar, fallback de share | Playwright después del bootstrap de la app; mockear geolocalización y subida de archivos. |
| PWA | validez del manifest, flujo de precache/actualización del service worker, renderizado offline del catálogo, bloqueo de completado offline, exclusiones de caché para auth/storage privado | Auditoría Lighthouse PWA más un chequeo de smoke offline enfocado (ej. modo offline de DevTools) después de `npm run build`. |

CI se mantiene ligado a scripts reales de `package.json`. No inventar comandos placeholder.

## Observabilidad del MVP

- Los logs de build/deploy de Vercel son la primera fuente de verdad para fallas de despliegue frontend.
- Los logs de Supabase Auth, base de datos, storage y funciones son la primera fuente de verdad para fallas de validación backend.
- La evidencia manual de smoke debe incluir URL alojada/runtime local, navegador/dispositivo, ruta esperada, resultado y errores de consola si los hay.
- La verificación de demo debe capturar fallas esperadas: completado no autenticado, geolocalización denegada, GPS inexacto, intentos fuera de radio, completado duplicado, evidencia faltante, campos de recompensa forjados, y datos semilla faltantes.

## Matriz de Amenazas

N/A - no hay shell, subproceso, automatización de VCS/PR, clasificación de archivos ejecutables, ni límite de integración de procesos. El ruteo de la app es solo navegación client-side de pantallas; no se introduce ningún límite de ejecución de rutas.

## Migración / Rollout

No se permiten migraciones destructivas de datos de producción en el MVP sin un plan explícito. Iniciar Supabase localmente o en un proyecto descartable primero, sembrar los desafíos de una ciudad desde un archivo conocido-bueno, luego desplegar la SPA a través de Vercel.

Guía de recuperación post-deploy:
- Fallas de frontend: redesplegar el despliegue Vercel conocido-bueno anterior o revertir con un PR pequeño antes de redesplegar.
- Fallas de seed: deshabilitar/remover registros semilla malos mediante una tarea de rollback de seed y restaurar el archivo semilla conocido-bueno.
- Fallas de validación/política de Supabase: preferir un PR pequeño de fix-forward y re-ejecutar evidencia de smoke de migración/política.
- Seguridad de datos: bloquear cambios destructivos de producción a menos que impacto, ruta de backup/restore y aprobación del owner estén documentados primero.

## Límites de Trabajo

- Colaborador A: shell React, límite de sesión Supabase Auth, descubrimiento, adaptador de ubicación.
- Colaborador B: esquema Supabase, RLS, storage, datos semilla, validación de completado.
- Colaborador C: UX de completado, visualización de progresión, compartir, tests.

## Preguntas Abiertas

- [ ] Ciudad exacta y valores del dataset semilla inicial de 8-12 desafíos.
