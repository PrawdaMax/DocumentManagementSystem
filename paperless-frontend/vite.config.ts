import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 80,
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            }
        }
    }
});