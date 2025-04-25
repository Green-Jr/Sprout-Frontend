import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AxiosRepository } from "../config/AxiosRepository";

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: any;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
  refresh: () => {},
});

function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const token = await AxiosRepository.getToken();
      const verify = await AxiosRepository.getVerify();
      const ip = await AxiosRepository.getIp();
  
      if (!token || !verify || !ip) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
  
      const exp = getTokenExpiration(token);
      if (!exp || Date.now() > exp) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
  
      let user = null;
      try {
        user = JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        console.error("Error decoding token", e);
      }
      setIsAuthenticated(true);
      setUser(user);
  
    } catch (e) {
      setIsAuthenticated(false);
      setUser(null);
      console.error("Error in checkSession", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line
  }, []);

  const logout = async () => {
    await AxiosRepository.clearAll();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout, refresh: checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}