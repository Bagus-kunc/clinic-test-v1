// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@primevue/nuxt-module",
    "@nuxt/image",
    "@vite-pwa/nuxt",
  ],

  app: {
    head: {
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
        },
      ],
    },
  },

  tailwindcss: {
    cssPath: ["assets/css/tailwind.css", { injectPosition: "last" }],
    configPath: "tailwind.config.js",
    exposeConfig: false,
  },

  css: ["~/assets/css/tailwind.css", "~/assets/css/main.css"],

  primevue: {
    autoImport: false,
    components: {
      include: [
        "Accordion",
        "AccordionPanel",
        "AccordionHeader",
        "AccordionContent",
        "Button",
        "Card",
        "Carousel",
        "Listbox",
        "TieredMenu",
      ],
    },
    options: {
      theme: "none",
    },
  },

  pwa: {
    strategies: "injectManifest",
    srcDir: "service-worker",
    filename: "sw.ts",
    registerType: "autoUpdate",
    manifest: {
      name: "Diamond Clinic",
      short_name: "DiamonClinic",
      description: "Diamond Beauty & Anti Aging Clinic",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
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
      globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico,json}"],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    devOptions: {
      enabled: true,
      navigateFallback: "/",
      type: "module",
    },
  },

  postcss: {
    plugins: {
      "postcss-import": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: "2024-10-30",
});
