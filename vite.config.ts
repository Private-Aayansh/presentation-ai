import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/presentation-ai/', 
  resolve: {
    alias: {
      events: 'events'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
