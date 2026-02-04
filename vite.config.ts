import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Maps Airport',
        short_name: 'MapsAirport',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'MapsAirport-icon.png',
            sizes : '192x192',
            type: 'image/png'
          }
    
        ]
      }
    })
  ],
})