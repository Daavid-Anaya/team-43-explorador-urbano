## Exploración: urban-explorer-mvp

### Estado Actual
El repositorio todavía está en estado de bootstrap. Hoy contiene solo metadatos `.atl/` y artefactos `openspec/` inicializados; aún no existe código fuente de aplicación, código de despliegue, manifiesto de paquetes ni test runner.

Para este cambio, el objetivo de producto es una aplicación web lista para hackathon que se sienta original, sea usable por usuarios finales reales y pueda publicarse rápidamente sin sobreingeniería. El mejor objetivo de MVP es un loop de exploración de ciudad: descubrir lugares cercanos, completar un desafío a pie, probar la llegada, ganar progresión y compartir el resultado.

### Áreas Afectadas
- `openspec/config.yaml` — restringe esta fase a artefactos en inglés, delegación entre 3 desarrolladores y una mentalidad de review de ~400 líneas.
- `openspec/changes/urban-explorer-mvp/exploration.md` — artefacto de exploración para las fases posteriores de proposal/spec/design/tasks.
- Las rutas de bootstrap de la app aún no se crean — las carpetas de frontend, API, persistencia e infraestructura permanecen por definir porque no se ha elegido ningún stack en el repositorio.

### Enfoques
1. **MVP estático centrado en el navegador** — Frontend estático con estado solo local, APIs del navegador y backend mínimo o inexistente.
   - Ventajas: El más rápido de demostrar, el más barato de alojar, fuerte novedad de hackathon a través de las capacidades del dispositivo.
   - Desventajas: Persistencia débil, controles anti-cheat limitados, mala continuidad multi-dispositivo, la personalización de rutas se vuelve superficial.
   - Esfuerzo: Bajo

2. **MVP liviano de plataforma gestionada** — Frontend web más un pequeño backend gestionado para el estado de los desafíos, la evidencia, el progreso y la identidad.
   - Ventajas: El mejor equilibrio para un producto publicable, soporta persistencia y progresión, y sigue siendo lo bastante rápido para un equipo de 3 personas.
   - Desventajas: Agrega trabajo de modelado de API/datos, la validación de prueba sigue basada en confianza a menos que se mantenga simple, la auth puede consumir tiempo si se incluye demasiado pronto.
   - Esfuerzo: Medio

3. **MVP de plataforma social completa** — Competencia en tiempo real, personalización compleja, feeds sociales, moderación y evidencia de medios enriquecidos.
   - Ventajas: El mayor potencial de producto a largo plazo.
   - Desventajas: Demasiado grande para el alcance de hackathon, alto riesgo de presupuesto de review, probable dilución del loop central del desafío a pie.
   - Esfuerzo: Alto

### Recomendación
Elegir **MVP liviano de plataforma gestionada** con un límite implacable alrededor del loop central.

> Nota histórica: fases posteriores de SDD acotaron el MVP aceptado a geolocalización + evidencia fotográfica, un catálogo curado de una sola ciudad, sin personalización de rutas en la primera versión, y Supabase + Vercel en lugar de AWS/Amplify. Usar `proposal.md`, `design.md`, `specs/*/spec.md` y `tasks.md` como la fuente de verdad actual.

**Alcance histórico del MVP considerado durante la exploración**
- Usuarios objetivo: caminantes urbanos curiosos, turistas, estudiantes y grupos de amigos que quieren una razón lúdica para explorar lugares cercanos.
- Problema central de producto: el descubrimiento de la ciudad suele ser pasivo y no estructurado; los usuarios necesitan un loop de desafíos liviano que convierta caminar en un juego gratificante.
- Loop del MVP: abrir la app → ver desafíos curados cercanos → navegar hacia un lugar → confirmar el completado → ganar progreso de puntos/badge → compartir el logro.

**Funcionalidades del MVP que DEBERÍAN estar en alcance**
- Lista de desafíos cercanos basada en puntos de interés curados.
- Confirmación de llegada con la **Geolocation API** usando verificaciones de proximidad basadas en radio.
- Recomendación reemplazada: un modo de prueba principal para el MVP se planteó originalmente como **escaneo de QR** O **captura de foto**. Fases posteriores de SDD seleccionaron geolocalización + evidencia fotográfica y sacaron el escaneo de QR de la guía activa del MVP.
- Puntos, badges y progresión de nivel básica.
- Recomendación reemplazada: durante la exploración se consideraron sugerencias simples de rutas personalizadas a partir de un pequeño dataset curado. Fases posteriores de SDD eliminaron la personalización de rutas de la primera versión.
- Compartir logros con la **Web Share API** cuando esté soportada.

