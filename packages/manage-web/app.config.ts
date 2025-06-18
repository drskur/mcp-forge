import {defineConfig} from "@solidjs/start/config";
import {resolve} from "node:path"

export default defineConfig({
    vite: {
        resolve: {
            alias: {
                "@": resolve(__dirname, "./src")
            }
        }
    }
});
