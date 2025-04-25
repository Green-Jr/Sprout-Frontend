
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSeedling, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { AxiosRepository } from "../config/AxiosRepository";

interface HeaderAuthProps {
  text: string;
  link: string;
  icon: any;
}

export default function HeaderAuth({ text, link, icon }: HeaderAuthProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AxiosRepository.removeToken();
    await AxiosRepository.removeVerify();
    await AxiosRepository.removeUserData();
    // Limpia también el progreso y estado de misiones
    localStorage.removeItem("mission_progress");
    localStorage.removeItem("missions_claimed");
    localStorage.removeItem("active_missions");
    localStorage.removeItem("missions_last_rotate");
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full py-4 bg-transparent border-b-2 border-green-500 z-10 backdrop-blur-sm">
        <div className="flex justify-between items-center px-6">
          {/* Logo e icono */}
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl text-green-500 pixel-font">Sprout-Found</h1>
            <FontAwesomeIcon icon={faSeedling} className="text-green-500 text-3xl" />
          </div>

          {/* Botón dinámico, Ícono de Usuario y Logout */}
          <div className="flex items-center space-x-6">
            <Link to={link} className="border-2 border-green-500 px-4 py-2 flex items-center space-x-2 hover:bg-green-500 hover:text-black rounded-lg transition-all">
              <FontAwesomeIcon icon={icon} />
              <span className="pixel-font">{text}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="ml-2 border-2 border-green-500 px-4 py-2 flex items-center space-x-2 hover:bg-green-500 hover:text-black rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span className="pixel-font">Logout</span>
            </button>
            <button onClick={() => setIsSidebarOpen(true)}>
              <FontAwesomeIcon icon={faUser} className="text-3xl text-green-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
