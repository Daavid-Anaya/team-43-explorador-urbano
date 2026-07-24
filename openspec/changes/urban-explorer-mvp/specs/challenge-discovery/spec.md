# Especificación de Descubrimiento de Desafíos

## Propósito

Definir el descubrimiento de desafíos cercanos para una sola ciudad curada con un catálogo inicial curado manualmente.

## Requisitos

### Requisito: Desafíos Cercanos Ordenados por Distancia

El sistema MUST presentar los desafíos curados de la ciudad activa como una lista ordenada por distancia más cercana cuando haya datos de ubicación usables disponibles, SHALL mostrar el estado básico de progreso de cada desafío, y MUST exponer una vista de detalle del desafío antes del completado.

El catálogo inicial del MVP MUST contener 8-12 desafíos curados manualmente para una ciudad. Cada desafío MUST incluir `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, y `estimatedMinutes`. Las categorías soportadas del MVP MUST ser Art, History, Nature, Landmark, y Hidden Gem.

#### Escenario: La lista cercana usa la ubicación actual

- GIVEN un usuario autenticado que otorgó permiso de geolocalización
- WHEN el usuario abre la lista de desafíos
- THEN el sistema muestra los desafíos curados de una sola ciudad ordenados de menor a mayor distancia
- AND cada elemento muestra la distancia y si el desafío está sin iniciar, en progreso, o completado

#### Escenario: El permiso denegado todavía permite navegar

- GIVEN un usuario autenticado que denegó el permiso de geolocalización
- WHEN el usuario abre la lista de desafíos
- THEN el sistema todavía muestra el catálogo curado de desafíos de una sola ciudad
- AND el sistema explica que el ordenamiento por distancia y la validación de proximidad están limitados sin acceso a ubicación

#### Escenario: El usuario abre una vista de detalle de desafío

- GIVEN un usuario autenticado que ve la lista curada de desafíos
- WHEN el usuario selecciona un desafío
- THEN el sistema muestra los detalles del desafío necesarios para intentar el completado
- AND la vista incluye el estado de completado actual para ese usuario

#### Escenario: El catálogo de desafíos usa el contrato MVP aceptado

- GIVEN el dataset inicial de desafíos está cargado
- WHEN el sistema renderiza la lista de descubrimiento o la vista de detalle
- THEN cada desafío incluye los campos de desafío requeridos
- AND cada categoría de desafío es una de Art, History, Nature, Landmark, o Hidden Gem
- AND el dataset inicial contiene no menos de 8 ni más de 12 desafíos
