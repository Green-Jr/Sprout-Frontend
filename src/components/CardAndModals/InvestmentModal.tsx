import { useState } from "react";
import toast from "react-hot-toast";
import { redeemInvestments } from "../../services/Accounts/AccountApiService";

export interface Investment {
  id: string;
  asset: string;
  cryptoAmount: number;
  currentValue: number;
  initialValue: number;
  performancePercentage: string;
  generatedDate: string;
}

interface InvestmentModalProps {
  investment: Investment;
  onClose: () => void;
  onRedeemSuccess?: () => void;
}

export default function InvestmentModal({
  investment,
  onClose,
  onRedeemSuccess,
}: InvestmentModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [loadingPartial, setLoadingPartial] = useState(false);
  const [loadingTotal, setLoadingTotal] = useState(false);

  const profitOrLoss = investment.currentValue - investment.initialValue;
  const isProfit = profitOrLoss >= 0;

  // Handler para cerrar solo si el click fue en el overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Retiro parcial
  const handlePartialWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0 || amount > investment.currentValue) {
      toast.error("Ingresa un monto válido para retirar.");
      return;
    }
    setLoadingPartial(true);
    try {
      await redeemInvestments({ INVESTMENT_ID: investment.id, AMOUNT: amount });
      toast.success("¡Retiro parcial realizado con éxito!");
      setWithdrawAmount("");
      onClose();
      if (onRedeemSuccess) onRedeemSuccess();
    } catch (err) {
      toast.error("Error al realizar el retiro parcial.");
    }
    setLoadingPartial(false);
  };

  // Retiro total
  const handleTotalWithdraw = async () => {
    setLoadingTotal(true);
    try {
      await redeemInvestments({ INVESTMENT_ID: investment.id });
      toast.success("¡Retiro total realizado con éxito!");
      setWithdrawAmount("");
      onClose();
      if (onRedeemSuccess) onRedeemSuccess();
    } catch (err) {
      toast.error("Error al realizar el retiro total.");
    }
    setLoadingTotal(false);
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
          {investment.asset}
        </h2>

        {/* Info relevante */}
        <div className="w-full mb-2">
          <div className="flex items-center justify-between mb-2 w-full">
            <span className="font-semibold text-green-300 text-left flex-1">Cantidad cripto:</span>
            <span className="text-right flex-1">{investment.cryptoAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-2 w-full">
            <span className="font-semibold text-green-300 text-left flex-1">Valor inicial:</span>
            <span className="text-right flex-1">${investment.initialValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-2 w-full">
            <span className="font-semibold text-green-300 text-left flex-1">Valor actual:</span>
            <span className="text-right flex-1">${investment.currentValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-2 w-full">
            <span className="font-semibold text-green-300 text-left flex-1">Rendimiento:</span>
            <span className={`text-right flex-1 font-bold ${isProfit ? "text-green-400" : "text-red-400"}`}>
              {investment.performancePercentage}%
            </span>
          </div>
          <div className="flex items-center justify-between mb-2 w-full">
            <span className="font-semibold text-green-300 text-left flex-1">Fecha:</span>
            <span className="text-right flex-1">{new Date(investment.generatedDate).toLocaleString()}</span>
          </div>
        </div>

        {/* Retiro parcial */}
        <div className="w-full mt-4">
          <label className="w-full text-green-400 font-semibold block mb-2 text-center">
            Retiro parcial
          </label>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-lg pointer-events-none select-none">$</span>
            <input
              type="number"
              min={1}
              max={investment.currentValue}
              className="border-2 border-green-500 rounded-lg p-2 pl-8 mt-1 w-full text-green-500 bg-green-900/20 outline-none text-center font-bold focus:ring-2 focus:ring-green-400 transition"
              placeholder={`Ingresa el monto `}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              disabled={loadingPartial || loadingTotal}
            />
          </div>
          <div className="text-green-400 text-xs mt-1 text-center">
            Monto máximo disponible: <span className="font-bold">${investment.currentValue.toLocaleString()}</span>
          </div>
          <button
            className="w-full mb-2 bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg mt-3"
            onClick={handlePartialWithdraw}
            disabled={loadingPartial || loadingTotal}
          >
            {loadingPartial ? "Retirando..." : "Retiro parcial"}
          </button>
        </div>

        {/* Retiro total */}
        <button
          className="w-full bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg"
          onClick={handleTotalWithdraw}
          disabled={loadingPartial || loadingTotal}
        >
          {loadingTotal ? "Retirando..." : "Retiro total"}
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
