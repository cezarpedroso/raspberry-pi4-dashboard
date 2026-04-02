import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Use Tailwind via postcss; vite-plugin-tailwindcss isn't necessary in Vite 4+
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const port = process.env.PORT ? Number(process.env.PORT) : 5173;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
  },
});
