
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  email: string;
  loading: boolean;
  error: string | null;
  title?: string;
  description?: string;
}

const OTP_LENGTH = 6;

const OtpModal: React.FC<OtpModalProps> = ({
  open,
  onClose,
  onSubmit,
  email,
  loading,
  error,
  title = "Verifica tu correo",
  description = "Hemos enviado un código de verificación a tu correo. Ingresa el código para continuar."
}) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) setOtp(Array(OTP_LENGTH).fill(""));
  }, [open]);

  if (!open) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Manejar pegado del código completo
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (!paste) return;
    const chars = paste.replace(/[^0-9a-zA-Z]/g, "").slice(0, OTP_LENGTH).split("");
    if (chars.length === 0) return;
    setOtp(prev => {
      const newOtp = [...prev];
      for (let i = 0; i < chars.length; i++) {
        newOtp[i] = chars[i];
        if (inputsRef.current[i]) {
          inputsRef.current[i]!.value = chars[i];
        }
      }
      if (inputsRef.current[chars.length - 1]) {
        inputsRef.current[chars.length - 1]?.focus();
      }
      return newOtp;
    });
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");
    onSubmit(otpValue);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="relative bg-[#101c16] border-4 border-green-500 rounded-2xl p-8 min-w-[320px] w-[92vw] max-w-md flex flex-col items-center shadow-2xl animate-fade-in"
        style={{ fontFamily: "inherit" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          className="absolute right-4 top-4 text-green-500 text-2xl hover:text-red-500 transition"
          onClick={onClose}
          disabled={loading}
          aria-label="Cerrar"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="w-full text-center text-2xl font-bold text-green-400 mb-4 pixel-font tracking-wide">{title}</h2>
        <p className="text-green-200 mb-4 text-center">
          {description}
          <br />
          <span className="font-bold">{email}</span>
        </p>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
            <input
              key={idx}
              ref={el => { inputsRef.current[idx] = el; }}
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={1}
              className="w-12 h-14 text-center text-2xl border-2 border-green-500 bg-transparent text-green-300 pixel-font rounded-lg focus:outline-none focus:border-green-300 focus:bg-green-900/30 transition-all duration-150 shadow-md"
              value={otp[idx]}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={loading}
              style={{ transition: "box-shadow 0.2s" }}
            />
          ))}
        </div>
        {error && <div className="text-red-400 mb-2 text-sm text-center">{error}</div>}
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 p-3 bg-green-500 text-black pixel-font rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all text-lg"
            onClick={handleSubmit}
            disabled={loading || otp.some(d => !d)}
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95);}
            to { opacity: 1; transform: scale(1);}
          }
          .animate-fade-in {
            animation: fade-in 0.25s ease;
          }
        `}
      </style>
    </div>
  );
};

export default OtpModal;
