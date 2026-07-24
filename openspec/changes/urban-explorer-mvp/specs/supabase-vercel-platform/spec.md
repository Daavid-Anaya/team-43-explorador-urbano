# Especificación de Supabase Vercel Platform

## Propósito

Definir el runtime mínimo respaldado por Supabase y las expectativas de hosting en Vercel para el MVP. Este spec reemplaza la dirección previa de plataforma AWS/Amplify.

## Requisitos

### Requisito: Backend Desplegable con Supabase y Vercel

El sistema DEBE ser desplegable con Vercel para el cliente web y Supabase para las operaciones de datos autenticadas, la persistencia protegida por RLS, el storage privado de evidencia, los datos semilla y la validación de completado.

#### Escenario: El entorno del MVP está desplegado

- DADO que el equipo provisiona el entorno del MVP
- CUANDO se despliega la aplicación
- ENTONCES el frontend es accesible a través de Vercel
- Y Supabase Auth, Postgres/RLS, Storage y la validación de completado soportan login, descubrimiento, completado y recuperación de progreso

#### Escenario: El dataset semilla está cargado

- DADO que el equipo provisiona el entorno del MVP
- CUANDO se ejecuta el proceso de semilla de desafíos curados
- ENTONCES la ciudad activa tiene 8-12 desafíos con los campos aceptados del challenge
- Y las categorías de desafíos sembrados se limitan a Art, History, Nature, Landmark y Hidden Gem

#### Escenario: Los datos semilla están ausentes o no disponibles

- DADO que el runtime es accesible pero los datos semilla de desafíos curados no se cargaron correctamente
- CUANDO un usuario abre la experiencia de descubrimiento
- ENTONCES el sistema devuelve un estado de desafíos vacío o no disponible sin corromper el progreso del usuario
- Y el problema puede corregirse restaurando el dataset curado

### Requisito: Completado y Recompensas No Falsificables

El sistema DEBE derivar el progreso de completado, los puntos y los badges del estado validado por el servidor/DB. NO DEBE confiarse en el cliente para enviar puntos, badges o progreso de recompensa.

#### Escenario: El cliente envía datos de recompensa falsificados

- DADO que un usuario autenticado envía datos de completado con puntos o badges provistos por el cliente
- CUANDO el límite de completado procesa la solicitud
- ENTONCES los campos de recompensa enviados son ignorados o rechazados
- Y el progreso otorgado se deriva del desafío aceptado y del historial de completados persistido

#### Escenario: El RLS de Supabase protege los datos propiedad del usuario

- DADO que un usuario autenticado intenta leer o escribir el perfil, completado o metadatos de evidencia de otro usuario
- CUANDO las políticas de Supabase evalúan la solicitud
- ENTONCES la operación es denegada a menos que una política explícita de lectura segura lo permita

#### Escenario: La service role se mantiene fuera del navegador

- DADO que el frontend se compila para Vercel
- CUANDO las variables de entorno se exponen al bundle del navegador
- ENTONCES solo están disponibles los valores públicos de URL de Supabase y anon key
- Y `SUPABASE_SERVICE_ROLE_KEY` nunca se expone a través de `VITE_*`, código del cliente, logs ni archivos versionados

### Requisito: Visibilidad de Producción del MVP

El MVP DEBE definir una visibilidad mínima de producción para el deploy, el smoke y el diagnóstico de fallas del backend sin requerir una plataforma completa de observabilidad.

#### Escenario: Se captura la evidencia de despliegue

- DADO que el equipo despliega el MVP a través de Vercel
- CUANDO el deploy finaliza
- ENTONCES el equipo registra el resultado del deploy y los logs relevantes de build/deploy de Vercel
- Y el equipo captura evidencia de smoke manual incluyendo navegador/dispositivo, ruta esperada, resultado y errores de consola del navegador si están presentes

#### Escenario: El backend de completado emite evidencia de error

- DADO que el límite de validación de completado está implementado en Supabase
- CUANDO la validación o el procesamiento en runtime falla inesperadamente
- ENTONCES los logs de Supabase o los diagnósticos visibles en la base de datos proporcionan evidencia suficiente para diagnosticar fallas de validación, duplicado, storage o persistencia sin exponer secretos

#### Escenario: El checklist de smoke de demo cubre las fallas esperadas

- DADO que el equipo prepara un checklist de salud para la hora de la demo
- CUANDO se ejecuta el checklist
- ENTONCES cubre login, descubrimiento, completado exitoso, recuperación de progresión, fallback de compartir y captura de fallas esperadas
- Y las fallas esperadas incluyen geolocalización denegada, GPS impreciso, intentos fuera del radio, completado duplicado, evidencia ausente, campos de recompensa falsificados y datos semilla faltantes

### Requisito: Recuperación Post-Despliegue

El MVP DEBE documentar rutas de recuperación no destructivas para problemas de deploy del frontend, validación/política de Supabase, semilla de datos y seguridad de datos de producción.

#### Escenario: El deploy del frontend es defectuoso

- DADO que el frontend desplegado está roto después del release
- CUANDO hay disponible un despliegue de Vercel previo conocido como bueno
- ENTONCES el equipo redespliega esa versión conocida como buena o revierte mediante un PR pequeño antes de redesplegar

#### Escenario: Los datos semilla son defectuosos

- DADO que hay datos semilla de desafíos defectuosos activos
- CUANDO el problema afecta la corrección del descubrimiento o de la demo
- ENTONCES el equipo deshabilita o elimina los registros semilla defectuosos mediante una tarea de rollback de semilla
- Y restaura el archivo semilla conocido como bueno antes de reejecutar la validación de semilla

#### Escenario: La política o el límite de validación de Supabase es defectuoso

- DADO que aparece un problema de RLS, política de storage, RPC, Edge Function o función Postgres después del deploy
- CUANDO el problema no puede manejarse de forma segura mediante rollback del frontend
- ENTONCES el equipo corrige hacia adelante mediante un PR pequeño y captura evidencia de deploy más smoke después de redesplegar

#### Escenario: Se propone una migración destructiva

- DADO que un cambio de datos de producción podría destruir o reescribir metadatos de usuario, desafío, completado, recompensa o evidencia
- CUANDO el equipo propone el cambio durante el MVP
- ENTONCES el cambio es bloqueado a menos que exista primero un plan explícito de migración, recuperación y aprobación
