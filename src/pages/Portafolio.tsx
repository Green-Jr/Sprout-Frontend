
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeaderAuth from "../components/HeaderAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSeedling } from "@fortawesome/free-solid-svg-icons";
import InvestmentModal from "../components/CardAndModals/InvestmentModal";
import SproutCoinsModal from "../components/CardAndModals/SproutsCoinsModal";
import { getUserProfile } from "../services/Users/UserApiService";
import { getUserPurchases, Purchase, viewInvestments, viewRedeemInvestments, Investment } from "../services/Accounts/AccountApiService";
import PurchaseDetailModal from "../components/CardAndModals/PurchaseDetailModal";

type Redemption = {
    id: string;
    investmentId: string | null;
    asset: string;
    amount: number;
    cryptoAmount: number;
    reason: string;
    date: string;
};

const listVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

export default function Portfolio() {
    // Compras reales
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [stateOrder, setStateOrder] = useState<number | undefined>(undefined);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

    // SproutCoins e inversiones
    const [isSproutModalOpen, setIsSproutModalOpen] = useState(false);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loadingInvestments, setLoadingInvestments] = useState(false);
    const [sproutCoins, setSproutCoins] = useState<number>(0);
    const [tab, setTab] = useState<"compras" | "redenciones">("compras");
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loadingRedemptions, setLoadingRedemptions] = useState(false);

    // Cargar compras reales
    const fetchPurchases = async () => {
        setLoadingPurchases(true);
        try {
            const res = await getUserPurchases(stateOrder);
            setPurchases(res.body.response.data);
        } catch (err) {
            setPurchases([]);
        }
        setLoadingPurchases(false);
    };

    const fetchInvestments = async () => {
        setLoadingInvestments(true);
        try {
            const res = await viewInvestments();
            setInvestments(res.body.response.investments);
        } catch (err) {
            setInvestments([]);
        }
        setLoadingInvestments(false);
    };

    const fetchSproutCoins = async () => {
        try {
            const res = await getUserProfile();
            setSproutCoins(res.body.response.ACCOUNT.SPROUT_COINS ?? 0);
        } catch {
            setSproutCoins(0);
        }
    };

    const fetchRedemptions = async () => {
        setLoadingRedemptions(true);
        try {
            const res = await viewRedeemInvestments();
            setRedemptions(res.body.response.history);
        } catch {
            setRedemptions([]);
        }
        setLoadingRedemptions(false);
    };

    // Refresca compras al montar, al cambiar el filtro y cada 30s
    useEffect(() => {
        fetchPurchases();
        const interval = setInterval(() => {
            fetchPurchases();
        }, 120000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [stateOrder]);

    // Refresca inversiones solo al montar y cada 30s
    useEffect(() => {
        fetchInvestments();
        fetchSproutCoins();
        const interval = setInterval(() => {
            fetchInvestments();
            fetchSproutCoins();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (tab === "redenciones") {
            fetchRedemptions();
        }
        // eslint-disable-next-line
    }, [tab]);

    return (
        <div className="min-h-screen bg-transparent text-green-500 flex flex-col items-center pixel-font">
            {/* HEADER DINÁMICO */}
            <HeaderAuth text="Inicio" link="/home" icon={faHome} />

            {/* SECCIÓN PRINCIPAL */}
            <main className="w-[95vw] max-w-7xl mt-24 flex space-x-8 h-[calc(100vh-120px)]">
                {/* CONTENEDOR DE TRANSACCIONES */}
                <div className="flex-[2] p-8 border-4 border-green-500 rounded-lg flex flex-col h-full">
                    <div className="flex flex-col gap-3 mb-6 items-center justify-center">
                        {/* Tabs principales */}
                        <div className="flex gap-4 mb-1">
                            <button
                                onClick={() => setTab("compras")}
                                className={`transition-all duration-200 rounded-lg px-5 py-2 text-base font-bold shadow-sm border-2 border-green-500
                                    ${tab === "compras"
                                        ? "bg-green-500 text-black scale-105 shadow-lg"
                                        : "bg-transparent text-green-500 hover:bg-green-900 hover:text-white"
                                    }`}
                            >
                                Compras
                            </button>
                            <button
                                onClick={() => setTab("redenciones")}
                                className={`transition-all duration-200 rounded-lg px-5 py-2 text-base font-bold shadow-sm border-2 border-green-500
                                    ${tab === "redenciones"
                                        ? "bg-green-500 text-black scale-105 shadow-lg"
                                        : "bg-transparent text-green-500 hover:bg-green-900 hover:text-white"
                                    }`}
                            >
                                Redenciones
                            </button>
                        </div>
                        {/* Filtros de compras */}
                        {tab === "compras" && (
                            <div className="flex gap-2 mt-3 flex-nowrap justify-center items-center w-full">
                                <button
                                    onClick={() => setStateOrder(undefined)}
                                    className={`transition-all duration-200 rounded px-3 py-1.5 text-sm font-semibold border-2 border-green-500
        ${stateOrder === undefined
                                            ? "bg-green-500 text-black scale-105 shadow"
                                            : "bg-transparent text-green-500 hover:bg-green-900 hover:text-white"
                                        }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setStateOrder(1)}
                                    className={`transition-all duration-200 rounded px-3 py-1.5 text-sm font-semibold border-2 border-green-500
        ${stateOrder === 1
                                            ? "bg-green-500 text-black scale-105 shadow"
                                            : "bg-transparent text-green-500 hover:bg-green-900 hover:text-white"
                                        }`}
                                >
                                    Pendientes
                                </button>
                                <button
                                    onClick={() => setStateOrder(2)}
                                    className={`transition-all duration-200 rounded px-3 py-1.5 text-sm font-semibold border-2 border-green-500
        ${stateOrder === 2
                                            ? "bg-green-500 text-black scale-105 shadow"
                                            : "bg-transparent text-green-500 hover:bg-green-900 hover:text-white"
                                        }`}
                                >
                                    Finalizadas
                                </button>
                                <button
                                    onClick={() => setStateOrder(3)}
                                    className={`transition-all duration-200 rounded px-3 py-1.5 text-sm font-semibold border-2 border-green-500
        ${stateOrder === 3
                                            ? "bg-green-500 text-black scale-105 shadow"
                                            : "bg-transparent text-green-500 hover:bg-green-900 hover:text-white"
                                        }`}
                                >
                                    Canceladas
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-grow custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {tab === "compras" ? (
                                <motion.div
                                    key={`compras-${stateOrder ?? "all"}`}
                                    variants={listVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {loadingPurchases ? (
                                        <div className="text-center py-8">Cargando compras...</div>
                                    ) : purchases.length === 0 ? (
                                        <div className="text-center py-8 text-green-400">No hay compras para mostrar.</div>
                                    ) : (
                                        purchases.map((p) => {
                                            const percent = p.amount > 0 ? Math.round((p.saveAmount / p.amount) * 100) : 0;
                                            return (
                                                <button
                                                    key={p.id}
                                                    className="group w-full flex justify-between items-center border-b border-green-500 pb-2 mb-2 hover:bg-green-500 hover:text-black transition-all p-2 rounded-lg"
                                                    onClick={() => setSelectedPurchase(p)}
                                                >
                                                    <div className="flex flex-col flex-1 text-left max-w-[320px]">
                                                        <span className="font-bold text-lg break-words whitespace-normal group-hover:text-black">{p.name}</span>
                                                        <span className="text-green-400 text-base group-hover:text-black">${p.amount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end min-w-[120px]">
                                                        <span className="font-bold text-green-400 text-lg group-hover:text-black">
                                                            {percent}% ahorrado
                                                        </span>
                                                        <span className="text-green-500 text-base group-hover:text-black">
                                                            ${p.saveAmount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="redenciones"
                                    variants={listVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {loadingRedemptions ? (
                                        <div className="text-center py-8">Cargando redenciones...</div>
                                    ) : redemptions.length === 0 ? (
                                        <div className="text-center py-8 text-green-400">No hay redenciones para mostrar.</div>
                                    ) : (
                                        redemptions.map((r) => (
                                            <div
                                                key={r.id}
                                                className="w-full flex justify-between items-center border-b border-green-500 pb-2 mb-2 p-2 rounded-lg"
                                            >
                                                <div className="flex flex-col flex-1 text-left max-w-[320px]">
                                                    <span className="font-bold text-lg">{r.asset}</span>
                                                    <span className="text-green-400 text-base">${r.amount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-col items-end min-w-[120px]">
                                                    <span className="text-green-400 text-base">
                                                        {r.cryptoAmount} {r.asset}
                                                    </span>
                                                    <span className="text-green-500 text-xs">
                                                        {new Date(r.date).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* CONTENEDOR DERECHO: SPROUTCOINS, TOTAL AHORRADO E INVERSIONES */}
                <div className="flex-1 flex flex-col h-full gap-6">
                    {/* SproutCoins */}
                    <div className="p-4 border-4 border-green-500 rounded-lg flex flex-col h-auto justify-between items-center">
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg flex items-center space-x-2">
                                <FontAwesomeIcon icon={faSeedling} className="text-green-500 text-2xl" />
                                <span>SproutCoins</span>
                            </h2>
                            <p className="text-2xl my-2">{sproutCoins}</p>
                        </div>
                        <button
                            className="border-2 border-green-500 px-4 py-2 mt-2 hover:bg-green-500 hover:text-black transition-all rounded-lg"
                            onClick={() => setIsSproutModalOpen(true)}
                        >
                            Canjear
                        </button>
                    </div>
                    {/* Inversiones */}
                    <section className="w-full p-6 border-4 border-green-500 rounded-lg flex flex-col flex-grow h-0">
                        <h2 className="text-xl mb-4 border-b-2 border-green-500 pb-2 sticky top-0 bg-transaparent">
                            Inversiones
                        </h2>
                        <div className="overflow-y-auto flex-grow custom-scrollbar">
                            {loadingInvestments ? (
                                <div className="text-center py-8">Cargando inversiones...</div>
                            ) : investments.length === 0 ? (
                                <div className="text-center py-8 text-green-400">No hay inversiones para mostrar.</div>
                            ) : (
                                investments.map((inv) => (
                                    <button
                                        key={inv.id}
                                        className="group w-full flex justify-between items-center border-b border-green-500 pb-2 mb-2 hover:bg-green-500 hover:text-black transition-all p-2 rounded-lg"
                                        onClick={() => setSelectedInvestment(inv)}
                                    >
                                        <span className="font-bold text-lg group-hover:text-black">{inv.asset}</span>
                                        <span className="text-green-400 text-base group-hover:text-black">${inv.currentValue.toLocaleString()}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* MODAL DE DETALLE DE COMPRA */}
            <PurchaseDetailModal
                open={!!selectedPurchase}
                onClose={() => setSelectedPurchase(null)}
                purchase={selectedPurchase}
                onCancelSuccess={fetchPurchases}
            />

            {/* MODAL DE INVERSIÓN */}
            {selectedInvestment && (
                <InvestmentModal
                    investment={selectedInvestment}
                    onClose={() => setSelectedInvestment(null)}
                    onRedeemSuccess={fetchInvestments}
                />
            )}

            {/* MODAL DE SPROUT-COINS */}
            {isSproutModalOpen && (
                <SproutCoinsModal
                    availableCoins={sproutCoins}
                    onClose={() => setIsSproutModalOpen(false)}
                    onRedeemSuccess={fetchSproutCoins}
                />
            )}

        </div>
    );
}
