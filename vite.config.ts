import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
	resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [vue()],
    base: env.VITE_APP_BASE_URL || '/'
  };
});
