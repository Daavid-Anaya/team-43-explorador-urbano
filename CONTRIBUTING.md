# Contribuir a Explorador Urbano

Usamos los artefactos SDD/OpenSpec como fuente de verdad de planificación y entregamos cambios con GitHub Flow: issue -> rama -> PR -> revisión -> merge.

## Ruta Rápida

1. Leer los archivos OpenSpec relevantes en `openspec/changes/urban-explorer-mvp/`.
2. Abrir o tomar un issue aprobado usando la plantilla adecuada.
3. Crear una rama enfocada desde la rama main.
4. Implementar solo el alcance del issue.
5. Abrir un PR con enlaces a SDD, evidencia de verificación y un diff fácil de revisar.
6. Mergear solo después de aprobación de review y verificación aprobada.

## Fuente de Verdad

| Artefacto | Propósito |
|-----------|-----------|
| `openspec/changes/urban-explorer-mvp/proposal.md` | Intención de producto, límites del MVP y dirección aceptada. |
| `openspec/changes/urban-explorer-mvp/design.md` | Arquitectura, límites de responsabilidad y decisiones técnicas. |
| `openspec/changes/urban-explorer-mvp/specs/*/spec.md` | Requisitos y escenarios que los reviewers deben verificar. |
| `openspec/changes/urban-explorer-mvp/tasks.md` | Orden de implementación, lanes de responsables, verificación y cortes de PR. |
| `openspec/config.yaml` | Reglas SDD, estado de testing y supuestos de colaboración del proyecto. |

Si el código y OpenSpec no coinciden, pausar y actualizar el plan antes de ampliar implementación. No inventar alcance nuevo de forma silenciosa.

## GitHub Flow

| Paso | Regla |
|------|-------|
| Issue | Toda implementación empieza con un issue basado en plantilla y con criterios de aceptación. |
| Rama | Las ramas son cortas y están acotadas a un issue o slice de PR. |
| PR | Los pull requests linkean el issue, citan referencias OpenSpec e incluyen verificación. |
| Revisión | La revisión valida correctitud, alineación con SDD, evidencia de pruebas y tamaño revisable. |
| Merge | Mergear solo después de aprobación y cuando conflictos, TODOs y gaps de bootstrap estén resueltos o documentados explícitamente. |

## Nombres de Ramas

Usar nombres en minúscula, con guiones y con número de issue cuando exista.

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Tarea de feature | `feat/<issue>-<alcance-corto>` | `feat/12-app-shell-bootstrap` |
| Corrección | `fix/<issue>-<alcance-corto>` | `fix/27-location-permission-fallback` |
| Docs/config | `docs/<issue>-<alcance-corto>` | `docs/8-github-templates` |
| Slice de PR encadenado | `feat/<slice>-<alcance-corto>` | `feat/pr2-completion-flow` |

Para trabajo apilado, basar la siguiente rama sobre la rama del PR anterior hasta que la cadena se mergee.

## Ciclo de Vida de Issues y Columnas del Project

Usar GitHub Projects para que propiedad, estado y revisión sean visibles.

| Columna | Significado | Criterio de salida |
|---------|-------------|--------------------|
| Backlog | Capturado pero no listo. | Alcance, responsable y referencia SDD están claros. |
| Needs Review | El issue necesita triage o aprobación. | Un maintainer confirma que está dentro de alcance. |
| Ready | Aprobado para implementación. | Responsable y rama están asignados. |
| In Progress | El trabajo está activo. | El PR está abierto y linkeado. |
| In Review | El PR espera revisión. | Comentarios de review resueltos y verificación completa. |
| Done | Mergeado o cerrado intencionalmente. | Issue cerrado con evidencia final o justificación. |

Campos requeridos en issues:

- Referencia SDD o motivo por el cual el trabajo queda fuera de OpenSpec.
- Responsable o lane.
- Criterios de aceptación.
- Plan de verificación.
- Estado de revisión.
- Nota de presupuesto de review si el trabajo puede superar unas 400 líneas modificadas.

## Trabajar con los 3 Slices de PR

`openspec/changes/urban-explorer-mvp/tasks.md` estima 1.200-1.800 líneas modificadas y recomienda PRs encadenados. Seguir esa división salvo que el equipo actualice explícitamente el plan SDD.

