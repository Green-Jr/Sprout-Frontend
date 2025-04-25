import { Link } from "react-router-dom";
import { useState, useEffect } from "react"; // Importa useEffect
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import jumpSprite from "../components/Game/assets/characters/Frog/Jump (32x32).png";
import jumpSprite2 from "../components/Game/assets/characters/Pinkman/Jump Inverted (32x32).png";

const SECTIONS = [
    {
        id: "bienvenido",
        title: "Bienvenido a Sprout App",
        content: (
            <>
                <p className="text-lg mb-8 text-center text-green-200">
                    La plataforma donde tus ahorros crecen y tus inversiones florecen.
                    <br />
                    Descubre cómo puedes ahorrar, invertir y redimir tus SproutCoins de
                    manera fácil y segura.
                </p>
            </>
        ),
    },
    {
        id: "como-funciona",
        title: "¿Cómo funciona?",
        content: (
            <ul className="list-disc ml-6 text-green-300 text-left">
                <li>Regístrate y crea tu cuenta.</li>
                <li>Recarga saldo y compra productos o invierte en criptoactivos.</li>
                <li>Gana SproutCoins por tus ahorros e inversiones.</li>
                <li>Redime tus SproutCoins por recompensas maravillosas.</li>
            </ul>
        ),
    },
    {
        id: "beneficios",
        title: "Beneficios de Sprout",
        content: (
            <ul className="list-disc ml-6 text-green-300 text-left">
                <li>Plataforma segura y fácil de usar.</li>
                <li>Inversiones y compras en un solo lugar.</li>
                <li>Recompensas divertidas con SproutCoins.</li>
            </ul>
        ),
    },
    {
        id: "faq",
        title: "Preguntas frecuentes",
        content: (
            <ul className="list-disc ml-6 text-green-300 text-left">
                <li>
                    <b>¿Necesito experiencia previa?</b> <br/> No, nuestra app es para todos.
                </li>
                <li>
                    <b>¿Cómo obtengo SproutCoins?</b> <br/> Ahorrando, invirtiendo, jugando y usando la
                    plataforma.
                </li>
                <li>
                    <b>¿Puedo retirar mi dinero?</b> <br/> Sí, puedes redimir tus inversiones y
                    SproutCoins en cualquier momento.
                </li>
            </ul>
        ),
    },
];

function FrogAnimation() {
    const controls = useAnimation();
    const jumpHeight = 100; // Altura del salto
    const jumpDistance = 80; // Distancia horizontal del salto
    const jumpDurationUp = 2; // Duración más rápida para subir
    const jumpDurationDown = 2.8; // Duración más lenta para bajar

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                // Salto hacia arriba-derecha (rápido)
                await controls.start({
                    x: jumpDistance,
                    y: -jumpHeight,
                    transition: {
                        duration: jumpDurationUp,
                        ease: [0.2, 0.65, 0.3, 0.9] // Aceleración rápida al inicio
                    }
                });
                
                // Caída hacia abajo-izquierda (lenta)
                await controls.start({
                    x: -jumpDistance,
                    y: 0,
                    transition: {
                        duration: jumpDurationDown,
                        ease: [0.4, 0.1, 0.2, 0.9] // Desaceleración suave al final
                    }
                });
                
                // Pequeña pausa antes del siguiente salto
                await controls.start({
                    x: -jumpDistance,
                    y: 0,
                    transition: { duration: 0.3 }
                });
            }
        };

        sequence();

        return () => controls.stop(); // Limpieza al desmontar
    }, [controls]);

    return (
        <motion.img
            src={jumpSprite}
            alt="Animated Frog"
            style={{
                position: "absolute",
                left: "4rem",
                top: "25%",
                width: "256px",
                height: "256px",
                zIndex: 10,
                pointerEvents: "none",
                imageRendering: 'pixelated',
            }}
            initial={{ x: -jumpDistance, y: 0 }}
            animate={controls}
            // Eliminamos la referencia a direction o podemos reemplazarla con:
            whileTap={{ rotate: [0, 10, -10, 0] }} // Pequeña animación de rotación al hacer tap
        />
    );
}

function PinkmanAnimation() {
    const controls = useAnimation();
    const jumpHeight = 100; // Misma altura que Frog
    const jumpDistance = 80; // Misma distancia que Frog
    const jumpDurationUp = 2; // Misma duración que Frog
    const jumpDurationDown = 2.8; // Misma duración que Frog

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                // Salto hacia arriba-izquierda (rápido) - dirección opuesta a Frog
                await controls.start({
                    x: -jumpDistance, // Negativo para ir a la izquierda
                    y: -jumpHeight,
                    transition: {
                        duration: jumpDurationUp,
                        ease: [0.2, 0.65, 0.3, 0.9]
                    }
                });
                
                // Caída hacia abajo-derecha (lenta) - dirección opuesta a Frog
                await controls.start({
                    x: jumpDistance, // Positivo para ir a la derecha
                    y: 0,
                    transition: {
                        duration: jumpDurationDown,
                        ease: [0.4, 0.1, 0.2, 0.9]
                    }
                });
                
                // Pequeña pausa antes del siguiente salto
                await controls.start({
                    x: jumpDistance,
                    y: 0,
                    transition: { duration: 0.3 }
                });
            }
        };

        sequence();

        return () => controls.stop();
    }, [controls]);

    return (
        <motion.img
            src={jumpSprite2} // Usamos el sprite de Pinkman
            alt="Animated Pinkman"
            style={{
                position: "absolute",
                right: "4rem", // Posicionado a la derecha en lugar de izquierda
                top: "25%",
                width: "256px",
                height: "256px",
                zIndex: 10,
                pointerEvents: "none",
                imageRendering: 'pixelated'
            }}
            initial={{ x: jumpDistance, y: 0 }} // Inicialmente en posición opuesta
            animate={controls}
            whileTap={{ rotate: [0, -10, 10, 0] }} // Rotación inversa
        />
    );
}

