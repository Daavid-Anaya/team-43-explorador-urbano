# Tareas: Urban Explorer MVP

## Pronóstico de Carga de Review

| Campo | Valor |
|-------|-------|
| Líneas modificadas estimadas | 1,200-1,800 |
| Riesgo de presupuesto de 400 líneas | Alto |
| PRs encadenados recomendados | Sí |
| División sugerida | PR1 bootstrap+base Supabase -> PR2 flujo de completado -> PR3 progresión+deploy Vercel+demo |
| Estrategia de entrega | auto-chain |
| Estrategia de cadena | feature-branch-chain |
| Estado de CI | Pendiente hasta que PR1 cree scripts reales en `package.json`; no inventar placeholders. |

Decisión necesaria antes de aplicar: Sí - elegir la ciudad exacta y confirmar el dataset semilla inicial de 8-12 desafíos antes de iniciar la tarea 1.4 de PR1.
PRs encadenados recomendados: Sí
Estrategia de cadena: feature-branch-chain
Riesgo de presupuesto de 400 líneas: Alto

### Unidades de Trabajo Sugeridas

| Unidad | Meta | PR probable | Comando de test enfocado | Harness de runtime | Límite de rollback |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Bootstrap de app + ruta de auth/datos/storage/seed de Supabase | PR1 base=rama feature | `npm run test -- app-shell supabase seed` | `npm run dev` + smoke de login/list local/proyecto de Supabase | `package.json`, `src/app`, `src/lib/supabase`, `supabase/{migrations,seed}` |
| 2 | Validación de completado + flujo de subida de evidencia | PR2 base=PR1 | `npm run test -- completion submit-completion` | smoke de completado con geolocalización + subida de archivo mockeados | `src/features/completion`, `src/shared/browser`, límite de validación de `supabase/migrations` |
| 3 | Progresión, compartir, shell PWA instalable/offline-read, deploy Vercel, pulido de demo | PR3 base=PR2 | `npm run test -- progression e2e` | `npm run build` + auditoría Lighthouse PWA + checklist de demo alojado en Vercel | `src/features/progression`, `playwright`, manifest/service worker/iconos PWA, docs/config de deploy |

## Lanes de Responsables

- Dev A: shell frontend, límite de sesión Supabase Auth, descubrimiento.
- Dev B: esquema Supabase, RLS, storage, seed, validación de completado, env/deploy de Vercel.
- Dev C: UX de completado, visualización de progresión, tests, demo.

## Fase 1: Fundación / Bootstrap

- [ ] 1.1 [A] Crear `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/app/App.tsx`; AC: la app arranca y existen scripts reales para los gates disponibles; Verificar: `npm install && npm run dev`.
- [ ] 1.2 [B] Crear `src/lib/supabase/*`, `.env.example`, y `supabase/migrations/*` para perfiles de Auth, desafíos, completados, storage privado de evidencia, y RLS; AC: el cliente del navegador usa solo la anon key y el service role está ausente del env del cliente; Verificar: smoke local/proyecto de Supabase cuando esté configurado.
- [ ] 1.3 [A] Agregar pantallas de login/signup y un contexto de sesión usando Supabase Auth con email+password (ej. `src/features/auth/*`), consumiendo el cliente Supabase del navegador creado en 1.2; Dependencia: el cliente `src/lib/supabase` de 1.2 debe existir primero; AC: un visitante puede crear o reanudar una sesión autenticada según `specs/user-identity/spec.md` (el login crea/recupera un perfil e inicia una sesión), un visitante anónimo ve un requerimiento claro de inicio de sesión antes de cualquier acción de persistencia, y no se duplica trabajo de esquema/RLS/migración de Supabase aquí (eso es propiedad de 1.2); Verificar: `npm run test -- auth login`.
- [ ] 1.4 [B] Agregar `supabase/seed/challenges.json` más ruta de validación; Dependencia: ciudad exacta y dataset semilla aprobados; AC: 8-12 desafíos de una sola ciudad usan campos/categorías aceptados y existe guía de rollback de seed; Verificar: `npm run seed:check`.
- [ ] 1.5 [B+C] Agregar reglas de progresión derivadas sin recompensas escribibles por el cliente; AC: puntos/insignias se derivan de completados aceptados; Verificar: `npm run test -- progressionRules`.
- [ ] 1.6 [A+B+C] Agregar `.github/workflows/*` de CI una vez que existan scripts npm; AC: el workflow corre gates reales de build/test/lint/typecheck y documenta gates omitidos; Verificar: inspeccionar el workflow más el primer check run del PR.
- [ ] 1.7 [A] Agregar `vite-plugin-pwa` (Workbox `generateSW`) con Web App Manifest (name, short_name, iconos 192/512/maskable, theme_color, background_color, `display: standalone`, `start_url`, orientation) y assets de splash iOS/Android; AC: la app califica como instalable según `specs/pwa-shell/spec.md` y el app shell precachea en el build; Verificar: `npm run build` luego auditoría Lighthouse PWA.

