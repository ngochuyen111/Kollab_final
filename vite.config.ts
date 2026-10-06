import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom'], charts: ['recharts'], motion: ['framer-motion'], supabase: ['@supabase/supabase-js'] } } } },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
