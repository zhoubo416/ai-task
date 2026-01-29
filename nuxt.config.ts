// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekApiBase: process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com',
    databaseUrl: process.env.DATABASE_URL,
    // Public keys (exposed to client-side)
    public: {
      apiBase: '/api'
    }
  },
  css: ['~/assets/css/main.css']
})
