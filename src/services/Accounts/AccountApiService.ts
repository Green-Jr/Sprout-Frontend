
import axiosInstance from "../../config/AxiosInstance";
import { MissionProgressService } from "../../utils/MissionProgressService";

// 1. Recargar cuenta
export interface RechargeAccountPayload {
  AMOUNT: string;
}
export const rechargeAccount = async (data: RechargeAccountPayload) => {
  const res = await axiosInstance.post(
    "/acounts/RechargeAcount",
    data
  );
  if (res.status === 200) {
    if (MissionProgressService.isMissionActive("make-deposit")) MissionProgressService.increment("make-deposit");
    if (MissionProgressService.isMissionActive("two-deposits")) MissionProgressService.increment("two-deposits");
  }
  return res;
};

// 2. Recargar Sprouts Coins
export interface RechargeSproutsCoinsPayload {
  AMOUNT: string;
}
export const rechargeSproutsCoins = async (data: RechargeSproutsCoinsPayload) => {
  const res = await axiosInstance.post(
    "/acounts/RechargeSproutsCoins",
    data
  );
  // No hay misión directa para recargar SproutCoins, solo para canjear
  return res;
};

// 3. Listar criptomonedas
export const listCryptos = async () => {
  return axiosInstance.get("/cryptos/ListCryptos");
};

// 4. Actualizar preferencias de criptos
export interface UpdateCryptoPreferencesPayload {
  cryptos: string[];
}
export const updateCryptoPreferences = async (data: UpdateCryptoPreferencesPayload) => {
  return axiosInstance.put(
    "/cryptos/preferences",
    data
  );
};

// 5. Actualizar mínimo de inversión
export interface UpdateMinInvestmentPayload {
  minInvestmentAmount: number;
}
export const updateMinInvestment = async (data: UpdateMinInvestmentPayload) => {
  return axiosInstance.put(
    "/users/UpdateMinInvestment",
    data
  );
};

// 6. Configuración de gestión de riesgo
export interface RiskManagementPayload {
  lossPercentage: number;
  profitPercentage: number;
  riskManagementEnabled: boolean;
}
export const updateRiskManagement = async (data: RiskManagementPayload) => {
  return axiosInstance.put(
    "/acounts/RiskManagement",
    data
  );
};

// 7. Buscar productos (query param: search)
export const searchProducts = async (search: string) => {
  return axiosInstance.get(`/acounts/SearchProducts`, {
    params: { query: search }
  });
};

// 8. Realizar compra
export interface MakePurchasePayload {
  NAME: string;
  AMOUNT: number;
  SAVE_AMOUNT: number;
}
export const makePurchase = async (data: MakePurchasePayload) => {
  const res = await axiosInstance.post(
    "/acounts/MakePurchase",
    data
  );
  if (res.status === 201) {
    if (MissionProgressService.isMissionActive("five-transactions")) MissionProgressService.increment("five-transactions");
    if (MissionProgressService.isMissionActive("buy-products")) MissionProgressService.increment("buy-products");
  }
  return res;
};

// 9. Cancelar compra
export interface CancelPurchasePayload {
  PURCHASE_ID: string;
}
export const cancelPurchase = async (data: CancelPurchasePayload) => {
  return axiosInstance.post(
    "/acounts/CanceledPurchase",
    data
  );
};

// 10. Redimir Sprouts Coins
export interface RedeemSproutsCoinsPayload {
  SPROUT_COINS: number;
}
export const redeemSproutsCoins = async (data: RedeemSproutsCoinsPayload) => {
  const res = await axiosInstance.post(
    "/acounts/RedeemSproutsCoins",
    data
  );
  if (res.status === 200) {
    if (MissionProgressService.isMissionActive("redeem-sproutcoins")) MissionProgressService.increment("redeem-sproutcoins");
    if (MissionProgressService.isMissionActive("redeem-sproutcoins-3")) MissionProgressService.increment("redeem-sproutcoins-3");
  }
  return res;
};

// 11. Ver inversiones
export interface Investment {
  id: string;
  asset: string;
  cryptoAmount: number;
  currentValue: number;
  initialValue: number;
  performancePercentage: string;
  generatedDate: string;
}

export interface ViewInvestmentsResponse {
  statusCode: number;
  body: {
    response: {
      investments: Investment[];
      totalCurrentValue: number;
      totalInitialValue: number;
    };
    waitTime: string;
    Code: number;
    warning: number;
  };
}

export const viewInvestments = async (): Promise<ViewInvestmentsResponse> => {
  const res = await axiosInstance.get("/acounts/ViewInvestements");
  return res.data as ViewInvestmentsResponse;
};

// 12. Redimir inversiones (retiro total o parcial)
export interface RedeemInvestmentsPayload {
  INVESTMENT_ID: string;
  AMOUNT?: number; // Opcional para retiro total
}
export const redeemInvestments = async (data: RedeemInvestmentsPayload) => {
  const res = await axiosInstance.post(
    "/acounts/RedeemInvestements",
    data
  );
  if (res.status === 200) {
    if (MissionProgressService.isMissionActive("first-redeem")) MissionProgressService.increment("first-redeem");
  }
  return res;
};

// 13. Ver historial de retiros de inversiones
export interface Redemption {
  id: string;
  investmentId: string | null;
  asset: string;
  amount: number;
  cryptoAmount: number;
  reason: string;
  date: string;
}

export const viewRedeemInvestments = async (): Promise<{
  statusCode: number;
  body: {
    response: {
      history: Redemption[];
      pagination: any;
    };
    waitTime: string;
    Code: number;
    warning: number;
  };
}> => {
  const res = await axiosInstance.get("/acounts/ViewRedeemInvestements");
  return res.data;
};

// 14. Listar historial de compras (con paginación y estado)
export interface Purchase {
  id: string;
  userId: string;
  name: string;
  amount: number;
  saveAmount: number;
  generatedDate: string;
  stateOrder: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PurchasesResponse {
  statusCode: number;
  body: {
    response: {
      message: string;
      data: Purchase[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    };
    waitTime: string;
    Code: number;
    warning: number;
  };
}

export async function getUserPurchases(
  stateOrder?: number,
  page: number = 1
): Promise<PurchasesResponse> {
  const params: any = { page };
  if (stateOrder) params.stateOrder = stateOrder;
  const res = await axiosInstance.get("/acounts/Purchases", { params });
  return res.data as PurchasesResponse;
}