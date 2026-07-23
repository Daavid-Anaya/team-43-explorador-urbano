# Kiro Steering

Estos archivos orientan a colaboradores que trabajen con Amazon/AWS Kiro en este repositorio. Su objetivo es darle contexto estable al agente antes de abrir issues, crear ramas o implementar slices del MVP.

## Cómo usarlos

- Leer `.kiro/steering/project.md` para entender el producto, el alcance del MVP y los no objetivos.
- Leer `.kiro/steering/workflow.md` antes de tomar una tarea o abrir un PR.
- Leer `.kiro/steering/tech.md` para alinear decisiones técnicas con el stack previsto.
- Leer `.kiro/steering/sdd.md` antes de implementar para respetar OpenSpec/SDD como fuente de verdad.

## Relación con OpenSpec

Kiro steering no reemplaza a OpenSpec. Los requisitos, decisiones técnicas y tareas viven en `openspec/changes/urban-explorer-mvp/` y se mantienen en inglés.

No se crea `.kiro/specs/` por ahora para evitar duplicar especificaciones. Si el equipo decide usar specs propias de Kiro, primero debe definir cómo se sincronizarán con OpenSpec.
