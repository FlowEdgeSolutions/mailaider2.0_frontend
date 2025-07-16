import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { ServerOptions } from "https";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/MailAider4.0/" : "/",
  server: {
    host: "::",
    port: 8080,
    https: {} as ServerOptions,
    headers: {
      // Erweiterte CSP für Office Add-ins
      "Content-Security-Policy":
        "default-src 'self' 'unsafe-inline' https: wss:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://appsforoffice.microsoft.com https://ajax.aspnetcdn.com; " +
        "connect-src 'self' https: wss:; " +
        "frame-src 'self' https:; " +
        "img-src 'self' data: https:;",
      // Wichtig für Office Add-ins
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
        main: "./index.html",
        functionFile: "./public/function.html",
      },
    },
    // Für bessere Office Add-in Kompatibilität
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
      },
    },
  },
  // Für Office Add-in Entwicklung
  define: {
    global: "globalThis",
  },
}));