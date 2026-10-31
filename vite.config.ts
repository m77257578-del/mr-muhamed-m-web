import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    hmr: false,
    ws: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        id: '/',
        name: 'منصة ام ويب التعليمية',
        short_name: 'ام ويب',
        description: 'منصة متكاملة للتعليم والتدريب التفاعلي',
        theme_color: '#0f1b2d',
        background_color: '#0f1b2d',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
});