| Slice | Alcance | Lanes de responsables | Verificación esperada |
|-------|---------|-----------------------|-----------------------|
| PR1 bootstrap + base Amplify | Bootstrap de app, recursos de auth/data/storage, ruta de seed y reglas base de progresión. | Dev A shell frontend/discovery, Dev B base Amplify, Dev C soporte de reglas de progresión. | `npm install && npm run dev`, `npx ampx sandbox`, `npm run seed:check`, prueba enfocada de reglas de progresión cuando exista. |
| PR2 flujo de completado | Validación de completado, UX de carga de evidencia, función submit-completion, controles de duplicado/radio/GPS/evidencia. | Dev B función backend, Dev C UX de completado. | `npm run test -- submit-completion`, `npm run test -- completion photo`, smoke checks con geolocalización y upload mockeados. |
| PR3 progresión + deploy + demo | UI/historial/share fallback de progresión, wiring de auth, flujos e2e, docs de deploy y checklist de demo. | Dev A wiring de app, Dev B deploy, Dev C progresión/e2e/demo. | `npm run test -- progression share`, `npm run test:e2e`, `npm run build`, dry-run de despliegue cuando esté configurado. |

Mantener cada slice revisable. Si un slice supera unas 400 líneas modificadas, dividir por comportamiento, no por tipo de archivo.

## Expectativas para Pull Requests

Todo PR debe incluir:

- Un issue aprobado y linkeado.
- Resumen, cambios y evidencia de testing/verificación.
- Referencias OpenSpec para requisitos y tareas.
- Límites claros de alcance y límite de rollback.
- Capturas o notas de demo para cambios de UI.
- Una nota cuando los scripts esperados todavía no existen porque el repositorio sigue en bootstrap.
- Si un chequeo queda como `N/A`, una razón concreta en la misma línea; `N/A` solo no es evidencia suficiente.

Reglas de revisión:

- Preferir PRs cercanos o menores a unas 400 líneas modificadas.
- Mantener juntos implementación, tests y docs del mismo comportamiento.
- No mezclar tareas no relacionadas para "ahorrar tiempo". Eso vuelve la revisión más lenta y riesgosa.
- No incluir secretos, ruido generado ni cambios de formato no relacionados.
- No implementar código fuente de aplicación en PRs de documentación/configuración.

## Definición de Ready

Un issue está listo cuando:

- [ ] Usa `feature_task.yml` o `bug_report.yml`.
- [ ] Linkea el artefacto OpenSpec relevante o explica por qué no aplica.
- [ ] Los criterios de aceptación son observables.
- [ ] Los pasos de verificación están nombrados, aunque los scripts todavía no existan.
- [ ] Responsable/lane y slice de PR previsto están claros.
- [ ] El riesgo de tamaño de review está explicitado.
- [ ] Dependencias y bloqueos son visibles.

## Definición de Done

Un PR está terminado cuando:

- [ ] Los criterios de aceptación del issue linkeado están satisfechos.
- [ ] Las referencias SDD todavía coinciden con el comportamiento entregado.
- [ ] Tests enfocados, build checks o verificación manual están registrados con comandos o escenarios exactos.
- [ ] Los scripts de bootstrap faltantes están documentados, no ocultos.
- [ ] El feedback de review está resuelto.
- [ ] El PR se mantiene dentro del presupuesto de review o documenta una excepción justificada.
- [ ] La rama no contiene cambios no relacionados, secretos ni atribuciones automáticas de herramientas.

## Mensajes de Commit

Usar Conventional Commits:

```text
feat(scope): add challenge discovery list
fix(scope): prevent duplicate completion submissions
docs(scope): add contribution workflow
chore(scope): configure issue templates
test(scope): cover progression thresholds
```

Reglas:

- Escribir el resultado, no una lista vaga de archivos.
- Mantener commits revisables por unidad de trabajo.
- Mantener los tests junto al comportamiento que verifican.
- No agregar atribuciones automáticas ni trailers generados por herramientas.

## Testing y Verificación

Este repositorio puede no tener scripts hasta que llegue el slice de bootstrap. Es esperado, pero la verificación debe ser explícita igual.

CI queda pendiente intencionalmente hasta que PR1 cree `package.json` y scripts reales. PR1 debe agregar el workflow de GitHub Actions con los comandos disponibles de build, test, lint y typecheck; no se deben inventar scripts ficticios solo para llenar la plantilla.

| Situación | Qué registrar |
|-----------|---------------|
| El script existe | Comando exacto y resultado. |
| El script todavía no existe | Comando futuro esperado y tarea de bootstrap que lo agregará. |
| Chequeo manual de UI | Navegador/dispositivo, escenario y resultado observado. |
| Chequeo AWS/Amplify | Sandbox, dry-run o comando de deploy y nota de cuenta/entorno. |
| No aplica | `N/A - razón: ...`, explicando por qué no aplica para este cambio. |

Cuando una prueba deba fallar antes de la implementación, indicarlo en el issue o PR. Cuando la prueba esté disponible, actualizar el PR con el comando exacto y el resultado.
