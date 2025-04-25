import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { makePurchase } from "../../services/Accounts/AccountApiService";

interface ProductPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    image: string;
    name: string;
    price: number;
    description?: string;
  } | null;
  onPurchaseSuccess?: () => void;
}

// Componente para animar los puntos suspensivos
function DotsLoader() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + "." : ""));
    }, 350);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-6 text-center">{dots}</span>;
}

export default function ProductPurchaseModal({
  open,
  onClose,
  product,
  onPurchaseSuccess,
}: ProductPurchaseModalProps) {
  const [savingPercent, setSavingPercent] = useState<number | "">(1);
  const [loading, setLoading] = useState(false);

  // Limpiar el input cada vez que la modal se abre o se cierra
  useEffect(() => {
    if (!open) {
      setSavingPercent(1);
    }
  }, [open]);

  if (!open || !product) return null;

  const handlePurchase = async () => {
    if (
      savingPercent === "" ||
      Number(savingPercent) < 1 ||
      Number(savingPercent) > 10
    ) {
      toast.error("El porcentaje de ahorro debe ser entre 1% y 10%");
      return;
    }
    setLoading(true);
    try {
      const saveAmount = Math.round(product.price * (Number(savingPercent) / 100));
      await makePurchase({
        NAME: product.name,
        AMOUNT: product.price,
        SAVE_AMOUNT: saveAmount,
      });
      toast.success("¡Compra realizada con éxito!");
      setSavingPercent(1);
      onClose();
      if (onPurchaseSuccess) onPurchaseSuccess();
    } catch (err) {
      toast.error("Error al realizar la compra");
    }
    setLoading(false);
  };

  // Handler para cerrar solo si el click fue en el overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#101c16] border-4 border-green-500 rounded-2xl p-8 min-w-[340px] w-[92vw] max-w-md flex flex-col items-center shadow-2xl animate-fade-in"
        style={{ fontFamily: "inherit" }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-green-400 mb-4 tracking-wide">Comprar producto</h2>
        <img
          src={product.image}
          alt={product.name}
          className="w-32 h-32 object-contain rounded-lg mb-2"
        />
        <p className="text-green-300 font-bold text-lg mb-1 text-center">{product.name}</p>
        <p className="text-green-500 text-base mb-2">{product.description}</p>
        <p className="text-green-400 text-xl font-bold mb-4">
          Precio: ${product.price.toLocaleString()}
        </p>
        <label className="w-full text-green-400 font-semibold mb-2">
          ¿Qué porcentaje deseas ahorrar? (1% - 10%)
          <input
            type="number"
            min={1}
            max={10}
            className="border-2 border-green-500 rounded-lg p-2 mt-1 w-full text-green-500 bg-transparent outline-none text-center"
            value={savingPercent}
            onChange={e => setSavingPercent(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Ej: 5"
            disabled={loading}
          />
        </label>
        <div className="flex gap-4 w-full mt-4">
          <button
            className="flex-1 bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg"
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? <><DotsLoader /></> : "Comprar"}
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
