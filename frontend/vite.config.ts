import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

const manifest: Partial<VitePWAOptions> = {
    registerType: "prompt",
    includeAssets: ["favicon.ico"],
    manifest: {
        short_name: "Beezle",
        name: "Beezle: RE",
        icons: [
            {
                src: "/icon_new.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#ff8e3d",
        background_color: "#000000",
    },
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            manifest,
            registerType: "autoUpdate",
        }),
    ],
    server: {
        headers: {
            "X-Content-Type-Options": "nosniff", // Protects from improper scripts runnings
            "X-Frame-Options": "DENY", // Stops your site being used as an iframe
            "X-XSS-Protection": "1; mode=block", // Gives XSS protection to legacy browsers
        },
    },
});
