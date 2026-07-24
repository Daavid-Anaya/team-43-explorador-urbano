# Especificación de Progresión y Compartir

## Propósito

Definir la progresión del MVP, la visibilidad del progreso de ruta, y el compartir de logros.

## Requisitos

### Requisito: Recompensas de Progresión Persistidas

El sistema MUST persistir los desafíos completados, puntos, insignias ganadas, nivel actual, y progreso de desafíos para cada usuario autenticado.

Los umbrales de nivel del MVP MUST ser Explorer I a 0 puntos, Explorer II a 300 puntos, Explorer III a 700 puntos, City Ranger a 1200 puntos, y Urban Legend a 2000 puntos.

Las reglas de insignias del MVP MUST incluir First Steps por completar 1 desafío, Weekend Walker por completar 3 desafíos, Art Hunter por completar 2 desafíos de Art, History Seeker por completar 2 desafíos de History, Route Finisher por completar 5 desafíos, y Early Explorer por completar el primer desafío del día.

#### Escenario: El completado actualiza la progresión

- GIVEN un usuario autenticado con un completado de desafío aceptado
- WHEN se registra el completado
- THEN el sistema actualiza los puntos, elegibilidad de insignias, nivel, e historial de progreso del usuario
- AND el usuario puede ver más tarde el estado de progresión actualizado

#### Escenario: El usuario cruza un umbral de nivel

- GIVEN un usuario autenticado tiene 290 puntos
- WHEN un completado aceptado otorga al menos 10 puntos
- THEN el nivel del usuario se convierte en Explorer II
- AND el estado de progresión actualizado incluye el nuevo total de puntos y el nivel

#### Escenario: El usuario gana una insignia del MVP

- GIVEN un usuario autenticado ha completado un desafío de Art
- WHEN el usuario completa un segundo desafío de Art
- THEN el sistema otorga la insignia Art Hunter
- AND la insignia permanece asociada a ese perfil de usuario

#### Escenario: El usuario reanuda una cuenta existente

- GIVEN un usuario autenticado que previamente completó uno o más desafíos
- WHEN el usuario reabre la aplicación
- THEN el sistema restaura los completados previos y el estado de progreso actual
- AND los desafíos previamente completados no se ofrecen como nuevamente completables

### Requisito: Compartir Logros

El sistema SHOULD permitir a un usuario compartir un logro completado usando el compartir nativo del navegador o dispositivo cuando esté soportado, y MUST proveer un resumen compartible de respaldo cuando el compartir nativo no esté disponible.

#### Escenario: El compartir nativo está soportado

- GIVEN un usuario viendo un logro completado en un dispositivo con soporte de compartir nativo
- WHEN el usuario elige compartirlo
- THEN el sistema abre el flujo de compartir nativo con los detalles del logro

#### Escenario: El compartir nativo no está disponible

- GIVEN un usuario viendo un logro completado en un dispositivo sin soporte de compartir nativo
- WHEN el usuario elige compartirlo
- THEN el sistema provee un resumen compartible de respaldo o contenido copiable
