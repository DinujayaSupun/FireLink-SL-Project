// Single source of truth for the backend origin.
//
// Previously ~57 call sites hardcoded "http://localhost:5000", which meant the
// frontend only ever worked on a developer machine. Import from here instead of
// writing the host inline.
//
// Configure via frontend/.env:
//   VITE_API_URL=http://localhost:5000
//   VITE_API_BASE_URL=http://localhost:5000/api/v1   (optional override)

export const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000";

// The /api/v1 prefix used by the civilian auth, finance, supplier and salary routes.
export const API_V1_URL =
	import.meta.env.VITE_API_BASE_URL || `${API_BASE_URL}/api/v1`;

export default API_BASE_URL;
