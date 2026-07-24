import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (no 'autoUpdate'): un nuevo service worker espera hasta que el
      // usuario confirme el prompt de actualización, así la app nunca
      // reemplaza silenciosamente assets del app-shell a mitad de sesión.
      // Ver src/shared/pwa/useServiceWorkerUpdate.ts.
      registerType: "prompt",
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "maskable-512.png",
      ],
      manifest: {
        name: "Explorador Urbano",
        short_name: "Explorador Urbano",
        description:
          "Descubrí y completá desafíos urbanos cerca tuyo, con catálogo disponible offline.",
        theme_color: "#0f766e",
        background_color: "#0f766e",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the app shell: build-time JS/CSS/HTML and static icons.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        runtimeCaching: [
          {
            // Patrón placeholder para el futuro endpoint de solo lectura del
            // catálogo de desafíos (Supabase todavía no está cableado en este
            // repo). Stale-while-revalidate permite que un catálogo previamente
            // visto se renderice instantáneamente offline mientras se refresca
            // en segundo plano cuando hay conexión.
            //
            // NO NEGOCIABLE: este patrón MUST mantenerse acotado a lecturas
            // de solo lectura del catálogo. Nunca debe coincidir con:
            //   - endpoints de Supabase Auth (ej. /auth/v1/*)
            //   - el límite de escritura de completado (submit_completion / llamadas RPC)
            //   - URLs privadas de evidencia de Supabase Storage (ej. /storage/v1/object/*)
            // Esas solicitudes siempre deben saltarse el caché e ir a la red.
            urlPattern: /\/rest\/v1\/challenges(\?.*)?$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "challenge-catalog-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
