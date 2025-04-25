import React, { useState } from "react";
import Header from "../../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { AxiosRepository } from "../../config/AxiosRepository";
import OtpModal from "../../components/CardAndModals/OtpModal";
import {
  sendOtpUser,
  verifyOtpUser,
  loginUser,
} from "../../services/Users/UserApiService";
import CharacterLoading from "../../components/Animations/CharacterLoading";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [expireToken, setExpireToken] = useState<string | null>(null);

  // Loading después de login exitoso
  const [showLoading, setShowLoading] = useState(false);

  const navigate = useNavigate();
  const { refresh } = useAuth(); // <-- Usa el método refresh

  // Manejo de campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Paso 1: Enviar OTP al correo
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtpUser(form.email, form.password);
      setExpireToken(res.data.body.expireToken);
      setOtpModalOpen(true);
    } catch (err: any) {
      setError(
        err.response?.data?.body?.response?.message ||
        err.response?.data?.message ||
        "Error enviando el código de verificación. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Completar login con OTP
  const handleOtpSubmit = async (otp: string) => {
    setOtpError(null);
    setOtpLoading(true);
    try {
      if (!expireToken) {
        setOtpError("Token de expiración no recibido. Intenta de nuevo.");
        setOtpLoading(false);
        return;
      }
      // Paso 2: Verificar OTP
      const verifyRes = await verifyOtpUser({ otpCode: otp, expireToken });
      // Extrae el nuevo expireToken del response
      const newExpireToken =
        verifyRes.data?.body?.response?.token

      if (!newExpireToken) {
        setOtpError("No se recibió el nuevo expireToken. Intenta de nuevo.");
        setOtpLoading(false);
        return;
      }

      // Paso 3: Login final con el nuevo expireToken
      const loginRes = await loginUser(form.email, newExpireToken);

      // Extrae los datos de la respuesta
      const response = loginRes.data?.body?.response;
      if (response?.token && response?.verify) {
        await AxiosRepository.setToken(response.token);
        await AxiosRepository.setVerify(response.verify);
      }
      if (response?.user) {
        await AxiosRepository.setUserData(response.user);
      }

      // Refresca el contexto de autenticación antes de navegar
      await refresh();

      setOtpModalOpen(false);
      setForm({ email: "", password: "" });
      setExpireToken(null);
      setShowLoading(true);
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err: any) {
      setOtpError(
        err.response?.data?.body?.response?.message ||
        err.response?.data?.message ||
        "Error verificando el código. Intenta de nuevo."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
      <Header />

      <h1 className="text-3xl text-green-500 mb-6 pixel-font">LOGIN</h1>

      <form className="w-96 space-y-4" onSubmit={handleSendOtp}>
        <div className="relative">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-xl"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
            className="w-full pl-12 p-3 border-2 border-green-500 bg-transparent text-green-300 text-center placeholder-green-500 pixel-font"
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon
            icon={faLock}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-xl"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full pl-12 p-3 border-2 border-green-500 bg-transparent text-green-300 text-center placeholder-green-500 pixel-font"
          />
        </div>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <button
          type="submit"
          className="w-full p-3 bg-green-500 text-black pixel-font"
          disabled={loading}
        >
          {loading ? "Enviando código..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-4 text-green-300">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-blue-400">
          Regístrate
        </Link>
      </p>

      {/* Loading después de login exitoso */}
      {showLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          {showLoading && <CharacterLoading text="Redirigiendo..." />}
        </div>
      )}

      {/* Modal para OTP */}
      <OtpModal
        open={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false);
          setOtpError(null);
        }}
        onSubmit={handleOtpSubmit}
        email={form.email}
        loading={otpLoading}
        error={otpError}
        title="Verifica tu identidad"
        description="Hemos enviado un código de verificación a tu correo. Ingresa el código para continuar."
      />
    </div>
  );
}
