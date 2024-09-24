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
  ],
  app: {
    head: {
      charset: "utf-8",
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "format-detection", content: "telephone=no" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucentnpm",
        },
        { name: "apple-mobile-web-app-title", content: "Nuxt Vite PWA" },
        { name: "msapplication-TileColor", content: "#ffffff" },
        { name: "theme-color", content: "#ffffff" },
        { name: "mobile-web-app-capable", content: "yes" },
      ],
      link: [{ rel: "manifest", href: "/manifest.webmanifest" }],
    },
  },
  colorMode: {
    classSuffix: "",
    preference: "light",
  }
});
