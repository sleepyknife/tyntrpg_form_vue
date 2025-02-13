import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/tyntrpg_form_vue/' // 例如你的 repo 是 "my-vue-app"，這裡就要填 "/my-vue-app/"

})
