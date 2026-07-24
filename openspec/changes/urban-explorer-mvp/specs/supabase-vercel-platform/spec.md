# Especificación de Plataforma Supabase Vercel

## Propósito

Definir el runtime mínimo respaldado por Supabase y las expectativas de hosting en Vercel para el MVP. Esta spec sustituye la dirección de plataforma AWS/Amplify previa.

## Requisitos

### Requisito: Backend Desplegable con Supabase y Vercel

El sistema MUST ser desplegable con Vercel para el cliente web y Supabase para operaciones de datos autenticadas, persistencia protegida por RLS, storage privado de evidencia, datos semilla, y validación de completado.

#### Escenario: El entorno del MVP está desplegado

- GIVEN el equipo provisiona el entorno del MVP
- WHEN la aplicación se despliega
- THEN el frontend es alcanzable a través de Vercel
- AND Supabase Auth, Postgres/RLS, Storage, y la validación de completado soportan login, descubrimiento, completado, y recuperación de progreso

#### Escenario: El dataset semilla está cargado

- GIVEN el equipo provisiona el entorno del MVP
- WHEN corre el proceso de seed de desafíos curados
- THEN la ciudad activa tiene 8-12 desafíos con los campos de desafío aceptados
- AND las categorías de desafío sembradas se limitan a Art, History, Nature, Landmark, y Hidden Gem

#### Escenario: Los datos semilla faltan o no están disponibles

- GIVEN el runtime es alcanzable pero los datos semilla curados de desafíos no se cargaron correctamente
- WHEN un usuario abre la experiencia de descubrimiento
- THEN el sistema devuelve un estado de desafío vacío o no disponible sin corromper el progreso del usuario
- AND el problema puede corregirse restaurando el dataset curado

### Requisito: Completado y Recompensas No Forjables

El sistema MUST derivar el progreso de completado, puntos, e insignias desde estado validado por servidor/DB. El cliente MUST NOT ser confiable para enviar puntos, insignias, o progreso de recompensa.

#### Escenario: El cliente envía datos de recompensa forjados

- GIVEN un usuario autenticado envía datos de completado con puntos o insignias provistos por el cliente
- WHEN el límite de completado procesa la solicitud
- THEN los campos de recompensa enviados se ignoran o rechazan
- AND el progreso otorgado se deriva del desafío aceptado y el historial de completados persistido

#### Escenario: El RLS de Supabase protege los datos propios del usuario

- GIVEN un usuario autenticado intenta leer o escribir el perfil, completado, o metadata de evidencia de otro usuario
- WHEN las políticas de Supabase evalúan la solicitud
- THEN la operación se deniega a menos que una política explícita de lectura-segura lo permita

#### Escenario: El service role se mantiene fuera del navegador

- GIVEN el frontend está construido para Vercel
- WHEN las variables de entorno se exponen al bundle del navegador
- THEN solo la URL pública de Supabase y los valores de la anon key están disponibles
- AND `SUPABASE_SERVICE_ROLE_KEY` nunca se expone a través de `VITE_*`, código del cliente, logs, o archivos versionados

### Requisito: Visibilidad de Producción del MVP

El MVP MUST definir visibilidad mínima de producción para deploy, smoke, y diagnóstico de fallas de backend sin requerir una plataforma completa de observabilidad.

#### Escenario: Se captura evidencia de despliegue

- GIVEN el equipo despliega el MVP a través de Vercel
- WHEN el deploy termina
- THEN el equipo registra el resultado del deploy y los logs relevantes de build/deploy de Vercel
- AND el equipo captura evidencia manual de smoke incluyendo navegador/dispositivo, ruta esperada, resultado, y errores de consola del navegador si los hay

#### Escenario: El backend de completado emite evidencia de error

- GIVEN el límite de validación de completado está implementado en Supabase
- WHEN la validación o el procesamiento en runtime falla inesperadamente
- THEN los logs de Supabase o diagnósticos visibles en la base de datos proveen evidencia suficiente para diagnosticar fallas de validación, duplicado, storage, o persistencia sin exponer secretos

#### Escenario: El checklist de smoke de demo cubre las fallas esperadas

- GIVEN el equipo prepara un checklist de salud para el momento de la demo
- WHEN se corre el checklist
- THEN cubre login, descubrimiento, completado exitoso, recuperación de progresión, fallback de share, y captura de fallas esperadas
- AND las fallas esperadas incluyen geolocalización denegada, GPS inexacto, intentos fuera de radio, completado duplicado, evidencia faltante, campos de recompensa forjados, y datos semilla faltantes

### Requisito: Recuperación Post-Deploy

El MVP MUST documentar rutas de recuperación no destructivas para fallas de deploy frontend, validación/política de Supabase, seed de datos, y seguridad de datos de producción.

#### Escenario: El deploy frontend está mal

- GIVEN el frontend desplegado está roto después del release
- WHEN hay disponible un deploy Vercel conocido-bueno anterior
- THEN el equipo redespliega esa versión conocida-buena o revierte mediante un PR pequeño antes de redesplegar

#### Escenario: Los datos semilla están mal

- GIVEN hay datos semilla malos de desafíos activos
- WHEN el problema afecta el descubrimiento o la corrección de la demo
- THEN el equipo deshabilita o remueve los registros semilla malos mediante una tarea de rollback de seed
- AND restaura el archivo semilla conocido-bueno antes de re-ejecutar la validación de seed

#### Escenario: El límite de política o validación de Supabase está mal

- GIVEN aparece un problema de RLS, política de storage, RPC, Edge Function, o función Postgres después del deploy
- WHEN el problema no puede manejarse de forma segura mediante rollback frontend
- THEN el equipo arregla hacia adelante mediante un PR pequeño y captura evidencia de deploy más smoke después del redeploy

#### Escenario: Se propone una migración destructiva

- GIVEN un cambio de datos de producción podría destruir o reescribir metadata de usuario, desafío, completado, recompensa, o evidencia
- WHEN el equipo propone el cambio durante el MVP
- THEN el cambio se bloquea a menos que exista primero un plan explícito de migración, recuperación, y aprobación
