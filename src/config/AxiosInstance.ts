import axios from "axios";
import settings from "../data/settings.json"
import { AxiosRepository } from "./AxiosRepository";

// Cambia la URL base según tu entorno
const BASE_URL = `${settings.url_server.url_backend}/${settings.url_server.path}`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Añade los headers solo si existen
    const token = await AxiosRepository.getToken();
    const verify = await AxiosRepository.getVerify();
    const ip = await AxiosRepository.getIp();

    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    if (verify) config.headers["verify"] = verify;
    if (ip) config.headers["ip"] = ip;

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;