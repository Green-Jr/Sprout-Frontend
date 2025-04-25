import { useEffect } from "react";
import { AxiosRepository } from "./config/AxiosRepository";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AnimatedBackground from "./components/Animations/AnimatedBackground";
import RunningCharacter from "./components/Animations/RunningCharacter";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Portfolio from "./pages/Portafolio";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Page404";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

const getPublicIp = async (): Promise<string | undefined> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
};

function App() {
  useEffect(() => {
    getPublicIp().then(ip => {
      if (ip) AxiosRepository.setIp(ip);
    });
  }, []);

  return (
    <AuthProvider>
    <Router>
      {/* Fondo Animado */}
      <AnimatedBackground />
      {/* Personaje Animado */}
      <RunningCharacter />

      <>
        <Toaster position="top-center" />
      </>

      {/* Contenedor de la App con `relative z-10` para que todo esté encima */}
      <div className="relative z-10 w-full h-full">
        <Routes>
          {/* Página pública principal */}
          <Route path="/" element={<Dashboard />} />
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Rutas privadas */}
          <Route path="/home" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/portafolio" element={
            <PrivateRoute>
              <Portfolio />
            </PrivateRoute>
          } />
          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;