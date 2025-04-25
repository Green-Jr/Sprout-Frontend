import { useState } from "react";
import toast from "react-hot-toast";
import { redeemSproutsCoins } from "../../services/Accounts/AccountApiService";

interface SproutCoinsModalProps {
  availableCoins: number;
  onClose: () => void;
  onRedeemSuccess?: () => void;
}

export default function SproutCoinsModal({
  availableCoins,
  onClose,
  onRedeemSuccess,
}: SproutCoinsModalProps) {
  const [coinsToRedeem, setCoinsToRedeem] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    const coins = Number(coinsToRedeem);
    if (!coins || coins <= 0 || coins > availableCoins) {
      toast.error("Ingresa una cantidad válida de SproutCoins.");
      return;
    }
    setLoading(true);
    try {
      await redeemSproutsCoins({ SPROUT_COINS: coins });
      toast.success("¡SproutCoins redimidas con éxito!");
      setCoinsToRedeem("");
      onClose();
      if (onRedeemSuccess) onRedeemSuccess();
    } catch (err) {
      toast.error("Error al redimir SproutCoins.");
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
        className="relative bg-[#101c16] border-4 border-green-500 rounded-2xl p-8 min-w-[340px] w-[92vw] max-w-md flex flex-col items-center shadow-2xl animate-fade-in"
        style={{ fontFamily: "inherit" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          className="absolute right-4 top-4 text-green-500 text-2xl hover:text-red-500 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="w-full text-center text-2xl font-bold text-green-400 mb-4 tracking-wide">
          Canjear SproutCoins
        </h2>

        <div className="w-full mb-2 flex flex-col items-center">
          <span className="font-semibold text-green-300 text-lg mb-2">
            Disponibles: <span className="font-bold">{availableCoins}</span>
          </span>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-lg pointer-events-none select-none">🌱</span>
            <input
              type="number"
              min={1}
              max={availableCoins}
              className="border-2 border-green-500 rounded-lg p-2 pl-8 mt-1 w-full text-green-500 bg-green-900/20 outline-none text-center font-bold focus:ring-2 focus:ring-green-400 transition"
              placeholder={`Cantidad a canjear`}
              value={coinsToRedeem}
              onChange={e => setCoinsToRedeem(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="text-green-400 text-xs mt-1 text-center">
            Ingresa la cantidad de SproutCoins a canjear.
          </div>
        </div>
        <button
          className="w-full bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg mt-3"
          onClick={handleRedeem}
          disabled={loading}
        >
          {loading ? "Canjeando..." : "Canjear"}
        </button>
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