export default function RechargePopup({
    message = "💸 Sin saldo, recarga tu dinero ahora",
    onClick,
    className = "",
  }: {
    message?: string;
    onClick?: () => void;
    className?: string;
  }) {
    return (
      <div
        className={`
          absolute z-20
          bg-green-500 text-white px-4 py-2
          rounded-xl shadow-lg font-bold text-base
          cursor-pointer pulse-pop border-4 border-white
          select-none
          transition-transform
          ${className}
        `}
        style={{ animation: "pulse-pop 1s infinite", minWidth: 180, maxWidth: 220 }}
        onClick={onClick}
      >
        {message}
      </div>
    );
  }