# Especificación de Challenge Discovery

## Propósito

Definir el descubrimiento de desafíos cercanos para una sola ciudad curada con un catálogo inicial curado manualmente.

## Requisitos

### Requisito: Desafíos Cercanos Ordenados por Distancia

El sistema DEBE presentar los desafíos curados de la ciudad activa como una lista ordenada por la distancia más cercana cuando haya datos de ubicación utilizables disponibles, DEBERÁ mostrar el estado de progreso básico de cada desafío y DEBE exponer una vista de detalle del desafío antes del completado.

El catálogo inicial del MVP DEBE contener 8-12 desafíos curados manualmente para una ciudad. Cada desafío DEBE incluir `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty` y `estimatedMinutes`. Las categorías soportadas del MVP DEBEN ser Art, History, Nature, Landmark y Hidden Gem.

#### Escenario: La lista de cercanos usa la ubicación actual

- DADO un usuario autenticado que otorgó permiso de geolocalización
- CUANDO el usuario abre la lista de desafíos
- ENTONCES el sistema muestra los desafíos curados de una sola ciudad ordenados de la distancia menor a la mayor
- Y cada ítem muestra la distancia y si el desafío está no iniciado, en progreso o completado

#### Escenario: El permiso denegado igual permite navegar

- DADO un usuario autenticado que denegó el permiso de geolocalización
- CUANDO el usuario abre la lista de desafíos
- ENTONCES el sistema igual muestra el catálogo curado de desafíos de una sola ciudad
- Y el sistema explica que el ordenamiento por distancia y la validación de proximidad son limitados sin acceso a la ubicación

#### Escenario: El usuario abre una vista de detalle de desafío

- DADO un usuario autenticado viendo la lista curada de desafíos
- CUANDO el usuario selecciona un desafío
- ENTONCES el sistema muestra los detalles del desafío necesarios para intentar el completado
- Y la vista incluye el estado de completado actual para ese usuario

#### Escenario: El catálogo de desafíos usa el contrato aceptado del MVP

- DADO que el dataset inicial de desafíos está cargado
- CUANDO el sistema renderiza la lista de descubrimiento o la vista de detalle
- ENTONCES cada desafío incluye los campos requeridos del challenge
- Y cada categoría de desafío es una de Art, History, Nature, Landmark o Hidden Gem
- Y el dataset inicial contiene no menos de 8 y no más de 12 desafíos
