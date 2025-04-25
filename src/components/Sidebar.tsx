
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUser, faGift } from "@fortawesome/free-solid-svg-icons";
import SproutRun from "../components/Game/SproutRun";
import { AxiosRepository } from "../config/AxiosRepository";
import { rechargeSproutsCoins } from "../services/Accounts/AccountApiService";
import toast from "react-hot-toast";
import { MissionProgressService } from "../utils/MissionProgressService";

// --- Configuración de misiones con progreso persistente ---
const ALL_MISSIONS = [
    {
        id: "five-transactions",
        title: "Realiza 5 compras",
        goal: 5,
        reward: 8,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["five-transactions"] || 0) / 5, 1),
    },
    {
        id: "redeem-sproutcoins",
        title: "Canjea Sprout-Coins 2 veces",
        goal: 2,
        reward: 6,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["redeem-sproutcoins"] || 0) / 2, 1),
    },
    {
        id: "make-deposit",
        title: "Haz 2 depósitos",
        goal: 2,
        reward: 6,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["make-deposit"] || 0) / 2, 1),
    },
    {
        id: "play-game",
        title: "Juega 3 partidas",
        goal: 3,
        reward: 5,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["play-game"] || 0) / 3, 1),
    },
    {
        id: "first-redeem",
        title: "Haz un retiro de inversión",
        goal: 1,
        reward: 6,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["first-redeem"] || 0) / 1  ,1 ),
    },
    {
        id: "two-deposits",
        title: "Recarga saldo 2 veces",
        goal: 2,
        reward: 7,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["two-deposits"] || 0) / 2, 1),
    },
    {
        id: "buy-products",
        title: "Realiza 2 compras",
        goal: 2,
        reward: 8,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["buy-products"] || 0) / 2, 1),
    },
    {
        id: "play-5-games",
        title: "Juega 5 partidas",
        goal: 5,
        reward: 10,
        getProgress: (_user: any, progress: Record<string, number>) =>
            Math.min((progress["play-5-games"] || 0) / 5, 1),
    },
];

// --- Configuración de rotación de misiones ---
const MISSIONS_KEY = "active_missions";
const MISSION_ROTATE_KEY = "missions_last_rotate";
const MISSION_CLAIMED_KEY = "missions_claimed";
const MISSION_ROTATE_INTERVAL = 1000 * 60 * 3; // 3 minutos

