import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon-hc.jpg",
        "icon-hc.png",
        "screenshot-mobile.png",
        "screenshot-desktop.png",
      ],
      manifest: {
        name: "Rumah Quran HC",
        short_name: "RQ HC",
        description: "Harum Center - Rumah Quran Management System",
        theme_color: "#eab308",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-hc.png",
            sizes: "400x400",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-hc.png",
            sizes: "400x400",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshot-mobile.png",
            sizes: "488x1055",
            type: "image/png",
            // @ts-ignore — form_factor is valid per W3C spec
            form_factor: "narrow",
            label: "Rumah Quran HC Login",
          },
          {
            src: "screenshot-desktop.png",
            sizes: "1600x1000",
            type: "image/png",
            // @ts-ignore — form_factor is valid per W3C spec
            form_factor: "wide",
            label: "Rumah Quran HC Dashboard",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,jpg,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60,
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
