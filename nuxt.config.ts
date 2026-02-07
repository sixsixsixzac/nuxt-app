/// <reference types="node" />
import Aura from '@primeuix/themes/aura'
export default defineNuxtConfig({
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  devServer: {
    port: 3000,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
    },
  },
  modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
})


