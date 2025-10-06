import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.baseUrl = config.env.baseUrl 
        ? config.env.baseUrl 
        : "https://rsfeb25.gsgus.com";
      return config;
    },
  },
});

