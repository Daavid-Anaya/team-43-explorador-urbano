# Especificación de Identidad de Usuario

## Propósito

Definir el inicio de sesión liviano y el progreso propio del usuario para el MVP.

## Requisitos

### Requisito: Identidad Autenticada Simple

El sistema MUST permitir que una persona cree o reanude una identidad autenticada liviana antes de almacenar progreso, y MUST asociar perfil, puntos, insignias, y completados con esa identidad.

#### Escenario: El primer login crea un perfil

- GIVEN un visitante sin una sesión existente
- WHEN el visitante completa el flujo de login del MVP
- THEN el sistema crea o recupera un perfil de usuario e inicia una sesión autenticada
- AND el progreso subsecuente es propiedad de esa identidad de usuario

#### Escenario: Un usuario anónimo intenta persistir progreso

- GIVEN un visitante que no está autenticado
- WHEN el visitante intenta enviar un completado de desafío o abrir progreso guardado
- THEN el sistema bloquea la persistencia hasta que se complete el login
- AND se le muestra al visitante un requerimiento claro de inicio de sesión
