import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/PhoenixGuild/',  // <-- set this to your repo name with slashes
  plugins: [react()],
});
