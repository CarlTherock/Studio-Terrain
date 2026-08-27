import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = '/Studio-Terrain/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'StudioTerrain',
        short_name: 'StudioTerrain',
        description:
          "Carnet de chantier professionnel pour designers d'intérieur/extérieur et équipes de construction.",
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#FDF8FA',
        theme_color: '#6B2D45',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testSetup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
