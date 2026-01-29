import axios from "axios";

const PROD_API = "https://boston-energy-backend.onrender.com";

export const api = axios.create({
  baseURL: import.meta.env.PROD ? `${PROD_API}/api` : "/api",
});