**APIs del navegador que encajan bien**
- **Geolocation API** — esencial para los desafíos cercanos y la confirmación de llegada.
- **MediaDevices/getUserMedia** — acceso a cámara para escaneo de QR o captura de evidencia fotográfica.
- **BarcodeDetector API** — opción nativa de QR atractiva, pero MDN la marca como experimental y no baseline en los navegadores principales, por lo que se requiere una librería de escáner de fallback.
- **Web Share API** — un cierre potente y amigable para móvil para el completado de desafíos.
- **Service Worker + IndexedDB** — razonable solo para caché liviano de datos de desafíos, última ruta e intentos de completado en cola; la sincronización offline-first completa debería ser un objetivo estirado.

**Servicios externos / opciones de despliegue**
- **Plataforma aceptada**: Supabase para Auth, Postgres/RLS, Storage privado y el límite de validación de completado.
- **Hosting aceptado**: Vercel para el frontend web, gestión de entorno, despliegues de preview y logs de deploy de producción.
- **Plan AWS reemplazado**: Amplify Hosting, API Gateway/Lambda, DynamoDB y S3 se consideraron antes pero ya no son la dirección activa de implementación porque la velocidad del equipo importa más que la alineación con AWS.
- **Datos de mapa/lugares**: opciones basadas en Mapbox, MapTiler u OpenStreetMap son viables; la elección final debería depender de los límites de la capa gratuita y de las necesidades de presentación del hackathon.

**Primer slice realista para 3 colaboradores**
- **Desarrollador 1 — UX de descubrimiento**: lista de desafíos, navegación mapa/lista, detalle de desafío, vista previa de ruta, UI de compartir.
- **Desarrollador 2 — Mecánica de prueba**: verificación de llegada por geolocalización, flujo de captura de evidencia fotográfica, estados de completado del lado del cliente, manejo de permisos/errores.
- **Desarrollador 3 — Plataforma**: bootstrap de despliegue, API pequeña, modelo de persistencia, dataset semilla, reglas de puntaje/badge.

**Supuestos**
- El lanzamiento inicial se enfoca en una ciudad o un distrito curado, no en cobertura global.
- El contenido de los desafíos es curado por el equipo, no generado por usuarios.
- El anti-cheat es "suficientemente bueno para el MVP", no prevención de fraude de nivel producción.

**Preguntas abiertas de producto**
- ¿La primera versión es anónima/basada en apodo, o requiere autenticación?
- Pregunta histórica resuelta por fases posteriores de SDD: el modo de prueba es geolocalización + evidencia fotográfica.
- ¿La personalización de rutas es basada en reglas a partir de POIs curados, o necesita un onboarding de preferencias?
- ¿El compartir social debe generar páginas de perfil públicas, o el compartir nativo del dispositivo es suficiente?
- ¿Qué ciudad/dataset es el ancla de la demo para el hackathon?

**No objetivos para el MVP**
- Competencia multijugador en tiempo real.
- Lugares/desafíos generados por usuarios.
- Validación avanzada por visión artificial.
- Sistemas complejos de moderación/backoffice.
- Sincronización offline-first profunda.

### Riesgos
- La denegación de permisos del navegador o la mala precisión de GPS pueden romper el loop de completado si no existe un fallback elegante.
- El riesgo histórico de QR queda reemplazado para el MVP activo porque el escaneo de QR no es la ruta de prueba principal; la precisión de geolocalización y las fallas de permiso de foto siguen siendo los riesgos de prueba activos.
- Intentar entregar auth, grafo social, sincronización offline y modos de prueba duales todos juntos hará explotar el alcance del hackathon.
- Los proveedores de mapas/geocodificación pueden introducir sorpresas de cuota o precio si se eligen tarde.
- Con la decisión de plataforma ahora actualizada, la implementación debe seguir los artefactos de Supabase + Vercel en lugar del plan reemplazado de AWS/Amplify.

### Listo para Propuesta
Sí - siempre que la siguiente fase fije la ciudad exacta, el dataset semilla y la responsabilidad del entorno de Supabase/Vercel antes de la implementación.
