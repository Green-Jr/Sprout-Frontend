import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface SavingsModalProps {
  savingsAmount: number;
  onClose: () => void;
}

export default function SavingsModal({ savingsAmount, onClose }: SavingsModalProps) {
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRedeem = () => {
    if (redeemAmount > 0 && redeemAmount <= savingsAmount) {
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
      <div
        className="bg-black border-4 border-green-500 p-8 w-[480px] max-w-lg text-center relative rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          className="absolute top-3 right-3 text-green-500 text-2xl hover:text-red-500 transition"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Título */}
        <h2 className="text-3xl text-green-500 pixel-font mb-6">Canjea tu dinero ahorrado</h2>

        {/* Dinero disponible */}
        <p className="text-lg">Monto disponible</p>
        <p className="text-4xl font-bold text-green-500">${savingsAmount.toLocaleString()}</p>

        {/* Input de canjeo */}
              <input
                  type="number"
                  className="mt-4 w-full p-3 text-xl text-center border-2 border-green-500 bg-black text-green-500 rounded-lg outline-none appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Ingresa el monto"
                  value={redeemAmount || ""}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  min="0"
                  max={savingsAmount}
              />

        {/* Botón de canjeo */}
        <button
          className={`w-full mt-6 p-3 border-2 rounded-lg text-xl transition-all ${
            redeemAmount > 0 && redeemAmount <= savingsAmount
              ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
              : "border-gray-600 text-gray-600 cursor-not-allowed"
          }`}
          onClick={handleRedeem}
          disabled={redeemAmount <= 0 || redeemAmount > savingsAmount}
        >
          Canjear
        </button>
      </div>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-black border-4 border-green-500 p-6 w-[400px] text-center rounded-lg">
            <h2 className="text-2xl text-green-500 pixel-font mb-4">Canjeo Exitoso</h2>
            <p className="text-lg">Has canjeado:</p>
            <p className="text-3xl font-bold text-green-500">${redeemAmount.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
