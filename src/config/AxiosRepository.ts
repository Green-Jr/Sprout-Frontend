import { StorageService } from "./StorageServiceSproutFound";

const TOKEN_KEY = "token";
const VERIFY_KEY = "verify";
const IP_KEY = "ip";
const USER_DATA_KEY = "user_data";

export const AxiosRepository = {
  async setToken(token: string) {
    await StorageService.set(TOKEN_KEY, token);
  },
  async getToken(): Promise<string | undefined> {
    return await StorageService.get(TOKEN_KEY);
  },
  async removeToken() {
    await StorageService.delete(TOKEN_KEY);
  },

  async setVerify(verify: string) {
    await StorageService.set(VERIFY_KEY, verify);
  },
  async getVerify(): Promise<string | undefined> {
    return await StorageService.get(VERIFY_KEY);
  },
  async removeVerify() {
    await StorageService.delete(VERIFY_KEY);
  },

  async setIp(ip: string) {
    await StorageService.set(IP_KEY, ip);
  },
  async getIp(): Promise<string | undefined> {
    return await StorageService.get(IP_KEY);
  },
  async removeIp() {
    await StorageService.delete(IP_KEY);
  },

  async setUserData(data: any) {
    await StorageService.set(USER_DATA_KEY, data);
  },
  async getUserData(): Promise<any> {
    return await StorageService.get(USER_DATA_KEY);
  },
  async removeUserData() {
    await StorageService.delete(USER_DATA_KEY);
  },

  async clearAll() {
    await StorageService.clear();
  }
};