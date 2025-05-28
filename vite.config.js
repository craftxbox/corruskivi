// vite.config.js
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    let extType = assetInfo.name.split(".").at(1);
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        extType = "img";
                    }
                    return `corru-editor/assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: "corru-editor/assets/js/[name]-[hash].js",
                entryFileNames: "corru-editor/assets/js/[name]-[hash].js",
            },
        },
    },
});
