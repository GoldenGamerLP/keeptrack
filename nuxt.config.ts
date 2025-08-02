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
    "@vite-pwa/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
  ],
  nitro: {
    vercel: {
      functions: {
        maxDuration: 30,
      },
    },
    $production: {
      preset: "vercel",
    },
  },
  googleFonts: {
    preload: true,
    families: {
      Quicksand: "300..700",
    },
  },
  app: {
    rootAttrs: {
      lang: "de",
    },
    head: {
      charset: "utf-8",
      title: "KeepTrack",
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
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "KeepTrack" },
        { name: "apple-touch-fullscreen", content: "yes" },
        { name: "msapplication-TileColor", content: "#2aaa59" },
        { name: "msapplication-TileImage", content: "/pwa-512x512.png" },
        { name: "theme-color", content: "#2aaa59" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "application-name", content: "KeepTrack" },
        { name: "msapplication-navbutton-color", content: "#2aaa59" },
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
    keepalive: true,
  },
  colorMode: {
    classSuffix: "",
  },
  pwa: {
    strategies: sw ? "injectManifest" : "generateSW",
    srcDir: sw ? "service-worker" : undefined,
    filename: sw ? "sw.ts" : undefined,
    registerType: "autoUpdate",
    manifest: {
      name: "KeepTrack",
      short_name: "KeepTrack",
      theme_color: "#2aaa59",
      background_color: "#2aaa59",
      categories: ["productivity", "finance"],
      description: "Halte dein Minijob und andere tätigkeiten im Blick!",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      cleanupOutdatedCaches: true,
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: false,
      registerPlugin: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: "/",
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },
  experimental: {
    sharedPrerenderData: true,
    componentIslands: true,
  },
  vite: {
    optimizeDeps: {
      include: [
        "@shadcn-ui/vue",
        "@shadcn-ui/vue/accordion",
        "@shadcn-ui/vue/alert-dialog",
        "@shadcn-ui/vue/alert",
        "@shadcn-ui/vue/aspect-ratio",
        "@shadcn-ui/vue/avatar",
        "@shadcn-ui/vue/badge",
        "@shadcn-ui/vue/button",
        "@shadcn-ui/vue/card",
        "@shadcn-ui/vue/checkbox",
        "@shadcn-ui/vue/collapsible",
        "@shadcn-ui/vue/command",
        "@shadcn-ui/vue/dialog",
        "@shadcn-ui/vue/dropdown-menu",
        "@shadcn-ui/vue/form",
        "@shadcn-ui/vue/icons",
        "@shadcn-ui/vue/input",
        "@shadcn-ui/vue/label",
        "@shadcn-ui/vue/menu",
        "@shadcn-ui/vue/popover",
        "@shadcn-ui/vue/progress",
        "@shadcn-ui/vue/radio-group",
        "@shadcn-ui/vue/select",
        "@shadcn-ui/vue/separator",
        "@shadcn-ui/vue/sheet",
        "@shadcn-ui/vue/skeleton",
        "@shadcn-ui/vue/switch",
        "@shadcn-ui/vue/table",
        "@shadcn-ui/vue/tabs",
      ],
    },
  },
});
