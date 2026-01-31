import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/Frontend-quiz-app/", // DEBE coincidir exactamente con el nombre en GitHub
});
