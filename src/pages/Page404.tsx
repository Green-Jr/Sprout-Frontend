import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent text-green-500 pixel-font">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">¡Página no encontrada!</h2>
      <p className="mb-8 text-green-300">La ruta que intentaste visitar no existe en Sprout App.</p>
      <Link
        to="/"
        className="bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-600 hover:text-white transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}