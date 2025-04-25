import React, { useEffect, useState } from "react";

interface LoadingDotsProps {
  text?: string;
  colorClass?: string; // Permite personalizar el color
  sizeClass?: string;  // Permite personalizar el tamaño
  className?: string;  // Permite agregar clases extra
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  text = "Cargando",
  colorClass = "text-green-400",
  sizeClass = "text-2xl",
  className = ""
}) => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4); // 0,1,2,3 (3 = sin puntos)
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className={`${colorClass} ${sizeClass} pixel-font`}>
        {text}
        <span>
          {Array(dotCount).fill(".").join("")}
        </span>
      </span>
    </div>
  );
};

export default LoadingDots;
