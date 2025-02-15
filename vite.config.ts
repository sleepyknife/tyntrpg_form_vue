import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/tyntrpg_form_vue/' : '/';
  return {
    plugins: [vue()],
    base
  };
});
