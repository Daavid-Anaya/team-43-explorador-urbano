# Explorador Urbano

Explorador Urbano es un MVP de hackathon para descubrir una ciudad a través de desafíos, evidencia en el lugar y progresión gamificada. El objetivo es validar rápido una experiencia mobile-first, desplegable en AWS, que motive a residentes y visitantes a recorrer puntos de interés reales.

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
| Plataforma | Despliegue AWS-first usando Amplify Gen 2. |

## Stack Planificado

| Capa | Tecnología prevista |
|------|---------------------|
| Frontend | Vite + React + TypeScript |
| Backend/cloud | AWS Amplify Gen 2 |
| Datos y archivos | Recursos administrados por Amplify para datos, autenticación y evidencia fotográfica. |
| Flujo de trabajo | GitHub Issues, GitHub Projects, ramas cortas, PRs y revisiones. |

## Artefactos SDD/OpenSpec

Los artefactos técnicos se mantienen en inglés y son la fuente de verdad para alcance, requisitos y orden de implementación.

| Artefacto | Para qué sirve |
|----------|----------------|
| `openspec/changes/urban-explorer-mvp/proposal.md` | Intención de producto, límites del MVP y dirección aceptada. |
| `openspec/changes/urban-explorer-mvp/design.md` | Arquitectura, límites de responsabilidad y decisiones técnicas. |
| `openspec/changes/urban-explorer-mvp/specs/*/spec.md` | Requisitos y escenarios que deben verificar los reviewers. |
| `openspec/changes/urban-explorer-mvp/tasks.md` | Orden de implementación, lanes por colaborador, verificación y cortes de PR. |
| `openspec/config.yaml` | Reglas SDD, estado de testing y supuestos de colaboración. |

Si el código y OpenSpec no coinciden, se debe pausar y actualizar el plan antes de ampliar implementación. No inventar alcance de forma silenciosa.

## Flujo de Colaboración

Trabajamos con GitHub Flow y cambios revisables.

| Paso | Regla |
|------|-------|
| Issue | Todo trabajo parte de un issue con criterios de aceptación. |
| Project | GitHub Projects muestra estado, responsable, bloqueos y revisión. |
| Rama | La rama debe ser corta, descriptiva y acotada a un issue o slice. |
| PR | El PR debe linkear el issue, citar OpenSpec y mostrar evidencia de verificación. |
| Review | La revisión valida comportamiento, alineación con SDD, pruebas y tamaño del diff. |
| Merge | Se mergea solo después de aprobación y verificación registrada. |

Convenciones completas: ver `CONTRIBUTING.md`.

## Ruta Rápida para Contribuidores

1. Leer `openspec/changes/urban-explorer-mvp/proposal.md` para entender el objetivo.
2. Revisar `openspec/changes/urban-explorer-mvp/tasks.md` para elegir el slice correcto.
3. Tomar o crear un issue con criterios de aceptación claros.
4. Crear una rama enfocada desde la rama de integración vigente.
5. Implementar solo el alcance del issue.
6. Abrir un PR con referencias SDD/OpenSpec, evidencia de verificación y notas para reviewers.

## Próximos Pasos

- Confirmar la ciudad inicial y los 8-12 desafíos del demo.
- Bootstrappear la aplicación con Vite, React y TypeScript.
- Configurar AWS Amplify Gen 2 para autenticación, datos, storage y funciones necesarias.
- Cargar datos semilla de desafíos y reglas base de progresión.
- Implementar el flujo de descubrimiento, validación por ubicación/foto y progreso compartible.
- Registrar comandos reales de desarrollo, testing y despliegue cuando existan.

## Para Reviewers del Hackathon

- El valor del proyecto está en validar una experiencia urbana gamificada, no en cubrir múltiples ciudades desde el inicio.
- La documentación actual prioriza planificación, alcance y colaboración antes del bootstrap de código.
- Los artefactos OpenSpec explican el alcance esperado y permiten revisar si la implementación futura se mantiene enfocada.
