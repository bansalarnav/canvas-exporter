import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // server: {
  //   proxy: {
  //     "^/notion/.*": {
  //       target: "https://api.notion.com/v1",
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/notion/, ""),
  //     },
  //   },
  // },
});
