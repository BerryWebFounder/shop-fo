export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css'],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false,
    }
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8081/api',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/*', 'application/pdf', 'text/*']
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8081/api',
        changeOrigin: true,
        prependPath: true,
      }
    },
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },
  ssr: true,
  experimental: {
    payloadExtraction: false // SSR 관련 이슈 해결
  },
  components: {
    global: true,
    dirs: ['~/components']
  }
})