## Fase 2: Lanes de Features

- [ ] 2.1 [A] Agregar `src/features/discovery/*` y `src/shared/browser/locationService.ts`; AC: lista ordenada, fallback de navegación con permiso denegado, vista de detalle; Verificar: `npm run test -- discovery location`.
- [ ] 2.2 [B] Agregar tests de contrato RED para casos no autenticado, fuera-de-radio-de-80m, precisión GPS mayor a 100m, duplicado, evidencia faltante, recompensas forjadas, y denegación de RLS; Verificar: `npm run test -- submit-completion` falla primero.
- [ ] 2.3 [B] Implementar la validación de completado de Supabase vía RPC/Edge Function o función Postgres más políticas de RLS/storage; AC: valida auth, radio, precisión GPS, evidencia, prevención de duplicado, y recompensas derivadas; Verificar: `npm run test -- submit-completion` pasa.
- [ ] 2.4 [C] Agregar `src/shared/browser/photoEvidenceService.ts` y `src/features/completion/*`; AC: subida privada de evidencia, bloqueo con permiso denegado, reintento sin completado duplicado; Verificar: `npm run test -- completion photo`.
- [ ] 2.5 [C] Agregar `src/features/progression/*` y `src/shared/browser/shareService.ts`; AC: restauración de puntos/insignias/historial derivados y fallback de share nativo funcionan; Verificar: `npm run test -- progression share`.

## Fase 2b: Shell PWA de Lectura Offline

- [ ] 2.6 [A] Agregar cacheo en runtime (stale-while-revalidate) para el catálogo de desafíos de solo lectura y un indicador de estado offline; excluir explícitamente los endpoints de Supabase Auth, `submit_completion`, y cualquier URL privada de evidencia en Storage del caché del service worker; AC: el catálogo se renderiza offline tras una visita online previa y el completado se bloquea (nunca se encola) offline según `specs/pwa-shell/spec.md`; Verificar: `npm run build` luego smoke offline manual (modo offline de DevTools: navegar catálogo cacheado, intentar completado, confirmar mensaje de bloqueo).
- [ ] 2.7 [A] Agregar detección de actualización del service worker y un prompt de actualización personalizado, más un prompt de instalación personalizado vía `beforeinstallprompt`; AC: las nuevas versiones de SW muestran un prompt antes de activarse, el prompt de instalación no bloquea el uso cuando no está soportado; Verificar: `npm run build` luego smoke manual del flujo de actualización (incrementar asset, recargar, confirmar prompt).
- [ ] 2.8 [C] Agregar Web Share Target opcional acotado solo a compartir logros; AC: el contenido compartido abre el contexto de compartir logro y nunca dispara un envío de completado; Verificar: smoke manual de share-target en una plataforma/emulador compatible.

## Fase 3: Integración / Verificación / Demo

- [ ] 3.1 [A+C] Cablear estado de sesión de Supabase, guardas de auth, y refresco de perfil en `src/app/App.tsx`; AC: los flujos persistidos requieren login y los fallbacks de navegación coinciden con las specs; Verificar: `npm run test -- auth app`.
- [ ] 3.2 [C] Agregar flujos de Playwright en `playwright/e2e/urban-explorer.spec.ts`; AC: login, navegar sin ubicación, subida de evidencia/completado, fallback de share; Verificar: `npm run test:e2e`.
- [ ] 3.3 [B] Agregar scripts/docs de despliegue Vercel/Supabase en `package.json`, `vercel.json`, `.env.example`, `README.md`; AC: pasos de build/deploy, logs de Vercel, logs de Supabase, seguridad de env, y rollback están documentados; Verificar: `npm run build` más dry run de deploy cuando esté configurado.
- [ ] 3.4 [A+B+C] Crear `docs/demo-checklist.md`; AC: ciudad semilla, ruta de smoke, fallas esperadas, chequeo de seguridad del service-role, notas de rollback, guía de fix-forward de política/función, chequeo de instalación PWA, y chequeo de lectura-offline/bloqueo-de-completado-offline están documentados; Verificar: revisión manual del runbook de demo más auditoría Lighthouse PWA en la URL desplegada.
