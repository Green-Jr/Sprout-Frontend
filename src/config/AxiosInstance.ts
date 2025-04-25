// Importa InternalAxiosRequestConfig
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import settings from "../data/settings.json"
import { AxiosRepository } from "./AxiosRepository";

// Cambia la URL base según tu entorno
const BASE_URL = `${settings.url_server.url_backend}/${settings.url_server.path}`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Usa InternalAxiosRequestConfig para el parámetro y especifica el tipo de retorno de la promesa
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => { // <-- ¡Cambia el tipo del parámetro y especifica el retorno!
    // Añade los headers solo si existen
    const token = await AxiosRepository.getToken();
    const verify = await AxiosRepository.getVerify();
    const ip = await AxiosRepository.getIp();

    // Ahora que TypeScript sabe que config.headers es AxiosRequestHeaders, puedes añadirle propiedades
    // Ya no necesitas la comprobación `if (!config.headers)` porque el tipo InternalAxiosRequestConfig garantiza que existe
    if (token) {
       config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (verify) {
        config.headers["verify"] = verify;
    }
    if (ip) {
        config.headers["ip"] = ip;
    }

    return config; // Devuelve el objeto de configuración modificado
  },
  // El interceptor de error debería estar bien si AxiosError se puede importar
  (error: AxiosError) => Promise.reject(error)
);

export default axiosInstance;