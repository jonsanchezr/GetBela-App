// =============================================================================
// Helper de URL base de la API.
//
// Resuelve la URL contra la que el frontend pide los archivos del backend
// (logos de negocio, imagenes de servicios, banners).
//
// La base sale de la variable de entorno VITE_API_URL, que se define en el
// momento del build:
//
//   - Desarrollo (npm run dev): el compose publica el backend en
//     http://localhost:8000 y el frontend corre en 5173, en otro puerto.
//     La URL tiene que ser absoluta y cross-origin, asi que se define
//     VITE_API_URL=http://localhost:8000 en el .env.local de desarrollo.
//
//   - Produccion: frontend y API comparten el dominio
//     (https://getbela.syrexsoftware.com), y la API vive bajo el prefijo
//     /api. La URL es relativa, lo que ademas evita el problema de CORS y de
//     las cookies de terceros.
//
// Si VITE_API_URL no esta definida, la base queda vacia y las URLs se
// resuelven como relativas al dominio actual, que es el comportamiento
// correcto cuando frontend y backend comparten dominio.
// =============================================================================

export const API_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Construye la URL absoluta de un recurso del backend.
 *
 * @param {string} path Ruta del recurso. Con o sin barra inicial.
 * @returns {string} URL final.
 */
export function apiUrl(path) {
  if (!path) return API_URL;
  const base = API_URL.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export default apiUrl;
