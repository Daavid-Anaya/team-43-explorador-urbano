# Especificación de Completado de Desafíos

## Propósito

Definir la prueba de visita mediante chequeos de proximidad y evidencia fotográfica.

## Requisitos

### Requisito: Envío de Foto con Proximidad Bloqueada

El sistema MUST requerir un usuario autenticado, validación de proximidad basada en geolocalización, precisión de GPS aceptable, evidencia fotográfica subida, y ausencia de completado previo del mismo desafío antes de marcar un desafío como completado.

A menos que un desafío sobrescriba `radiusMeters`, el completado del MVP MUST usar `radiusMeters = 80`. El sistema MUST rechazar el completado cuando `accuracyMeters` esté ausente o sea mayor que `maxGpsAccuracyMeters = 100`.

#### Escenario: Usuario completa un desafío dentro del radio permitido

- GIVEN un usuario autenticado está dentro del radio configurado del desafío, tiene precisión de GPS de 100 metros o mejor, y ha subido evidencia fotográfica
- WHEN el usuario envía evidencia de completado
- THEN el sistema almacena el envío de evidencia y marca el desafío como completado para ese usuario
- AND el resultado del completado devuelve datos de progreso actualizados

#### Escenario: La ubicación está fuera de radio o es demasiado inexacta

- GIVEN un usuario autenticado intenta completar con ubicación fuera del radio permitido o precisión de GPS mayor a 100 metros
- WHEN el usuario envía evidencia de completado
- THEN el sistema rechaza el intento de completado
- AND se le indica al usuario que se acerque o reintente cuando la precisión de GPS mejore

#### Escenario: El usuario no está autenticado

- GIVEN un visitante sin una sesión autenticada
- WHEN el visitante intenta enviar evidencia de completado de desafío
- THEN el sistema rechaza el intento de completado
- AND se le indica al visitante que inicie sesión antes de completar desafíos

#### Escenario: Falta la evidencia fotográfica

- GIVEN un usuario autenticado dentro del radio permitido con precisión de GPS aceptable
- WHEN el usuario envía el completado sin evidencia fotográfica subida
- THEN el sistema rechaza el intento de completado
- AND el desafío permanece incompleto para ese usuario

#### Escenario: Se deniega el permiso de geolocalización para el completado

- GIVEN un usuario autenticado al que se le denegó el permiso de geolocalización en un dispositivo necesario para la prueba de completado
- WHEN el usuario intenta enviar un completado de desafío
- THEN el sistema no acepta el completado
- AND se le indica al usuario que se requiere permiso de ubicación para la validación de prueba del MVP

#### Escenario: Falla la subida de foto o la conexión

- GIVEN un usuario autenticado pasó la validación de proximidad
- WHEN la captura de foto, la subida, o el envío falla debido a un error de dispositivo o red
- THEN el sistema no marca el desafío como completado
- AND el usuario ve una ruta de reintento sin crear un completado duplicado

#### Escenario: El usuario intenta un completado duplicado

- GIVEN un usuario autenticado ya completó un desafío específico
- WHEN el usuario reenvía evidencia para el mismo desafío
- THEN el sistema rechaza el completado duplicado
- AND los puntos y recompensas existentes del usuario permanecen sin cambios
