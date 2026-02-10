import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    react(),
   tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "SocialLoop",
        short_name: "SocialLoop",
        description: "Modern Social Media App",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src:'/logo1.avif',
            sizes: "192x192",
            type: "image/avif"
          },
          {
            src:'/logo1.avif',
            sizes: "512x512",
            type: "image/avif"
          }
        ]
      }
    })
  ]
});
