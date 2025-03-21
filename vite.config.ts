import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/sitemap.xml': 'http://localhost:5000',
      '/rss': 'http://localhost:5000',
      '/robots.txt': 'http://localhost:5000'
    }
  }
})
