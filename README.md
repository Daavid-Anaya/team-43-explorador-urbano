# Explorador Urbano

Explorador Urbano es un MVP de hackathon para descubrir una ciudad a través de desafíos, evidencia en el lugar y progresión gamificada. El objetivo es validar rápido una experiencia mobile-first, desplegable en Vercel con Supabase, que motive a residentes y visitantes a recorrer puntos de interés reales.

## Estado Actual

| Área | Estado |
|------|--------|
| Planificación SDD/OpenSpec | Presente en `openspec/changes/urban-explorer-mvp/`. |
| Configuración de colaboración | Presente en `.github/` y `CONTRIBUTING.md`. |
| Bootstrap de aplicación | Puede no existir todavía; no asumir scripts `npm` hasta que se implemente el primer slice. |
| Código de aplicación | Fuera de alcance para esta documentación inicial. |

## Alcance del MVP

El MVP se enfoca en una sola ciudad y en un recorrido controlado para reducir riesgo de alcance durante el hackathon.

| Capacidad | Alcance previsto |
|----------|------------------|
| Exploración urbana | Una ciudad inicial con 8-12 desafíos. |
| Evidencia | Validación por geolocalización y foto tomada en el lugar. |
| Progresión | Puntos, niveles y badges por completar desafíos. |
| Compartir | Tarjeta o resumen compartible del progreso/logro. |
| Plataforma | Despliegue en Vercel con Supabase para auth, datos y storage. |

## Stack Planificado

| Capa | Tecnología prevista |
|------|---------------------|
| Frontend | Vite + React + TypeScript |
| Backend/cloud | Supabase |
| Datos y archivos | Supabase Auth, Postgres/RLS y Storage privado para evidencia fotográfica. |
| Flujo de trabajo | GitHub Issues, GitHub Projects, ramas cortas, PRs y revisiones. |

## Artefactos SDD/OpenSpec

Los artefactos técnicos se mantienen en español neutral/profesional y son la fuente de verdad para alcance, requisitos y orden de implementación. Ver la tabla completa de artefactos y su propósito en la sección "Fuente de Verdad" de `CONTRIBUTING.md`.

Si el código y OpenSpec no coinciden, se debe pausar y actualizar el plan antes de ampliar implementación. No inventar alcance de forma silenciosa.

## Trabajo con Kiro

Los colaboradores que usen Kiro deben leer primero `.kiro/README.md` y los archivos en `.kiro/steering/`. Ese contexto guía al agente sobre el producto, el flujo GitHub Flow, el stack previsto y la regla principal: OpenSpec/SDD es la fuente de verdad para implementar.

No se mantiene una copia de specs en `.kiro/specs/` por ahora. Esto evita duplicar requisitos y reduce el riesgo de que Kiro y OpenSpec se desincronicen.

## Flujo de Colaboración

Trabajamos con GitHub Flow y cambios revisables: issue -> rama -> PR -> revisión -> merge. El detalle completo del flujo, nombres de ramas, columnas del Project y la ruta rápida para contribuir están en `CONTRIBUTING.md`.

## Próximos Pasos

- Confirmar la ciudad inicial y los 8-12 desafíos del demo.
- Bootstrappear la aplicación con Vite, React y TypeScript.
- Configurar Supabase para autenticación, datos, RLS, storage privado y validación de completado.
- Cargar datos semilla de desafíos y reglas base de progresión.
- Implementar el flujo de descubrimiento, validación por ubicación/foto y progreso compartible.
- Registrar comandos reales de desarrollo, testing y despliegue cuando existan.

## Para Reviewers del Hackathon

- El valor del proyecto está en validar una experiencia urbana gamificada, no en cubrir múltiples ciudades desde el inicio.
- La documentación actual prioriza planificación, alcance y colaboración antes del bootstrap de código.
- Los artefactos OpenSpec explican el alcance esperado y permiten revisar si la implementación futura se mantiene enfocada.
