import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (required for Docker)
    port: 3000,
    strictPort: true, // Fail if port 3000 is already in use
    watch: {
      usePolling: true, // Required for file watching in Docker on some systems
    },
  },
})

