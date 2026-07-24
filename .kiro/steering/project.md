# Proyecto: Explorador Urbano

Explorador Urbano es un MVP de hackathon para convertir la exploración de una ciudad en una experiencia gamificada. La aplicación debe permitir descubrir desafíos cercanos, validar visitas con evidencia en el lugar, acumular progreso y compartir logros.

## Alcance del MVP

- Una sola ciudad inicial.
- Catálogo curado de 8-12 desafíos.
- Evidencia de completado con geolocalización y foto.
- Progresión con puntos, niveles y badges.
- Compartir logros o resumen de progreso cuando el navegador lo permita.
- Despliegue en Vercel con Supabase para autenticación, datos, RLS, storage y validación segura.
- PWA instalable con offline-lectura: manifest, service worker y caché de solo lectura del catálogo de desafíos. Completar un desafío sigue requiriendo red porque la validación es 100% server-side.

## Límites de producto

El objetivo es validar rápido una experiencia demostrable, no construir una plataforma completa de turismo urbano. Cualquier cambio debe proteger el foco del hackathon y mantenerse dentro de los artefactos OpenSpec.

## No objetivos

- Soporte multi-ciudad.
- Catálogo dinámico administrable desde un panel.
- Anti-cheat avanzado, moderación de fotos o detección sofisticada de fraude.
- Sincronización offline-first completa.
- Red social, feed en tiempo real o leaderboard avanzado.
