import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: "http://localhost:5000",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: "dist",
		sourcemap: true,
		rollupOptions: {
			output: {
				// Split the heavyweight libraries out of the main bundle. Without this
				// everything lands in one ~3.6 MB chunk that must download before the
				// first paint. These are grouped by how often they change, so a code
				// change does not force a re-download of React or the chart libraries.
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router-dom"],
					"mui-vendor": ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
					"chart-vendor": ["chart.js", "react-chartjs-2", "recharts"],
					"pdf-vendor": ["jspdf", "@react-pdf/renderer"],
					"map-vendor": ["leaflet", "react-leaflet"],
				},
			},
		},
	},
});
