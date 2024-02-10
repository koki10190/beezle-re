import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        headers: {
            "X-Content-Type-Options": "nosniff", // Protects from improper scripts runnings
            "X-Frame-Options": "DENY", // Stops your site being used as an iframe
            "X-XSS-Protection": "1; mode=block", // Gives XSS protection to legacy browsers
        },
    },
});
