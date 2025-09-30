import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/iwant-tg-business/' : '/',
  server: {
    port: 3000,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  publicDir: 'public'
}))
