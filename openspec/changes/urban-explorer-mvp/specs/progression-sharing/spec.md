# Especificación de Progression Sharing

## Propósito

Definir la progresión del MVP, la visibilidad del progreso de ruta y el compartir de logros.

## Requisitos

### Requisito: Recompensas de Progresión Persistidas

El sistema DEBE persistir los desafíos completados, los puntos, los badges ganados, el nivel actual y el progreso de los desafíos para cada usuario autenticado.

Los umbrales de nivel del MVP DEBEN ser Explorer I en 0 puntos, Explorer II en 300 puntos, Explorer III en 700 puntos, City Ranger en 1200 puntos y Urban Legend en 2000 puntos.

Las reglas de badges del MVP DEBEN incluir First Steps por completar 1 desafío, Weekend Walker por completar 3 desafíos, Art Hunter por completar 2 desafíos de Art, History Seeker por completar 2 desafíos de History, Route Finisher por completar 5 desafíos y Early Explorer por completar el primer desafío del día.

#### Escenario: El completado actualiza la progresión

- DADO un usuario autenticado con un completado de desafío aceptado
- CUANDO se registra el completado
- ENTONCES el sistema actualiza los puntos, la elegibilidad de badges, el nivel y el historial de progreso del usuario
- Y el usuario puede ver luego el estado de progresión actualizado

#### Escenario: El usuario cruza un umbral de nivel

- DADO un usuario autenticado que tiene 290 puntos
- CUANDO un completado aceptado otorga al menos 10 puntos
- ENTONCES el nivel del usuario se convierte en Explorer II
- Y el estado de progresión actualizado incluye los nuevos puntos totales y el nivel

#### Escenario: El usuario gana un badge del MVP

- DADO un usuario autenticado que ha completado un desafío de Art
- CUANDO el usuario completa un segundo desafío de Art
- ENTONCES el sistema otorga el badge Art Hunter
- Y el badge permanece asociado a ese perfil de usuario

#### Escenario: El usuario retoma una cuenta existente

- DADO un usuario autenticado que previamente completó uno o más desafíos
- CUANDO el usuario reabre la aplicación
- ENTONCES el sistema restaura los completados previos y el estado de progreso actual
- Y los desafíos previamente completados no se ofrecen como completables de nuevo

### Requisito: Compartir Logros

El sistema DEBERÍA permitir que un usuario comparta un logro completado usando el compartir nativo del navegador o del dispositivo cuando esté soportado, y DEBE proporcionar un resumen compartible de fallback cuando el compartir nativo no esté disponible.

#### Escenario: El compartir nativo está soportado

- DADO un usuario viendo un logro completado en un dispositivo con soporte de compartir nativo
- CUANDO el usuario elige compartirlo
- ENTONCES el sistema abre el flujo de compartir nativo con los detalles del logro

#### Escenario: El compartir nativo no está disponible

- DADO un usuario viendo un logro completado en un dispositivo sin soporte de compartir nativo
- CUANDO el usuario elige compartirlo
- ENTONCES el sistema proporciona un resumen compartible de fallback o contenido copiable
