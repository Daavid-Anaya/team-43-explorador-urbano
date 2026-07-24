# Kiro Steering — Explorador Urbano

Explorador Urbano es un MVP de hackathon para convertir la exploración de una ciudad en una experiencia gamificada: descubrir desafíos cercanos, validar la visita con evidencia en el lugar (geolocalización + foto), acumular progreso y compartir logros.

## Fuente de verdad

El alcance, requisitos, specs, decisiones técnicas y orden de tareas viven en `openspec/changes/urban-explorer-mvp/`. Esa es la fuente de verdad. Leé `proposal.md`, `design.md`, `tasks.md` y los `specs/*/spec.md` relevantes antes de implementar.

## Reglas siempre presentes

- **Flujo de trabajo**: GitHub Flow (issue → rama → PR → review → merge). Convenciones completas en `CONTRIBUTING.md`.
- **Idioma**: los artefactos SDD/OpenSpec permanecen en inglés; la documentación de colaboración se escribe en español neutral/profesional.
- **Kiro es apoyo, no fuente de verdad**: usalo durante la exploración para detectar ambigüedades y forzar la clarificación de requisitos. El resultado se vuelca a `openspec/`. No se crea `.kiro/specs/` para evitar duplicación y desincronización.
- **No inventar alcance** fuera de openspec. Si el alcance no está definido, abrí o actualizá un issue. Si implementación y openspec entran en conflicto, pausá y actualizá el plan antes de ampliar código.
