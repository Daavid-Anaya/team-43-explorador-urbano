# Tecnología

## Stack planificado

- Vite.
- React.
- TypeScript.
- Supabase.
- Vercel.

Este repositorio puede no tener scripts de `npm` hasta que se implemente el slice de bootstrap. No asumir que `npm install`, `npm run dev`, `npm run test` o `npm run build` existen hasta verificarlo en el código.

## Responsabilidades Supabase/Vercel

- Supabase Auth para autenticación de usuarios.
- Supabase Postgres/RLS para desafíos, progreso derivado, completados y perfiles.
- Supabase Storage privado para evidencia fotográfica.
- Supabase RPC, Edge Function o función Postgres para validación backend de completado.
- Vercel para despliegue del MVP.

La clave service role de Supabase nunca debe llegar al cliente. El frontend solo puede usar variables públicas seguras como URL y anon key.

## APIs del navegador

- Geolocation para distancia y validación de proximidad.
- MediaDevices o captura de foto compatible para evidencia.
- Web Share para compartir logros cuando esté disponible.
- Service Worker y Web App Manifest para el shell PWA instalable con offline-lectura del catálogo. Límite estricto: el service worker solo cachea el app shell y el catálogo de desafíos en modo lectura; nunca cachea rutas de auth, Storage privado, ni el completado de desafíos (`submit_completion`), y no usa Background Sync API para encolar completados offline.

QR no es la prueba principal del MVP. La prueba primaria es geolocalización más evidencia fotográfica.

## Criterio técnico

Mantener soluciones simples y demostrables. Si una decisión técnica amplía alcance, primero debe reflejarse en issue y OpenSpec antes de implementarse.
