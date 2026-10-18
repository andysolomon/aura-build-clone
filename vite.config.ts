import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_PORT = Number(process.env.API_PORT ?? 8787);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 5180,
    strictPort: true,
    allowedHosts: [".ts.net"],
    proxy: {
      "/api": `http://127.0.0.1:${API_PORT}`,
      "/s/": `http://127.0.0.1:${API_PORT}`,
    },
  },
  preview: { host: "127.0.0.1", allowedHosts: [".ts.net"] },
});
