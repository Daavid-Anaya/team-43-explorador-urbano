# Tecnología

## Stack planificado

- Vite.
- React.
- TypeScript.
- AWS Amplify Gen 2.

Este repositorio puede no tener scripts de `npm` hasta que se implemente el slice de bootstrap. No asumir que `npm install`, `npm run dev`, `npm run test` o `npm run build` existen hasta verificarlo en el código.

## Responsabilidades AWS

- Autenticación de usuarios.
- Datos de desafíos, progreso, completados y perfiles.
- Storage para evidencia fotográfica.
- Functions cuando se necesite validación backend o lógica de completado.
- Amplify Hosting para despliegue del MVP.

## APIs del navegador

- Geolocation para distancia y validación de proximidad.
- MediaDevices o captura de foto compatible para evidencia.
- Web Share para compartir logros cuando esté disponible.

QR no es la prueba principal del MVP. La prueba primaria es geolocalización más evidencia fotográfica.

## Criterio técnico

Mantener soluciones simples y demostrables. Si una decisión técnica amplía alcance, primero debe reflejarse en issue y OpenSpec antes de implementarse.
