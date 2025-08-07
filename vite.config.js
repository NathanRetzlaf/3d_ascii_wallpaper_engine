import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// ensure all asset paths are relative, so it works in Wallpaper Engine
export default defineConfig({
  base: "./",

  build: {
    // output into a folder you can point Wallpaper Engine at
    outDir: "dist",
    // where to put hashed JS/CSS/assets under outDir
    assetsDir: "assets",
    // clear the folder on each build
    emptyOutDir: true,
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "models",
          dest: ".",
        },
      ],
    }),
  ],
});
