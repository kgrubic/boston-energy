import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/boston-energy/",
  server: {
    proxy: {
      "/api": {
        target: "http://backend:8000", // docker-compose service name
        changeOrigin: true,
      },
    },
  },
});
