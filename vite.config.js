import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Firebase's SDK alone is ~500 kB minified.
  build: { chunkSizeWarningLimit: 800 },
})
