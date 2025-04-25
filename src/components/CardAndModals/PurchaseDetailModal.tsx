import { useState } from "react";
import toast from "react-hot-toast";
import { cancelPurchase } from "../../services/Accounts/AccountApiService";

interface PurchaseDetailModalProps {
    open: boolean;
    onClose: () => void;
    purchase: {
        id: string;
        name: string;
        amount: number;
        saveAmount: number;
        generatedDate: string;
        stateOrder: number;
    } | null;
    onCancelSuccess?: () => void;
}

export default function PurchaseDetailModal({
    open,
    onClose,
    purchase,
    onCancelSuccess,
}: PurchaseDetailModalProps) {
    const [loading, setLoading] = useState(false);

    if (!open || !purchase) return null;

    const handleCancel = async () => {
        setLoading(true);
        try {
            await cancelPurchase({ PURCHASE_ID: purchase.id });
            toast.success("Compra cancelada exitosamente");
            onClose();
            if (onCancelSuccess) onCancelSuccess();
        } catch (err) {
            toast.error("No se pudo cancelar la compra");
        }
        setLoading(false);
    };

    const estado =
        purchase.stateOrder === 1
            ? "Pendiente"
            : purchase.stateOrder === 2
                ? "Finalizada"
                : "Cancelada";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={e => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-[#101c16] border-4 border-green-500 rounded-2xl p-8 min-w-[320px] w-[92vw] max-w-md flex flex-col items-center shadow-2xl animate-fade-in"
                style={{ fontFamily: "inherit" }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="w-full text-center text-2xl font-bold text-green-400 mb-4 tracking-wide">Detalle de compra</h2>
                <div className="w-full mb-2">
                    <div className="flex justify-between mb-2 w-full">
                        <span className="font-semibold text-green-300 text-left flex-1">Producto:</span>
                        <span className="text-right flex-1">{purchase.name}</span>
                    </div>
                    <div className="flex justify-between mb-2 w-full">
                        <span className="font-semibold text-green-300 text-left flex-1">Monto:</span>
                        <span className="text-right flex-1">${purchase.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 w-full">
                        <span className="font-semibold text-green-300 text-left flex-1">Ahorrado:</span>
                        <span className="text-right flex-1">${purchase.saveAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 w-full">
                        <span className="font-semibold text-green-300 text-left flex-1">Fecha:</span>
                        <span className="text-right flex-1">{new Date(purchase.generatedDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 w-full">
                        <span className="font-semibold text-green-300 text-left flex-1">Estado:</span>
                        <span className="text-right flex-1">{estado}</span>
                    </div>
                </div>
                {purchase.stateOrder === 1 && (
                    <button
                        className="mt-4 bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-lg w-full"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {loading ? "Cancelando..." : "Cancelar compra"}
                    </button>
                )}
                <button
                    className="mt-2 border-2 border-green-500 text-green-400 px-4 py-2 rounded-lg font-bold hover:bg-green-900 hover:text-white transition text-lg w-full"
                    onClick={onClose}
                >
                    Cerrar
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
