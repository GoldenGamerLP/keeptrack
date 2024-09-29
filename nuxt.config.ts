// https://nuxt.com/docs/api/configuration/nuxt-config

const sw = process.env.SW === "true";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/icon",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    '@vite-pwa/nuxt',
  ],
  icon: {
    collections: ["mdi","lucide"],
    serverBundle: "remote",
  },
  app: {
    head: {
      charset: "utf-8",
      meta: [
        // Primary Meta Tags
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "twitter:image", content: "/pwa-512x512.png" },
        { name: "x-ua-compatible", content: "IE=edge" },
        { name: "format-detection", content: "telephone=no" },
        //PWA Meta Tags
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "#2aaa59",
        },
        { name: "apple-mobile-web-app-title", content: "KeepTrack" },
        { name: "apple-touch-fullscreen", content: "yes" },
        { name: "msapplication-TileColor", content: "#2aaa59" },
        { name: "theme-color", content: "#2aaa59" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "application-name", content: "KeepTrack" },
        // SEO Meta Tags
        {
          name: "description",
          content: "Halte dein Minijob und andere tätigkeiten im Blick!",
        },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "KeepTrack" },
        { name: "keywords", content: "Minijob, Job, Arbeit, Tätigkeit" },
        //Apple links
        { name: "apple-touch-icon", content: "/pwa-512x512.png" },
        { name: "apple-touch-icon", content: "/pwa-192x192.png" },
      ],
    },
  },
  colorMode: {
    classSuffix: "",
  },
  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: 'KeepTrack',
      short_name: 'KeepTrack',
      theme_color: '#2aaa59',
      background_color: '#2aaa59',
      categories: ['productivity', 'finance'],
      description: 'Halte dein Minijob und andere tätigkeiten im Blick!',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      registerPlugin: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
});