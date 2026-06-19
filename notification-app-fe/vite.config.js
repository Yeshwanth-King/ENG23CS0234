import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: "src",
  envPrefix: ["VITE_", "TOKEN"],
  server: {
    port: 3000,
    proxy: {
      "/evaluation-service": {
        target: "http://4.224.186.213",
        changeOrigin: true,
      },
    },
  },
});
