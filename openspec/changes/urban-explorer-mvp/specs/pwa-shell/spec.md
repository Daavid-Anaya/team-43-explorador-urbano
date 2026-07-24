# Especificación del Shell PWA

## Propósito

Definir un shell de Progressive Web App instalable con soporte offline de solo lectura para el catálogo curado de desafíos. Esta spec no cambia el límite de completado server-side: completar un desafío siempre requiere acceso a red.

## Requisitos

### Requisito: Web App Manifest Instalable

El sistema MUST distribuir un Web App Manifest declarando `name`, `short_name`, `start_url`, `display: standalone`, `orientation`, `theme_color`, `background_color`, y iconos en 192x192 y 512x512 incluyendo una variante de icono maskable.

#### Escenario: El usuario instala la app

- GIVEN un usuario abre la app desplegada en un navegador compatible
- WHEN el navegador evalúa los criterios de instalabilidad contra el manifest y el service worker
- THEN la app califica como instalable
- AND la app instalada se lanza en modo standalone con el theme e iconos configurados

#### Escenario: Las pantallas de splash de iOS y Android se renderizan al lanzar

- GIVEN un usuario instaló la app en iOS o Android
- WHEN el usuario lanza la app instalada
- THEN la plataforma muestra una pantalla de splash derivada de la configuración de manifest/meta para esa plataforma
- AND el app shell carga sin un flash de pantalla blanca antes del primer pintado

### Requisito: Prompt de Instalación Personalizado

El sistema SHOULD presentar un prompt de instalación personalizado usando el evento `beforeinstallprompt` en navegadores compatibles, y MUST NOT bloquear el uso central de la app cuando el prompt nativo no esté disponible o sea descartado.

#### Escenario: El usuario acepta el prompt de instalación personalizado

- GIVEN un navegador compatible dispara `beforeinstallprompt`
- WHEN el usuario acepta el call-to-action de instalación personalizado de la app
- THEN el sistema dispara el flujo de instalación nativo diferido
- AND el prompt personalizado no reaparece después de la instalación

#### Escenario: El prompt de instalación no está soportado

- GIVEN un navegador que nunca dispara `beforeinstallprompt`
- WHEN el usuario navega la app
- THEN la app permanece completamente usable online
- AND ningún call-to-action de instalación bloquea la navegación o el descubrimiento de desafíos

### Requisito: App Shell Precacheado

El sistema MUST registrar un service worker que precachee el app shell (entrada HTML, bundles core de JS/CSS, e iconos estáticos) de forma que el shell mismo cargue sin acceso a red después de la primera carga exitosa.

#### Escenario: El app shell abre sin red

- GIVEN un usuario previamente cargó la app una vez con acceso a red y el service worker se activó
- WHEN el usuario abre la app sin conexión de red
- THEN el app shell se renderiza desde el precache
- AND la navegación central (lista de descubrimiento, vista de detalle, vista de progresión) es alcanzable

### Requisito: Cacheo en Runtime de Solo Lectura del Catálogo de Desafíos

El sistema MUST cachear las respuestas de solo lectura del catálogo de desafíos (lista de desafíos y datos de detalle de desafío) usando una estrategia stale-while-revalidate de forma que los datos del catálogo previamente vistos permanezcan visibles offline.

El sistema MUST NOT cachear endpoints de escritura autenticados, el límite de envío de completado (`submit_completion`), ni ninguna URL privada de evidencia de Supabase Storage. El service worker MUST NOT usar la API de Background Sync para encolar intentos de completado offline.

#### Escenario: El catálogo es visible offline después de una visita previa

- GIVEN un usuario navegó el catálogo de desafíos online al menos una vez
- WHEN el usuario reabre la lista de desafíos sin acceso a red
- THEN el sistema muestra los datos del catálogo cacheados más recientes
- AND el sistema indica que los datos pueden estar obsoletos hasta que retorne la conectividad

#### Escenario: Completar un desafío está bloqueado offline

- GIVEN un usuario sin acceso a red abre una vista de detalle de desafío
- WHEN el usuario intenta enviar evidencia de completado
- THEN el sistema bloquea el envío antes de llamar a `submit_completion`
- AND el usuario ve un mensaje claro de que completar un desafío requiere conexión a internet
- AND el intento nunca se encola ni se reintenta en segundo plano

#### Escenario: La evidencia privada y las rutas de auth nunca se cachean

- GIVEN el service worker evalúa una solicitud de fetch
- WHEN la solicitud apunta a un endpoint autenticado de Supabase Auth o una URL privada de evidencia en Storage
- THEN el service worker no sirve ni almacena una respuesta cacheada para esa solicitud
- AND la solicitud siempre va a la red

### Requisito: Indicación de Estado Offline

El sistema MUST mostrar un indicador claro de offline o un estado offline dedicado cuando el usuario no tenga conexión de red, distinguiendo el contenido navegable cacheado de las acciones que requieren conectividad.

#### Escenario: El usuario pierde conectividad a mitad de sesión

- GIVEN un usuario está usando activamente la app instalada
- WHEN el dispositivo pierde conectividad de red
- THEN el sistema muestra un indicador offline
- AND las vistas de solo lectura cacheadas permanecen alcanzables mientras las acciones de escritura están visiblemente deshabilitadas o explicadas

### Requisito: Flujo de Actualización del Service Worker

El sistema MUST detectar una nueva versión de service worker y solicitar al usuario que actualice en lugar de aplicar silenciosamente una nueva versión que podría servir assets de app-shell desincronizados.

#### Escenario: Hay una nueva versión disponible

- GIVEN se desplegó una nueva versión de service worker
- WHEN la app instalada detecta la nueva versión en espera
- THEN el sistema muestra un prompt de actualización disponible
- AND aceptar el prompt activa el nuevo service worker y recarga el app shell

### Requisito: Share Target Opcional

El sistema MAY registrar un Web Share Target de forma que las plataformas compatibles puedan compartir contenido hacia la app, acotado a compartir un resumen de logro completado; esto MUST NOT usarse para enviar completados de desafío o evidencia.

#### Escenario: El usuario comparte hacia la app vía Share Target

- GIVEN la app declaró un `share_target` en el manifest en una plataforma compatible
- WHEN el usuario comparte texto o un link hacia la app instalada
- THEN el sistema abre el contexto de compartir logro con el contenido compartido
- AND el contenido compartido nunca dispara un envío de completado de desafío

## No-Objetivos

- Sin sincronización de escritura completa offline-first. Encolar completados de desafío offline (vía API de Background Sync o de otra forma) está explícitamente fuera de alcance y MUST NOT implementarse bajo esta spec.
- Sin cacheo offline de datos autenticados o privados (respuestas de Supabase Auth, evidencia privada en Storage, escrituras de perfil de usuario).
