# Flujo de Trabajo

El repositorio usa GitHub Flow: issue -> rama -> PR -> revisión -> merge.

## Reglas base

- Todo trabajo debe partir de un issue con criterios de aceptación claros.
- La rama debe ser corta, descriptiva y acotada al issue o slice correspondiente.
- El PR debe linkear el issue y citar referencias OpenSpec relevantes.
- El PR debe incluir verificación ejecutada o explicar por qué el script todavía no existe.
- Mantener PRs cerca de unas 400 líneas modificadas; si crece demasiado, dividir por comportamiento.
- No hacer self-merge sin revisión.
- No mezclar código de aplicación con cambios de documentación/configuración no relacionados.

## GitHub Projects

Usar las columnas definidas en `CONTRIBUTING.md` para visibilidad del equipo:

- `Backlog`: capturado, pero todavía no listo.
- `Needs Review`: requiere triage o aprobación.
- `Ready`: aprobado para implementación.
- `In Progress`: trabajo activo con rama o PR en curso.
- `In Review`: PR abierto esperando revisión.
- `Done`: mergeado o cerrado intencionalmente.

## Referencias obligatorias en PRs

- Issue linkeado.
- Artefactos OpenSpec aplicables, especialmente `proposal.md`, `design.md`, `tasks.md` o `specs/*/spec.md`.
- Evidencia de verificación: comando, resultado, prueba manual o nota explícita de bootstrap pendiente.
