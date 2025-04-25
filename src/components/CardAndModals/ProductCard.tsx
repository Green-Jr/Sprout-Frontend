interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  className?: string;
  titleClassName?: string;
  onBuyClick?: () => void;
}

export default function ProductCard({
  image,
  name,
  price,
  className = "",
  titleClassName = "",
  onBuyClick,
}: ProductCardProps) {
  return (
    <div
      className={`
    box-border border-4 border-green-500 p-4 rounded-lg
    flex flex-col justify-between items-center bg-transparent
    transition-shadow hover:shadow-2xl cursor-pointer
    shadow-lg 
    ${className}
  `}
      style={{ minHeight: 320 }}
    >
      {/* Imagen centrada y proporcionada */}
      <div className="flex justify-center items-center w-full h-40 mb-1">
        <img
          src={image}
          alt={name}
          className="max-h-36 max-w-full object-contain rounded-lg"
          loading="lazy"
        />
      </div>
      {/* Nombre del producto */}
      <p
        className={`
      mt-1
      text-center
      font-semibold
      text-green-600
      text-base
      line-clamp-2
      flex
      items-center
      justify-center
      w-full
      ${titleClassName}
    `}
        title={name}
        style={{
          minHeight: "1.5em",
          maxHeight: "2.7em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {name}
      </p>
      {/* Precio y botón siempre abajo */}
      <div className="w-full mt-2 flex flex-col items-center">
        <p className="text-lg font-bold text-green-700">{price}</p>
        <button
          className="mt-2 border-2 border-green-600 px-3 py-1 text-green-600 hover:bg-green-600 hover:text-white transition-all rounded w-full"
          onClick={onBuyClick}
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
