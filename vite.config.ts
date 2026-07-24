import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (not 'autoUpdate'): a new service worker waits until the user
      // confirms the update prompt, so the app never silently swaps app-shell
      // assets mid-session. See src/shared/pwa/useServiceWorkerUpdate.ts.
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
            // Placeholder pattern for the future read-only challenge catalog
            // endpoint (Supabase not wired up yet in this repo). Stale-while-
            // revalidate lets a previously viewed catalog render instantly
            // offline while refreshing it in the background when online.
            //
            // NON-NEGOTIABLE: this pattern MUST stay scoped to read-only
            // catalog reads. It must never match:
            //   - Supabase Auth endpoints (e.g. /auth/v1/*)
            //   - the completion write boundary (submit_completion / RPC calls)
            //   - private Supabase Storage evidence URLs (e.g. /storage/v1/object/*)
            // Those requests must always bypass the cache and hit the network.
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