function getRandomMissions(claimedIds: string[], count = 3) {
    const available = ALL_MISSIONS.filter(m => !claimedIds.includes(m.id));
    if (available.length <= count) return available;
    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    // --- Estado de usuario real ---
    const [user, setUser] = useState<any>(null);

    // --- Estado de misiones ---
    const [missions, setMissions] = useState<typeof ALL_MISSIONS>([]);
    const [claimed, setClaimed] = useState<string[]>([]);
    const [lastRotate, setLastRotate] = useState<number>(0);
    const [missionProgress, setMissionProgress] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(MISSION_ROTATE_INTERVAL);

    const hasRotatedRef = useRef(false);

    // --- Juego y monedas ---
    const [showGame, setShowGame] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const lastCoinsRef = useRef(0);
    const gameEndedRef = useRef(false);

    // --- Cargar usuario real y progreso de misiones ---
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await AxiosRepository.getUserData();
            setUser(userData);
            const claimedMissions = JSON.parse(localStorage.getItem(MISSION_CLAIMED_KEY) || "[]");
            setClaimed(claimedMissions);
            setMissionProgress(MissionProgressService.getAll());
        };
        fetchUser();
    }, []);

    // --- Función para rotar misiones (centralizada) ---
    const rotateMissions = useCallback(() => {
        // Limpiar progreso y reclamadas al rotar
        localStorage.removeItem("mission_progress");
        localStorage.removeItem("missions_claimed");
        // Rotar misiones
        const newMissions = getRandomMissions([], 3);
        setMissions(newMissions);
        setClaimed([]);
        setMissionProgress({});
        const now = Date.now();
        setLastRotate(now);
        setTimeLeft(MISSION_ROTATE_INTERVAL); // Reinicia el contador
        localStorage.setItem(MISSIONS_KEY, JSON.stringify(newMissions.map(m => m.id)));
        localStorage.setItem(MISSION_ROTATE_KEY, String(now));
        toast.success("¡Tienes nuevas misiones esperándote! 🚀");
    }, []);

    // --- Rotación de misiones al montar o si el tiempo ya expiró ---
    useEffect(() => {
        const now = Date.now();
        const savedMissions = localStorage.getItem(MISSIONS_KEY);
        const savedRotate = Number(localStorage.getItem(MISSION_ROTATE_KEY) || 0);

        if (!savedMissions || now - savedRotate > MISSION_ROTATE_INTERVAL) {
            rotateMissions();
        } else {
            // Cargar misiones guardadas
            const ids: string[] = JSON.parse(savedMissions);
            setMissions(ALL_MISSIONS.filter(m => ids.includes(m.id)));
            setLastRotate(savedRotate);
            setTimeLeft(MISSION_ROTATE_INTERVAL - (now - savedRotate));
        }
        setMissionProgress(MissionProgressService.getAll());
        // eslint-disable-next-line
    }, [user, rotateMissions]);

    // --- Refrescar progreso y reclamadas automáticamente ---
    useEffect(() => {
        const interval = setInterval(() => {
            setMissionProgress(MissionProgressService.getAll());
            const claimedMissions = JSON.parse(localStorage.getItem(MISSION_CLAIMED_KEY) || "[]");
            setClaimed(claimedMissions);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- Mostrar tiempo restante para nuevas misiones ---
    useEffect(() => {
        if (!lastRotate) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1000) return 0;
                return prev - 1000;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [lastRotate]);

    // --- Rotar misiones automáticamente cuando el tiempo llega a cero (solo una vez por ciclo) ---
    useEffect(() => {
        if (timeLeft === 0 && lastRotate !== 0 && !hasRotatedRef.current) {
            hasRotatedRef.current = true;
            rotateMissions();
        }
        if (timeLeft > 0 && hasRotatedRef.current) {
            hasRotatedRef.current = false;
        }
    }, [timeLeft, lastRotate, rotateMissions]);

    // --- Reclamar misión ---
    const handleClaim = async (mission: typeof ALL_MISSIONS[number]) => {
        try {
            await rechargeSproutsCoins({ AMOUNT: String(mission.reward) });
            toast.success(`¡Reclamaste ${mission.reward} Sprout-Coins!`);
            const newClaimed = [...claimed, mission.id];
            setClaimed(newClaimed);
            localStorage.setItem(MISSION_CLAIMED_KEY, JSON.stringify(newClaimed));
            MissionProgressService.reset(mission.id); // Limpia el progreso al reclamar
            setMissionProgress(MissionProgressService.getAll());
        } catch {
            toast.error("No se pudo reclamar la recompensa. Intenta de nuevo.");
        }
    };

    // --- Juego ---
    const handleGameEnd = async (coinsCollected: number, completed: boolean) => {
        if (gameEndedRef.current) return; // Evita doble ejecución
        gameEndedRef.current = true;
    
        lastCoinsRef.current = coinsCollected;
    
        // Solo mostrar el modal y recargar monedas si el juego terminó normalmente
        if (completed && coinsCollected > 0) {
            setShowModal(true);
            try {
                await rechargeSproutsCoins({ AMOUNT: String(coinsCollected) });
                toast.success(`¡Recibiste ${coinsCollected} Sprout-Coins por el juego!`);
            } catch {
                toast.error("No se pudo recargar tus Sprout-Coins del juego.");
            }
        }
    
        setTimeout(() => {
            setShowModal(false);
            setShowGame(false);
            gameEndedRef.current = false; // Permite jugar de nuevo
        }, 3000);
    
        if (completed) {
            if (MissionProgressService.isMissionActive("play-game")) {
                MissionProgressService.increment("play-game");
            }
            if (MissionProgressService.isMissionActive("play-5-games")) {
                MissionProgressService.increment("play-5-games");
            }
            setMissionProgress(MissionProgressService.getAll());
        }
    };

    // Cuando el usuario cierra el modal antes de tiempo:
    const handleCloseGame = () => {
        handleGameEnd(lastCoinsRef.current, false);
        setShowGame(false);
    };

    function formatTime(ms: number) {
        const h = Math.floor(ms / (1000 * 60 * 60));
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((ms % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s`;
    }

    return (
        <>
            {/* Fondo oscuro que cierra el Sidebar al hacer clic */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose}></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-1/2 md:w-1/3 bg-black border-l-4 border-green-500 z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Botón de Cerrar */}
                <button
                    className="absolute top-3 right-3 text-green-500 text-2xl hover:text-red-500 transition"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Contenido del Sidebar */}
                <div className="h-full flex flex-col text-green-500 p-6 pixel-font">
                    {/* Sección Usuario */}
                    <div className="border-b border-green-500 pb-4 mb-4">
                        <h2 className="text-2xl mb-4 flex justify-center items-center">
                            <FontAwesomeIcon icon={faUser} className="text-2xl mr-2" />
                            Tu Perfil
                        </h2>
                        <p className="text-lg">Nombre: <span className="text-green-400">{user?.NAME || "..."}</span></p>
                        <p className="text-lg">Correo: <span className="text-green-400">{user?.EMAIL || "..."}</span></p>
                    </div>

                    {/* Sección Misiones */}
                    <div className="border-b border-green-500 pb-4 mb-4 flex-shrink-0">
                        <div className="sticky top-0 bg-black z-10 pb-2">
                            <h2 className="text-2xl text-center">🔥 Tus Misiones</h2>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                            {missions.map((mission) => {
                                const progress = mission.getProgress(user, missionProgress);
                                const isClaimed = claimed.includes(mission.id);
                                const isComplete = progress >= 1;
                                return (
                                    <div key={mission.id} className="mb-5">
                                        <div className="flex items-center mb-1">
                                            <p className={`text-lg flex-1 ${isClaimed ? "line-through text-green-700" : ""}`}>
                                                {mission.title}
                                            </p>
                                            <span className="ml-2 text-green-400 font-bold">+{mission.reward} <FontAwesomeIcon icon={faGift} /></span>
                                        </div>
                                        {/* Barra de progreso */}
                                        <div className="relative h-4 bg-green-900/30 rounded-lg overflow-hidden mb-1">
                                            <div
                                                className={`h-4 rounded-lg transition-all duration-300 ${isClaimed ? "bg-green-700" : isComplete ? "bg-green-500" : "bg-green-400"}`}
                                                style={{ width: `${Math.round(progress * 100)}%` }}
                                            />
                                            {/* Botón de reclamar */}
                                            {isComplete && !isClaimed && (
                                                <button
                                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-black px-3 py-1 rounded-lg font-bold text-xs shadow-lg hover:bg-green-600 hover:text-white transition-all z-10"
                                                    onClick={() => handleClaim(mission)}
                                                >
                                                    Reclamar
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-xs text-green-400 text-right">
                                            {Math.round(progress * mission.goal)}/{mission.goal}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="text-green-400 text-xs mt-2 text-center">
                                Nuevas misiones en: <span className="font-bold">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sección Misteriosa */}
                    <div className="flex flex-col items-center justify-center text-center mt-auto">
                        <p className="text-xl">
                            Hay unos hombrecitos extraños que corren por ahí, <br />
                            ¿los has visto?
                        </p>
                        <button
                            className="mt-4 px-6 py-3 border-2 border-green-500 text-green-500 rounded-lg text-lg hover:bg-green-500 hover:text-black transition-all 
                        animate-[pulse_1s_infinite] transform hover:scale-110 
                        before:content-[''] before:absolute before:inset-0 before:bg-green-500 before:opacity-10 before:rounded-lg 
                        before:animate-[flash_1.5s_infinite] relative"
                            onClick={() => setShowGame(true)}
                        >
                            ¡Jugar!
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal del juego */}
            {showGame && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                    <div className="relative border-4 border-green-500 bg-transparent p-4">
                        <button
                            className="absolute top-2 right-2 text-green-500 hover:text-red-500"
                            onClick={handleCloseGame}
                        >
                            ❌
                        </button>
                        <SproutRun onGameEnd={handleGameEnd} />
                    </div>
                </div>
            )}

            {/* Modal de Monedas Recolectadas */}
            {showModal && (
                <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-transaparent border-4 border-green-500 text-green-500 px-6 py-4 rounded-lg 
                    animate-fadeIn z-[60]">
                    <p className="text-lg">Fin</p>
                </div>
            )}
        </>
    );
}
