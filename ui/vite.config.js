import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "vite-plugin-commonjs";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ["@babel/preset-env", "@babel/preset-react"],
      },
      jsxRuntime: "automatic",
    }),
    reactRefresh(),
    commonjs(),
  ],
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
      // Enable esbuild to handle .mjs files",
    },
  },
  css: {
    devSourcemap: false,
  },
});
