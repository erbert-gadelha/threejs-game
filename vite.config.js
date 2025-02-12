import { defineConfig } from 'vite';

export default defineConfig({
  base: "/threejs-game/",
  server: {
    host: '0.0.0.0',
    port: 8080, // Escolha a porta desejada
  }
});

