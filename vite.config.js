import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "socket.io-client": fileURLToPath(
        new URL("./node_modules/socket.io-client/dist/socket.io.esm.min.js", import.meta.url)
      ),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.autohubexpress.us",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
