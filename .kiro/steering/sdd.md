# SDD y OpenSpec

OpenSpec/SDD es la fuente de verdad para planificación, alcance, requisitos y orden de implementación.

## Lectura obligatoria antes de implementar

Los agentes de Kiro deben leer:

- `openspec/changes/urban-explorer-mvp/proposal.md`.
- `openspec/changes/urban-explorer-mvp/design.md`.
- `openspec/changes/urban-explorer-mvp/tasks.md`.
- Los `openspec/changes/urban-explorer-mvp/specs/*/spec.md` relevantes para el issue.

## Reglas para agentes

- No inventar alcance fuera de OpenSpec.
- Si el alcance no está definido, abrir o actualizar un issue, o pedir decisión al equipo.
- Si implementación y OpenSpec entran en conflicto, pausar y actualizar el plan antes de ampliar código.
- Mantener los PRs alineados con los slices definidos en `tasks.md`, salvo decisión explícita del equipo.

## Idioma de artefactos

- Los artefactos SDD/OpenSpec permanecen en inglés.
- La documentación de colaboración para el equipo permanece en español neutral/profesional.