export default function Dashboard() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1: left, 1: right

    // Navegación por flechas
    const goTo = (idx: number) => {
        if (idx === activeIndex) return;
        setDirection(idx > activeIndex ? 1 : -1);
        setActiveIndex(idx);
    };

    const goLeft = () => {
        if (activeIndex > 0) goTo(activeIndex - 1);
    };
    const goRight = () => {
        if (activeIndex < SECTIONS.length - 1) goTo(activeIndex + 1);
    };

    // Animaciones con Framer Motion
    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 100 : -100,
            opacity: 0,
            position: "absolute" as const,
        }),
        center: {
            x: 0,
            opacity: 1,
            position: "relative" as const,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -100 : 100,
            opacity: 0,
            position: "absolute" as const,
        }),
    };

    return (
        <div className="min-h-screen bg-transparent text-green-500 flex flex-col items-center pixel-font">
            {/* NavBar sticky */}
            <nav className="w-full flex justify-between items-center px-8 py-4 pb-8 border-b-4 border-green-500 bg-transparent sticky top-0 z-20 space-x-2">
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-2xl">Sprout App</span>
                    {SECTIONS.map((section, idx) => (
                        <button
                            key={section.id}
                            onClick={() => goTo(idx)}
                            className={`hover:text-green-300 transition px-2 py-1 rounded ${activeIndex === idx
                                    ? "bg-green-500 text-black font-bold"
                                    : ""
                                }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <Link
                        to="/login"
                        className="border-2 border-green-500 text-green-400 px-4 py-2 rounded-lg font-bold hover:bg-green-900 hover:text-white transition"
                    >
                        Iniciar
                    </Link>
                    <Link
                        to="/register"
                        className="border-2 border-green-500 text-green-400 px-4 py-2 rounded-lg font-bold hover:bg-green-900 hover:text-white transition"
                    >
                        Registrarse
                    </Link>
                </div>
            </nav>

            {/* Contenido principal con slider animado */}
            <main className="w-full max-w-3xl mx-auto flex flex-col items-center py-12 px-4 flex-1 relative min-h-[400px] mt-6">
                {/* Flecha izquierda */}
                <button
                    className={`absolute -left-14 md:-left-20 top-1/2 -translate-y-1/2 z-10 bg-green-500/80 hover:bg-green-600 text-black p-3 rounded-full shadow-lg transition ${activeIndex === 0 ? "opacity-30 pointer-events-none" : ""
                        }`}
                    onClick={goLeft}
                    aria-label="Anterior"
                >
                    <FaChevronLeft size={24} />
                </button>

                {/* Flecha derecha */}
                <button
                    className={`absolute -right-14 md:-right-20 top-1/2 -translate-y-1/2 z-10 bg-green-500/80 hover:bg-green-600 text-black p-3 rounded-full shadow-lg transition ${activeIndex === SECTIONS.length - 1
                            ? "opacity-30 pointer-events-none"
                            : ""
                        }`}
                    onClick={goRight}
                    aria-label="Siguiente"
                >
                    <FaChevronRight size={24} />
                </button>
                {/* Slider animado */}
                <div className="w-full flex-1 flex items-center justify-center relative min-h-[300px]">
                    <AnimatePresence custom={direction} mode="wait">
                        <motion.section
                            key={SECTIONS[activeIndex].id}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="w-full bg-transparent border-4 border-green-500 rounded-2xl shadow-xl px-6 py-10 md:px-12 md:py-14 flex flex-col items-center"
                            style={{ minHeight: 260 }}
                        >
                            <h1 className="text-4xl font-bold mb-6 text-center">
                                {SECTIONS[activeIndex].title}
                            </h1>
                            <div className="mb-8 text-center">
                                {SECTIONS[activeIndex].content}
                            </div>
                        </motion.section>
                    </AnimatePresence>
                </div>
                {/* Dots de progreso */}
                <div className="flex justify-center items-center gap-3 mt-8">
                    {SECTIONS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goTo(idx)}
                            className={`w-3 h-3 rounded-full border-2 border-green-500 transition-all duration-200 ${activeIndex === idx
                                    ? "bg-green-500 scale-125 shadow-lg"
                                    : "bg-transparent hover:bg-green-500/40"
                                }`}
                            aria-label={`Ir a la sección ${SECTIONS[idx].title}`}
                        />
                    ))}
                </div>
            </main>

            {/* Incluye el componente FrogAnimation aquí */}
            {/* <PinkmanAnimation /> */}
{/* <FrogAnimation /> */}
        </div>
    );
}