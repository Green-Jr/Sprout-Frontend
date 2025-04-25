import React, { useEffect, useState } from "react";
import HeaderAuth from "../components/HeaderAuth";
import ProductCard from "../components/CardAndModals/ProductCard";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { getUserProfile } from "../services/Users/UserApiService";
import { searchProducts, rechargeAccount } from "../services/Accounts/AccountApiService";
import RechargePopup from "../components/CardAndModals/RechargePopup";
import RechargeModal from "../components/CardAndModals/RechargeModal";
import FinancialConfigModal from "../components/CardAndModals/FinancialConfigModal";
import ProductPurchaseModal from "../components/CardAndModals/ProductPurchaseModal";


interface Product {
  image: string;
  name: string;
  price: string;
  description: string;
}

export default function Home() {
  const [profile, setProfile] = useState<null | {
    AMOUNT: number;
    SUB_AMOUNT: number;
    LOSS_PERCENTAGE: number | null;
    PROFIT_PERCENTAGE: number | null;
    PREFERRED_CRYPTOS: string[];
    RISK_MANAGEMENT_ENABLED: boolean;
    MIN_INVESTMENT_AMOUNT: number | null;
  }>(null);

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Modal recarga
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Estado para loading de recarga
  const [recharging, setRecharging] = useState(false);

  // Modal de configuracion
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Modales de compra
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Refresca el perfil del usuario
  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      const account = res.body.response.ACCOUNT;
      setProfile({
        AMOUNT: account.AMOUNT,
        SUB_AMOUNT: account.SUB_AMOUNT,
        LOSS_PERCENTAGE: account.LOSS_PERCENTAGE,
        PROFIT_PERCENTAGE: account.PROFIT_PERCENTAGE,
        PREFERRED_CRYPTOS: account.PREFERRED_CRYPTOS,
        RISK_MANAGEMENT_ENABLED: account.RISK_MANAGEMENT_ENABLED,
        MIN_INVESTMENT_AMOUNT: res.body.response.MIN_INVESTMENT_AMOUNT
          ? Number(res.body.response.MIN_INVESTMENT_AMOUNT)
          : null,
      });
    } catch (err) {
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchProfile(); // Llama inmediatamente
    const interval = setInterval(() => {
      fetchProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    try {
      const res = await searchProducts(search.trim());
      const productsArr = res.data?.body?.response?.products || [];
      setProducts(
        productsArr.map((prod: any) => ({
          image: prod.thumbnail,
          name: prod.title,
          price: prod.price_cop ? prod.price_cop : 0, // <-- número
          description: prod.description,
        }))
      );
    } catch (err) {
      setProducts([]);
    }
    setLoadingProducts(false);
  };

  // Recarga real y refresca perfil
  const handleRecharge = async (amount: number) => {
    setShowRechargeModal(false);
    setRecharging(true);
    try {
      await rechargeAccount({ AMOUNT: amount.toString() });
      await fetchProfile(); // Refresca el perfil para mostrar el saldo actualizado
    } catch (error) {
      // Aquí puedes mostrar un toast o mensaje de error si lo deseas
      // Ejemplo: toast.error("No se pudo recargar la cuenta");
    }
    setRecharging(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-green-500 flex flex-col items-center pixel-font w-full">
      <HeaderAuth text="Portafolio" link="/portafolio" icon={faWallet} />

      <main className="w-full max-w-screen-xl mt-28 flex flex-col md:flex-row gap-8 px-2 md:px-9 mx-auto">
        {/* Columna Izquierda */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 relative">
          {/* Pop-up animado si no hay saldo */}
          {profile && profile.AMOUNT <= 0 && (
            <RechargePopup
              onClick={() => setShowRechargeModal(true)}
              message="Sin saldo?, recarga tu cuenta ¡YA!💸"
              className="-rotate-12 -left-10 top-2 right-auto"
            />
          )}
          {/* Saldo Total */}
          <section className="p-6 border-4 border-green-500 rounded-lg text-center w-full relative flex flex-col items-center">
            <h2 className="text-xl">Saldo Total</h2>
            <p className="text-4xl my-2 break-words">
              {profile ? `$${profile.AMOUNT.toLocaleString()}` : "Cargando..."}
            </p>
            {/* Botón recargar siempre visible */}
            <button
              className="mt-4 bg-green-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all"
              onClick={() => setShowRechargeModal(true)}
              disabled={recharging}
            >
              {recharging ? "Recargando..." : "Recargar"}
            </button>
          </section>
          {/* Resumen financiero */}
          <section className="p-6 border-4 border-green-500 rounded-lg w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Resumen financiero</h2>
              <button
                className="bg-green-500 text-black px-3 py-1 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all text-sm"
                onClick={() => setShowConfigModal(true)}
              >
                Configurar
              </button>
            </div>
            <p>
              Subsaldo:{" "}
              {profile
                ? `$${profile.SUB_AMOUNT.toLocaleString()}`
                : "Cargando..."}
            </p>
            <p>
              Mínimo de inversión:{" "}
              {profile
                ? profile.MIN_INVESTMENT_AMOUNT
                  ? `$${profile.MIN_INVESTMENT_AMOUNT.toLocaleString()}`
                  : "No configurado"
                : "Cargando..."}
            </p>
            <p>
              Margen de pérdida:{" "}
              {profile
                ? profile.LOSS_PERCENTAGE !== null
                  ? `${profile.LOSS_PERCENTAGE}%`
                  : "No configurado"
                : "Cargando..."}
            </p>
            <p>
              Margen de ganancia:{" "}
              {profile
                ? profile.PROFIT_PERCENTAGE !== null
                  ? `${profile.PROFIT_PERCENTAGE}%`
                  : "No configurado"
                : "Cargando..."}
            </p>
            <p>
              Criptos preferidas:{" "}
              {profile
                ? profile.PREFERRED_CRYPTOS && profile.PREFERRED_CRYPTOS.length > 0
                  ? profile.PREFERRED_CRYPTOS.join(", ")
                  : "No configuradas"
                : "Cargando..."}
            </p>

          </section>
        </div>

        {/* Columna Derecha */}
        <div className="max-w-none md:w-[490px] flex flex-col gap-4 min-w-0">
          {/* Barra de búsqueda */}
          <form
            className="flex mb-2 w-full"
            onSubmit={handleSearch}
            autoComplete="off"
          >
            <input
              type="text"
              className="flex-1 p-3 border-4 border-green-500 rounded-l-lg text-green-500 bg-transparent outline-none"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="p-3 border-4 border-green-500 border-l-0 bg-green-500 text-black rounded-r-lg font-bold hover:bg-green-600 hover:text-white transition-all"
              disabled={loadingProducts}
            >
              Buscar
            </button>
          </form>
          {/* Resultados de productos */}
          <div className="flex flex-col gap-4 max-h-[540px] overflow-y-auto scrollbar-hide">
            {loadingProducts ? (
              <div className="text-center w-full text-green-500">Buscando productos...</div>
            ) : products.length === 0 && search ? (
              <div className="text-center w-full text-green-500">No se encontraron productos.</div>
            ) : (
              products.map((product) => (
                <ProductCard
                  {...product}
                  price={`$${product.price.toLocaleString()}`}
                  onBuyClick={() => {
                    setSelectedProduct(product);
                    setPurchaseModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </main>
      {/* Modal de recarga */}
      <RechargeModal
        open={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRecharge={handleRecharge}
      />
      <ProductPurchaseModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        product={selectedProduct}
        onPurchaseSuccess={fetchProfile}
      />
      <FinancialConfigModal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        initialLoss={profile?.LOSS_PERCENTAGE ?? null}
        initialProfit={profile?.PROFIT_PERCENTAGE ?? null}
        initialRiskEnabled={profile?.RISK_MANAGEMENT_ENABLED ?? false}
        initialCryptos={profile?.PREFERRED_CRYPTOS ?? []}
        initialMinInvestment={profile?.MIN_INVESTMENT_AMOUNT ?? null}
        onConfigSaved={fetchProfile}
      />
    </div>
  );
}