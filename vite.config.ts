import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_2PC_IS_FOR_LOVERS_BASE ?? '/2pc-is-for-lovers/',
  plugins: [react()],
});
