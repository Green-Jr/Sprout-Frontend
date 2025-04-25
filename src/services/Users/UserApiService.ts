
import axiosInstance from "../../config/AxiosInstance";

// 1. Enviar OTP para nuevo usuario (registro)
export const sendOtpNewUser = async (email: string) => {
  return axiosInstance.post(
    "/auth/SendOtpNewUser",
    { email },
    { headers: {} }
  );
};

// 2. Registrar nuevo usuario
export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  expireToken: string;
  otpCode: string;
}
export const registerUser = async (data: RegisterUserPayload) => {
  return axiosInstance.post(
    "/users/RegisterUser",
    data,
    { headers: {} }
  );
};

// 3. Enviar OTP para login de usuario existente
export const sendOtpUser = async (email: string, password: string) => {
  return axiosInstance.post(
    "/auth/SendOtpUser",
    { email, password },
    { headers: {} }
  );
};

// 4. Verificar OTP de usuario existente
export interface VerifyOtpUserPayload {
  otpCode: string;
  expireToken: string;
}
export const verifyOtpUser = async (data: VerifyOtpUserPayload) => {
  return axiosInstance.post(
    "/auth/verifyOtpUser",
    data,
    { headers: {} }
  );
};

// 5. Login de usuario con OTP token
export const loginUser = async (email: string, otpToken: string) => {
  return axiosInstance.post(
    "/users/LoginUser",
    { email, otpToken },
    { headers: {} }
  );
};

// 6. Obtener perfil del usuario
export interface UserAccountInfo {
  USER_ID: string;
  NAME: string;
  EMAIL: string;
  MIN_INVESTMENT_AMOUNT: string;
  ACCOUNT: {
    ACCOUNT_ID: string;
    AMOUNT: number;
    SUB_AMOUNT: number;
    SPROUT_COINS: number;
    PREFERRED_CRYPTOS: string[];
    LOSS_PERCENTAGE: number | null;
    PROFIT_PERCENTAGE: number | null;
    RISK_MANAGEMENT_ENABLED: boolean;
  };
}

export interface UserProfileResponse {
  statusCode: number;
  body: {
    response: {
      USER_ID: string;
      NAME: string;
      EMAIL: string;
      MIN_INVESTMENT_AMOUNT: string;
      ACCOUNT: {
        ACCOUNT_ID: string;
        AMOUNT: number;
        SUB_AMOUNT: number;
        SPROUT_COINS: number;
        PREFERRED_CRYPTOS: string[];
        LOSS_PERCENTAGE: number | null;
        PROFIT_PERCENTAGE: number | null;
        RISK_MANAGEMENT_ENABLED: boolean;
      };
    };
    waitTime: string;
    Code: number;
    warning: number;
  };
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axiosInstance.get("/users/Profile");
  return response.data as UserProfileResponse;
};
