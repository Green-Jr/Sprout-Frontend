
import React, { useState } from "react";
import Header from "../../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import OtpModal from "../../components/CardAndModals/OtpModal";
import LoadingDots from "../../components/CardAndModals/LoadingDots";
import { sendOtpNewUser, registerUser } from "../../services/Users/UserApiService"


export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [expireToken, setExpireToken] = useState<string | null>(null);

  // Loading
  const [showLoading, setShowLoading] = useState(false);


  // Manejo de campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Paso 1: Enviar OTP al correo
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!form.name || !form.email || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtpNewUser(form.email);
      // El backend debería retornar el expireToken
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

  // Paso 2: Completar registro con OTP
  const handleOtpSubmit = async (otp: string) => {
    setOtpError(null);
    setOtpLoading(true);
    try {
      if (!expireToken) {
        setOtpError("Token de expiración no recibido. Intenta de nuevo.");
        return;
      }
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        expireToken,
        otpCode: otp,
      };
      await registerUser(payload);
      setOtpModalOpen(false);
      setForm({ name: "", email: "", password: "" });
      setExpireToken(null);
      setShowLoading(true);
      setTimeout(() => {
        window.location.href = "/login";
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

      <h1 className="text-3xl text-green-500 mb-6 pixel-font">REGISTRO</h1>

      <form className="w-96 space-y-4" onSubmit={handleSendOtp}>
        <div className="relative">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-xl"
          />
          <input
            type="text"
            name="name"
            placeholder="Usuario"
            value={form.name}
            onChange={handleChange}
            className="w-full pl-12 p-3 border-2 border-green-500 bg-transparent text-green-300 text-center placeholder-green-500 pixel-font"
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
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
          {loading ? "Enviando código..." : "Registrarse"}
        </button>
      </form>

      <p className="mt-4 text-green-300">
        ¿Ya tienes cuenta? <Link to="/login" className="text-blue-400">Inicia sesión</Link>
      </p>

      {/* Loading después de registro exitoso */}
      {showLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <LoadingDots text=" " />
        </div>
      )}

      {/* Modal para OTP */}
      <OtpModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
        email={form.email}
        loading={otpLoading}
        error={otpError}
      />
    </div>
  );
}
