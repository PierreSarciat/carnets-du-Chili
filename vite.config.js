import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
     ViteImageOptimizer({
      test: /\.(webp)$/i, // Cible uniquement les WebP générés
      include: ['**/public/assets/images/**/thumb/**'],
      exclude: ['node_modules'],
      webp: { quality: 80 }, // Ré-optimisation (optionnel)
      quiet: true,
    }),
  ],
  base: "/carnets-du-Chili/",
   resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@data': path.resolve(__dirname, './src/data'),
      '@assets': path.resolve(__dirname, './src/assets'),
        },
  },
 
})