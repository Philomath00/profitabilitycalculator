import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Client-only app: no backend/proxy config needed (see plan.md Technical Context).
export default defineConfig({
  plugins: [react()],
});
