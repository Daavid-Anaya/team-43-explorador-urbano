# Especificación de Challenge Completion

## Propósito

Definir la prueba de visita mediante verificaciones de proximidad y evidencia fotográfica.

## Requisitos

### Requisito: Envío de Foto con Compuerta de Proximidad

El sistema DEBE requerir un usuario autenticado, validación de proximidad basada en geolocalización, precisión de GPS aceptable, evidencia fotográfica subida y ningún completado previo del mismo desafío antes de marcar un desafío como completo.

A menos que un desafío sobreescriba `radiusMeters`, el completado del MVP DEBE usar `radiusMeters = 80`. El sistema DEBE rechazar el completado cuando `accuracyMeters` esté ausente o sea mayor que `maxGpsAccuracyMeters = 100`.

#### Escenario: El usuario completa el desafío dentro del radio permitido

- DADO un usuario autenticado que está dentro del radio configurado del desafío, tiene una precisión de GPS de 100 metros o mejor y ha subido evidencia fotográfica
- CUANDO el usuario envía la evidencia de completado
- ENTONCES el sistema almacena el envío de evidencia y marca el desafío como completo para ese usuario
- Y el resultado del completado devuelve datos de progreso actualizados

#### Escenario: La ubicación está fuera del radio o es demasiado imprecisa

- DADO un usuario autenticado que intenta el completado con la ubicación fuera del radio permitido o con precisión de GPS mayor a 100 metros
- CUANDO el usuario envía la evidencia de completado
- ENTONCES el sistema rechaza el intento de completado
- Y se le indica al usuario que se acerque más o reintente cuando la precisión de GPS mejore

#### Escenario: El usuario no está autenticado

- DADO un visitante sin una sesión autenticada
- CUANDO el visitante intenta enviar evidencia de completado de un desafío
- ENTONCES el sistema rechaza el intento de completado
- Y se le indica al visitante que inicie sesión antes de completar desafíos

#### Escenario: Falta la evidencia fotográfica

- DADO un usuario autenticado dentro del radio permitido con precisión de GPS aceptable
- CUANDO el usuario envía el completado sin evidencia fotográfica subida
- ENTONCES el sistema rechaza el intento de completado
- Y el desafío permanece incompleto para ese usuario

#### Escenario: Se deniega el permiso de geolocalización para el completado

- DADO un usuario autenticado que denegó el permiso de geolocalización en un dispositivo necesario para la prueba de completado
- CUANDO el usuario intenta enviar el completado de un desafío
- ENTONCES el sistema no acepta el completado
- Y se le indica al usuario que el permiso de ubicación es requerido para la validación de prueba del MVP

#### Escenario: La subida de foto o la conexión falla

- DADO un usuario autenticado que pasó la validación de proximidad
- CUANDO la captura, subida o envío de la foto falla por un error del dispositivo o de red
- ENTONCES el sistema no marca el desafío como completo
- Y el usuario ve una ruta de reintento sin crear un completado duplicado

#### Escenario: El usuario intenta un completado duplicado

- DADO un usuario autenticado que ya completó un desafío específico
- CUANDO el usuario reenvía evidencia para el mismo desafío
- ENTONCES el sistema rechaza el completado duplicado
- Y los puntos y recompensas existentes del usuario permanecen sin cambios
