import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path, { resolve } from "path";
import type { ServerOptions } from "https";

export default defineConfig(({ mode }) => ({
  // Basis-URL für Produktion vs. Entwicklung
  base: mode === "production" ? "/MailAider4.0/" : "/",

  server: {
    host: "::",
    port: 8080,
    https: {} as ServerOptions,
    headers: {
      "Content-Security-Policy":
        "default-src 'self' 'unsafe-inline' https: wss:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://appsforoffice.microsoft.com https://ajax.aspnetcdn.com; " +
        "connect-src 'self' https: wss:; " +
        "frame-src 'self' https:; " +
        "img-src 'self' data: https:;",
      "X-Frame-Options": "SAMEORIGIN",
    },
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        functionFile: resolve(__dirname, "src/function.html"),
      },
    },
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
      },
    },
  },

  define: {
    global: "globalThis",
  },
}));
