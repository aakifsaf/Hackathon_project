import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Ensure this is installed
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Essential for React projects
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy API requests to Django backend
      '/api': {
        target: 'http://127.0.0.1:8000', // Your Django backend server
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend URLs don't include /api
      },
    },
  },
});
