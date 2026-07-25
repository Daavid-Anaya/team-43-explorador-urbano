# Diseño: Urban Explorer MVP

## Enfoque Técnico

Hacer el bootstrap de una SPA React en TypeScript sobre Vite, alojada en Vercel y respaldada por Supabase. Supabase es responsable de auth, tablas Postgres, RLS, almacenamiento privado de evidencia y el límite de validación del servidor/DB para los completados; React es responsable del descubrimiento, la UX de evidencia, la visualización de la progresión derivada y el compartir. Esto reemplaza la dirección de AWS/Amplify para reducir el tiempo de configuración del hackathon.

## Decisiones de Arquitectura

| Tema | Elección | Alternativas consideradas | Justificación |
|---|---|---|---|
| Stack web | Vite + React + TypeScript | Next.js, HTML plano | Bootstrap rápido de SPA, acceso simple a APIs del navegador, sin necesidad de SSR. |
| Plataforma | Supabase + Vercel | AWS Amplify Gen 2, stack AWS a medida | Configuración más rápida de auth/datos/storage/deploy para la ventana restante del hackathon. |
| Auth | Supabase Auth | Auth a medida, Cognito | Identidad gestionada con integración simple de sesión y soporte de RLS. |
| Límite de completado | Supabase RPC/Edge Function o función Postgres protegida por RLS | Escrituras solo desde el cliente | El servidor/DB valida radio, completado duplicado, evidencia y recompensas derivadas. |
| Storage de evidencia | Bucket privado de Supabase Storage indexado por usuario autenticado | Bucket público, solo metadatos | La evidencia fotográfica es sensible y no debe ser pública por defecto. |
| Estado de recompensa | Derivado de completados aceptados y reglas de semilla | Puntos/badges enviados por el cliente | Evita el progreso falsificado y mantiene las recompensas del MVP visuales/mínimas. |
| Catálogo de desafíos | 8-12 registros semilla de una sola ciudad | UI de admin dinámica, catálogo multi-ciudad | Datos de demo predecibles sin trabajo de backoffice. |

## Flujo de Datos

```text
React screens -> Supabase client -> Auth/Postgres/RLS/Storage
Challenge list -> Geolocation adapter -> local distance sort
Complete -> camera/file picker -> private evidence upload -> submit_completion
submit_completion -> validate auth/radius/accuracy/evidence/duplicate -> insert Completion
Progress view -> read derived points/badges/history from DB view or server response
```

Las APIs del navegador permanecen detrás de adaptadores: `locationService` envuelve los estados de Geolocation, `photoEvidenceService` envuelve la entrada de cámara/archivo y `shareService` envuelve Web Share con fallback de copiado. La denegación de permisos permite navegar pero bloquea el completado donde es requerido.

## Cambios en Archivos

| Archivo | Acción | Descripción |
|------|--------|-------------|
| `package.json` | Crear/Modificar | Scripts de React/Vite/TypeScript más scripts de verificación de Supabase/Vercel cuando estén disponibles. |
| `src/main.tsx`, `src/app/App.tsx` | Crear | Shell de la app, límite de sesión de auth, rutas. |
| `src/lib/supabase/*` | Crear | Cliente Supabase seguro para el navegador usando solo anon key. |
| `src/features/discovery/*` | Crear | lista, detalle, formateo de distancia, estados de permisos. |
| `src/features/completion/*` | Crear | UX de proximidad, subida de foto, flujo de envío. |
| `src/features/progression/*` | Crear | perfil derivado, puntos, badges, historial, compartir. |
| `src/shared/browser/*` | Crear | adaptadores de geolocalización, foto y compartir. |
| `supabase/migrations/*` | Crear | Tablas, políticas RLS, bucket/políticas de storage, límite de validación de completado. |
| `supabase/seed/challenges.json` | Crear | 8-12 desafíos curados de una sola ciudad. |
| `.env.example`, `README.md`, `vercel.json` | Crear/Modificar | Entorno público con anon, guía de entorno privado del servidor, documentación de deploy en Vercel. |

## Interfaces / Contratos

