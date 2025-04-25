import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import {
  listCryptos,
  updateCryptoPreferences,
  updateRiskManagement,
  updateMinInvestment,
} from "../../services/Accounts/AccountApiService";

interface FinancialConfigModalProps {
  open: boolean;
  onClose: () => void;
  initialLoss: number | null;
  initialProfit: number | null;
  initialRiskEnabled: boolean;
  initialCryptos: string[];
  initialMinInvestment: number | null;
  onConfigSaved: () => void;
}

export default function FinancialConfigModal({
  open,
  onClose,
  initialLoss,
  initialProfit,
  initialRiskEnabled,
  initialCryptos,
  initialMinInvestment,
  onConfigSaved,
}: FinancialConfigModalProps) {
  // Márgenes de riesgo
  const [loss, setLoss] = useState<number | "">(initialLoss ?? "");
  const [profit, setProfit] = useState<number | "">(initialProfit ?? "");
  const [riskEnabled, setRiskEnabled] = useState<boolean>(!!initialRiskEnabled);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // Criptos preferidas
  const [selectedCryptos, setSelectedCryptos] = useState<string[]>(initialCryptos);
  const [allCryptos, setAllCryptos] = useState<string[]>([]);
  const [loadingCryptos, setLoadingCryptos] = useState(false);

  // Monto mínimo de inversión
  const [minInvestment, setMinInvestment] = useState<number | "">(initialMinInvestment ?? "");
  const [loadingMin, setLoadingMin] = useState(false);

  useEffect(() => {
    if (open) {
      setLoss(initialLoss ?? "");
      setProfit(initialProfit ?? "");
      setRiskEnabled(!!initialRiskEnabled);
      setSelectedCryptos(initialCryptos);
      setMinInvestment(initialMinInvestment ?? "");
      // Consultar criptos disponibles solo al abrir la modal
      listCryptos().then(res => {
        const arr = res.data?.body?.response?.cryptos || res.data?.body?.response?.data || [];
        setAllCryptos(arr.map((c: any) => c.symbol || c.name || c));
      });
    }
  }, [open, initialLoss, initialProfit, initialRiskEnabled, initialCryptos, initialMinInvestment]);

  // Guardar márgenes de riesgo
  const handleSaveRisk = async () => {
    setLoadingRisk(true);
    try {
      await updateRiskManagement({
        lossPercentage: typeof loss === "number" ? loss : 0,
        profitPercentage: typeof profit === "number" ? profit : 0,
        riskManagementEnabled: riskEnabled,
      });
      toast.success("¡Márgenes actualizados!");
      onConfigSaved();
    } catch (err) {
        toast.error("Error al guardar márgenes.");
    }
    setLoadingRisk(false);
  };

  // Guardar criptos preferidas
  const handleSaveCryptos = async () => {
    setLoadingCryptos(true);
    try {
      await updateCryptoPreferences({ cryptos: selectedCryptos });
      toast.success("¡Criptos preferidas actualizadas!");
      onConfigSaved();
    } catch (err) {
        toast.error("Error al guardar criptos.");
    }
    setLoadingCryptos(false);
  };

  // Guardar monto mínimo de inversión
  const handleSaveMin = async () => {
    setLoadingMin(true);
    try {
      await updateMinInvestment({
        minInvestmentAmount: typeof minInvestment === "number" ? minInvestment : 0,
      });
      toast.success("¡Mínimo de inversión actualizado!");
      onConfigSaved();
    } catch (err) {
        toast.error("Error al guardar mínimo de inversión.");      
    }
    setLoadingMin(false);
  };

  // Validaciones
  const isRiskValid =
    riskEnabled
      ? typeof loss === "number" && loss >= 0 && typeof profit === "number" && profit >= 0
      : true;
  const isCryptosValid = selectedCryptos.length > 0;
  const isMinValid = typeof minInvestment === "number" && minInvestment > 0;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#101c16] border-4 border-green-500 rounded-2xl p-10 min-w-[420px] w-[98vw] max-w-2xl flex flex-col items-center shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ fontFamily: "inherit" }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-green-400 mb-6 tracking-wide">Configuración financiera</h2>

        {/* Márgenes de riesgo */}
        <div className="w-full mb-8 pb-6 border-b border-green-900">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-400 font-semibold text-lg">Márgenes de riesgo</span>
            <label className="flex items-center gap-2 text-green-400 font-semibold text-sm cursor-pointer select-none relative">
              <input
                type="checkbox"
                checked={riskEnabled}
                onChange={e => setRiskEnabled(e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-green-500 rounded bg-transparent checked:bg-green-500 checked:border-green-600 focus:ring-2 focus:ring-green-400 transition-all relative"
                style={{ outline: "none" }}
              />
              {/* Custom checkmark */}
              <span className="absolute w-5 h-5 pointer-events-none flex items-center justify-center left-0">
                <svg
                  className="hidden peer-checked:block"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <rect width="18" height="18" rx="5" fill="#22c55e" />
                  <path d="M5 9.5L8 12.5L13 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="relative pl-1">Activar gestión de riesgo</span>
            </label>
          </div>
          <div className="flex gap-4">
            <label className="flex-1 text-green-400 font-semibold">
              Pérdida (%)
              <input
                type="number"
                min={0}
                max={100}
                disabled={!riskEnabled}
                className="border-2 border-green-500 rounded-lg p-2 mt-1 w-full text-green-500 bg-transparent outline-none text-center"
                value={loss}
                onChange={e => setLoss(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej: 15"
              />
            </label>
            <label className="flex-1 text-green-400 font-semibold">
              Ganancia (%)
              <input
                type="number"
                min={0}
                max={100}
                disabled={!riskEnabled}
                className="border-2 border-green-500 rounded-lg p-2 mt-1 w-full text-green-500 bg-transparent outline-none text-center"
                value={profit}
                onChange={e => setProfit(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej: 20"
              />
            </label>
          </div>
          <button
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg w-full"
            onClick={handleSaveRisk}
            disabled={loadingRisk || !isRiskValid}
          >
            {loadingRisk ? "Guardando..." : "Guardar márgenes"}
          </button>
        </div>

        {/* Criptos preferidas */}
        <div className="w-full mb-8 pb-6 border-b border-green-900">
          <span className="text-green-400 font-semibold text-lg mb-2 block">Criptos preferidas</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {allCryptos.map((crypto, idx) => (
              <label key={crypto + idx} className="flex items-center gap-2 text-green-300 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={selectedCryptos.includes(crypto)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedCryptos([...selectedCryptos, crypto]);
                    } else {
                      setSelectedCryptos(selectedCryptos.filter(c => c !== crypto));
                    }
                  }}
                  className="peer appearance-none w-5 h-5 border-2 border-green-500 rounded bg-transparent checked:bg-green-500 checked:border-green-600 focus:ring-2 focus:ring-green-400 transition-all relative"
                  style={{ outline: "none" }}
                />
                {/* Custom checkmark */}
                <span className="absolute w-5 h-5 pointer-events-none flex items-center justify-center left-0">
                  <svg
                    className="hidden peer-checked:block"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <rect width="18" height="18" rx="5" fill="#22c55e" />
                    <path d="M5 9.5L8 12.5L13 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="relative pl-1">{crypto}</span>
              </label>
            ))}
          </div>
          <button
            className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg w-full"
            onClick={handleSaveCryptos}
            disabled={loadingCryptos || !isCryptosValid}
          >
            {loadingCryptos ? "Guardando..." : "Guardar criptos"}
          </button>
        </div>

        {/* Monto mínimo de inversión */}
        <div className="w-full mb-2">
          <span className="text-green-400 font-semibold text-lg mb-2 block">Monto mínimo de inversión</span>
          <input
            type="number"
            min={1}
            className="border-2 border-green-500 rounded-lg p-2 mt-1 w-full text-green-500 bg-transparent outline-none text-center"
            value={minInvestment}
            onChange={e => setMinInvestment(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Ej: 20000"
          />
          <button
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg w-full"
            onClick={handleSaveMin}
            disabled={loadingMin || !isMinValid}
          >
            {loadingMin ? "Guardando..." : "Guardar monto mínimo"}
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
