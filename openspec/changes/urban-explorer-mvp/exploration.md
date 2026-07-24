## Exploración: urban-explorer-mvp

> Fases SDD posteriores acotaron el alcance aceptado. Usar `proposal.md`, `design.md`,
> `specs/*/spec.md`, y `tasks.md` como la fuente de verdad actual.

### Estado Actual
El repositorio estaba en estado de bootstrap durante la exploración: solo metadata de `.atl/` y
artefactos inicializados de `openspec/`, sin código fuente de aplicación, código de despliegue, manifest
de paquetes, ni test runner todavía.

El objetivo del producto es una aplicación web lista para hackathon que se sienta original, sea usable por usuarios
finales reales, y pueda publicarse rápido sin sobre-ingeniería. El mejor objetivo de MVP es un
loop de exploración de ciudad: descubrir lugares cercanos, completar un desafío caminando, probar
la llegada, ganar progresión y compartir el resultado.

### Enfoques
1. **MVP estático centrado en el navegador** — Frontend estático con estado solo local, APIs del navegador, y backend mínimo o nulo.
   - Pros: Más rápido de demostrar, más barato de hostear, fuerte novedad de hackathon a través de capacidades del dispositivo.
   - Contras: Persistencia débil, controles de anti-cheat limitados, mala continuidad multi-dispositivo.
   - Esfuerzo: Bajo

2. **MVP de plataforma administrada liviana** — Frontend web más un backend administrado pequeño para estado de desafíos, evidencia, progreso e identidad.
   - Pros: Mejor balance para un producto publicable, soporta persistencia y progresión, suficientemente rápido para un equipo de 3 personas.
   - Contras: Agrega trabajo de modelado de API/datos, la validación de prueba permanece basada en confianza a menos que se mantenga simple, la auth puede consumir tiempo si se incluye demasiado temprano.
   - Esfuerzo: Medio

3. **MVP de plataforma social completa** — Competencia en tiempo real, personalización compleja, feeds sociales, moderación y evidencia multimedia rica.
   - Pros: Mayor potencial de producto a largo plazo.
   - Contras: Demasiado grande para el alcance de hackathon, alto riesgo de presupuesto de review, diluye el loop central de desafío caminando.
   - Esfuerzo: Alto

### Recomendación
Elegir **MVP de plataforma administrada liviana** con un límite implacable alrededor del loop central:
geolocalización + evidencia fotográfica, un catálogo curado de una ciudad, Supabase para Auth/Postgres/RLS/
Storage y el límite de validación de completado, y Vercel para hosting.

### Riesgos
- La denegación de permisos del navegador o la baja precisión de GPS pueden romper el loop de completado sin un fallback elegante.
- Intentar enviar auth, grafo social, sincronización offline y modos duales de prueba juntos volará el alcance del hackathon.
- Los proveedores de mapas/geocodificación pueden introducir sorpresas de cuota o precio si se elige tarde.

### Listo para Propuesta
Sí — siempre que la siguiente fase fije la ciudad exacta, el dataset semilla, y la propiedad del
entorno Supabase/Vercel antes de la implementación.
