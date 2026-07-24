# Especificación de User Identity

## Propósito

Definir el inicio de sesión liviano y el progreso propiedad del usuario para el MVP.

## Requisitos

### Requisito: Identidad Autenticada Simple

El sistema DEBE permitir que una persona cree o retome una identidad autenticada liviana antes de almacenar progreso, y DEBE asociar el perfil, los puntos, los badges y los completados con esa identidad.

#### Escenario: El primer login crea el perfil

- DADO un visitante sin una sesión existente
- CUANDO el visitante completa el flujo de login del MVP
- ENTONCES el sistema crea o recupera un perfil de usuario e inicia una sesión autenticada
- Y el progreso posterior es propiedad de esa identidad de usuario

#### Escenario: Un usuario anónimo intenta persistir progreso

- DADO un visitante que no está autenticado
- CUANDO el visitante intenta enviar el completado de un desafío o abrir el progreso guardado
- ENTONCES el sistema bloquea la persistencia hasta que se complete el login
- Y se le muestra al visitante un requisito claro de inicio de sesión
