import axios from "axios";

const PROD_API = "https://boston-energy-backend.onrender.com";

export const api = axios.create({
  baseURL: import.meta.env.PROD ? `${PROD_API}/api` : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
