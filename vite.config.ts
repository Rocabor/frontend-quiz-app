import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/Rocabor/", // DEBE coincidir exactamente con el nombre en GitHub
});
