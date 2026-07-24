# Explorador Urbano

MVP de hackathon para descubrir una ciudad a través de desafíos: encontrar puntos de interés cercanos, validar la visita con evidencia en el lugar (geolocalización + foto) y acumular progreso gamificado. Experiencia mobile-first, PWA instalable, desplegable en Vercel con Supabase.

## Cómo correr

```bash
npm install
npm run dev        # servidor de desarrollo
```

Otros scripts:

| Script | Para qué |
|--------|----------|
| `npm run build` | Compila TypeScript y genera el build de producción (incluye manifest + service worker de la PWA). |
| `npm run preview` | Sirve el build de producción (necesario para probar la PWA). |
| `npm run test` | Tests con Vitest. |
| `npm run lint` | Lint con oxlint. |
| `npm run typecheck` | Chequeo de tipos con `tsc`. |

## Documentación

- **Fuente de verdad** (alcance, requisitos, specs, decisiones técnicas y tareas): `openspec/changes/urban-explorer-mvp/`. Si el código y OpenSpec no coinciden, se pausa y se actualiza el plan antes de ampliar implementación.
- **Cómo contribuir** (GitHub Flow, PRs, convenciones): `CONTRIBUTING.md`.
- **Colaboradores con Kiro**: `.kiro/steering/steering.md`.

## Stack

Vite + React + TypeScript (frontend, PWA) · Supabase (Auth, Postgres/RLS, Storage privado) · Vercel (hosting).
