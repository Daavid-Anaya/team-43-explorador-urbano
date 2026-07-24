# Despliegue en Vercel

Guía para publicar **Explorador Urbano** en Vercel y verlo en el celular. Este alcance
NO incluye Supabase: solo se publica el shell PWA actual para poder verlo desplegado e
iterar sobre ajustes visuales.

## Resumen rápido

- **Método:** integración con Git (dashboard de vercel.com).
- **Rama de producción:** `fix/spa-to-pwa` (es la que tiene todo pusheado en GitHub).
- **Framework:** Vite (Vercel lo detecta solo).
- **Build:** `npm run build` · **Output:** `dist/`.
- **Variables de entorno:** ninguna en este alcance (Supabase todavía no está cableado).

## Requisito previo

La rama que Vercel construya debe estar pusheada a GitHub. `fix/spa-to-pwa` ya lo está.
No se usa `main` porque `origin/main` aún no contiene el commit de la PWA.

## Estado actual: deploy pendiente (bloqueado)

**Intentado el 2026-07-24, no completado.** El import a Vercel vía git integration
falló porque el repo `team-43-explorador-urbano` vive bajo la cuenta de GitHub de un
compañero de equipo (`github.com/Daavid-Anaya/team-43-explorador-urbano`), y no bajo la
cuenta/org con la que se autorizó la Vercel GitHub App (`No-Country-simulation`). Al
buscar el repo en el importador de Vercel, no aparecía ("No Results Found") aunque el
usuario tuviera acceso de colaborador al repo.

**Causa raíz:** instalar/otorgar acceso a la Vercel GitHub App sobre un repositorio
requiere permisos de **administrador** sobre ese repo. Ser colaborador no alcanza.

**Para desbloquear, dos caminos (pendiente de decisión del equipo):**

1. **Preferido:** el dueño del repo (`Daavid-Anaya`) instala la Vercel GitHub App en
   `github.com/apps/vercel`, eligiendo "Only select repositories" →
   `team-43-explorador-urbano`. Así se despliega el repo real del equipo.
2. **Alternativa rápida:** hacer un fork del repo a una cuenta con permisos de admin
   (por ejemplo la del usuario que va a desplegar) e importar ese fork en Vercel. Contra:
   es una copia separada, no se actualiza sola con el repo original.

Ninguno de los dos pasos se ejecutó todavía. El resto de esta guía queda igual para
cuando se retome.

## Pasos en el dashboard de Vercel

1. Entrar a https://vercel.com e iniciar sesión con la cuenta de GitHub.
2. **Add New… → Project** e importar el repositorio `team-43-explorador-urbano`.
3. Vercel detecta **Vite** automáticamente. Confirmar:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Deploy.** Al terminar, Vercel entrega una URL pública `*.vercel.app`.
5. En **Settings → Git**, fijar **Production Branch = `fix/spa-to-pwa`** para que los
   deploys de producción salgan de esa rama. Cada push a esa rama vuelve a desplegar.

## Verificación

- El build de Vercel figura como exitoso y hay una URL `*.vercel.app`.
- Abrir la URL en el navegador: la app carga sin errores en la consola.
- Abrir la URL en el **celular**: como Vercel sirve por HTTPS, aparece la opción de
  **instalar** la PWA.
- (Opcional) Correr una auditoría Lighthouse PWA sobre la URL desplegada.

---

## Aclaración: PWA y SPA no son lo mismo

Esta app es **las dos cosas a la vez**, pero son conceptos independientes:

- **SPA (Single Page Application)** describe la **arquitectura**: existe un solo archivo
  `index.html` y el JavaScript maneja la navegación del lado del cliente. El servidor
  solo tiene ese HTML.
- **PWA (Progressive Web App)** describe las **capacidades**: se puede instalar (Web App
  Manifest) y funciona offline (service worker), siempre sobre HTTPS.

Son ejes que no se implican entre sí: puede haber una SPA que no es PWA, y una PWA que no
es SPA. En este proyecto conviven ambos:

| Concepto | En esta app | Consecuencia práctica |
|----------|-------------|-----------------------|
| PWA | `vite-plugin-pwa` (manifest + service worker) | Necesita **HTTPS** → lo provee Vercel |
| SPA | React con un único `index.html` | Requerirá **SPA rewrite** cuando haya ruteo |

## Qué es el "SPA rewrite" y cuándo se necesita

Hoy **NO hace falta**: `src/app/App.tsx` no tiene router, así que la única ruta es `/`.

El problema aparece cuando se agregue ruteo del lado del cliente (por ejemplo rutas como
`/perfil` o `/desafio/5`). Navegar dentro de la app funciona porque lo resuelve el JS,
pero si el usuario **recarga** (F5) estando en `/perfil`, el navegador le pide ese path
al servidor, que busca un archivo `perfil` inexistente → **404**.

El rewrite le indica a Vercel que sirva `index.html` para cualquier path, dejando que el
JS resuelva la ruta. Se configura creando un `vercel.json` en la raíz:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Regla:** agregar este `vercel.json` recién cuando se introduzca un router client-side.

## Cuando se integre Supabase (futuro)

Recién en ese momento habrá que cargar variables de entorno en Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Nunca cargar `SUPABASE_SERVICE_ROLE_KEY` como variable expuesta al cliente (`VITE_*`).