Registros centrales: `profiles(user_id, display_name)`, `challenges(...)`, `completions(user_id, challenge_id, completed_at, latitude, longitude, accuracy_meters, evidence_path, points_awarded)`, `badges(...)`. Clave única de completado: `(user_id, challenge_id)`.

Entrada de `submit_completion`: `{ challengeId, latitude, longitude, accuracyMeters, evidencePath }`. Rechaza usuarios no autenticados, ubicación denegada/ausente, GPS impreciso, intentos fuera del radio, completados duplicados, evidencia ausente/inaccesible de forma privada y cualquier campo de recompensa enviado por el cliente. Devuelve el completado aceptado más el resumen de progreso derivado.

Límite de seguridad: Vite solo recibe la URL de Supabase y la anon key. `SUPABASE_SERVICE_ROLE_KEY` solo se permite en tooling del lado del servidor/privado y nunca debe exponerse a través de `VITE_*`, bundles del navegador ni documentación versionada con valores reales.

## Estrategia de Testing

| Capa | Qué Probar | Enfoque |
|-------|-------------|----------|
| Unit | matemática de distancia, cálculo derivado de nivel/badge, validación de semilla, estados de permisos | Vitest con funciones puras y adaptadores del navegador mockeados. |
| Integración | RLS, política de storage, validación de completado, sin escrituras de recompensa del cliente | Test local de Supabase o tests de contrato SQL/RPC cuando exista el tooling. |
| E2E | login, navegar sin ubicación, subir evidencia, completar, fallback de compartir | Playwright después del bootstrap de la app; mockear geolocalización y subida de archivos. |

CI permanece atado a los scripts reales de `package.json`. No inventar comandos de marcador de posición.

## Observabilidad del MVP

- Los logs de build/deploy de Vercel son la primera fuente de verdad para las fallas de deploy del frontend.
- Los logs de Supabase Auth, base de datos, storage y funciones son la primera fuente de verdad para las fallas de validación del backend.
- La evidencia de smoke manual debe incluir la URL alojada/runtime local, el navegador/dispositivo, la ruta esperada, el resultado y los errores de consola si están presentes.
- La verificación de demo debe capturar las fallas esperadas: completado no autenticado, geolocalización denegada, GPS impreciso, intentos fuera del radio, completado duplicado, evidencia ausente, campos de recompensa falsificados y datos semilla faltantes.

## Matriz de Amenazas

N/A - sin shell, subproceso, automatización de VCS/PR, clasificación de archivos ejecutables ni límite de integración de procesos. El enrutamiento de la app es solo navegación de pantallas del lado del cliente; no se introduce ningún límite de ejecución de rutas.

## Migración / Rollout

No se permiten migraciones destructivas de datos de producción en el MVP sin un plan explícito. Hacer el bootstrap de Supabase localmente o en un proyecto descartable primero, sembrar los desafíos de una sola ciudad desde un archivo conocido como bueno, y luego desplegar la SPA a través de Vercel.

Guía de recuperación post-despliegue:
- Fallas del frontend: redesplegar el despliegue de Vercel previo conocido como bueno o revertir con un PR pequeño antes de redesplegar.
- Fallas de semilla: deshabilitar/eliminar los registros semilla defectuosos mediante una tarea de rollback de semilla y restaurar el archivo semilla conocido como bueno.
- Fallas de validación/política de Supabase: preferir un PR pequeño de corrección hacia adelante y re-ejecutar la evidencia de smoke de migración/política.
- Seguridad de datos: bloquear cambios destructivos de producción a menos que el impacto, la ruta de backup/restore y la aprobación del responsable estén documentados primero.

## Límites de Trabajo

- Colaborador A: shell de React, límite de sesión de Supabase Auth, descubrimiento, adaptador de ubicación.
- Colaborador B: esquema de Supabase, RLS, storage, datos semilla, validación de completado.
- Colaborador C: UX de completado, visualización de progresión, compartir, tests.

## Preguntas Abiertas

- [x] Los valores exactos de la ciudad y del dataset semilla inicial de 8-12 desafíos. Decisión: Ciudad de México, 10 desafíos en `supabase/seed/challenges.json` (2 por categoría).
