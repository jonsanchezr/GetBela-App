import axios from "axios";

// La URL de la API se resuelve en tiempo de build.
//
// En desarrollo (npm run dev) el compose publica el backend en
// http://localhost:8000 y el frontend corre en 5173, asi que la llamada
// tiene que ser cross-origin: por eso el valor por defecto es una URL
// absoluta.
//
// En produccion el frontend y la API se sirven bajo el mismo dominio
// (https://getbela.syrexsoftware.com), servidos por Traefik. Ahi conviene
// una ruta relativa ("/api"), que ademas elimina el problema de CORS y de
// cookies de terceros. Se define con VITE_API_URL al compilar.
//
// Si VITE_API_URL queda vacio, se usa la ruta relativa: es el comportamiento
// correcto cuando frontend y backend comparten dominio.
const API_URL = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
  baseURL: API_URL || "/api",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("getbela_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
