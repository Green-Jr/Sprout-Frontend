
import React, { useState } from "react";
import toast from "react-hot-toast";

interface RechargeModalProps {
  open: boolean;
  onClose: () => void;
  onRecharge: (amount: number) => Promise<void> | void;
}

export default function RechargeModal({
  open,
  onClose,
  onRecharge,
}: RechargeModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // Handler para cerrar solo si el click fue en el overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRechargeClick = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Ingresa un monto válido mayor a 0");
      return;
    }
    setLoading(true);
    try {
      await onRecharge(Number(amount));
      setAmount("");
      toast.success("¡Recarga exitosa!");
      onClose();
    } catch (err) {
      toast.error("Error al recargar la cuenta");
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#101c16] border-4 border-green-500 rounded-2xl p-8 min-w-[340px] w-[92vw] max-w-md flex flex-col items-center shadow-2xl animate-fade-in"
        style={{ fontFamily: "inherit" }}
        // Evita que el click dentro de la modal cierre la modal
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-green-400 mb-4 tracking-wide">Recargar cuenta</h2>
        <input
          type="number"
          min={1}
          className="border-2 border-green-500 rounded-lg p-3 mb-6 w-full text-green-500 bg-transparent outline-none text-lg placeholder:text-green-900 text-center"
          placeholder="Monto a recargar"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={loading}
        />
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg"
            onClick={handleRechargeClick}
            disabled={loading}
          >
            {loading ? "Recargando..." : "Recargar"}
          </button>
          <button
            className="flex-1 border-2 border-green-500 text-green-400 px-4 py-2 rounded-lg font-bold hover:bg-green-900 hover:text-white transition text-lg"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
      {/* Animación opcional */}
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
}
