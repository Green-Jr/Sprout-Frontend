
import { useRef, useEffect } from "react";
import sprite1 from "../../components/Game/assets/characters/Frog/Run (32x32).png";
import sprite2 from "../../components/Game/assets/characters/Mask/Run (32x32).png";
import sprite3 from "../../components/Game/assets/characters/Pinkman/Run (32x32).png";
import sprite4 from "../../components/Game/assets/characters/VirtualGuy/Run (32x32).png";

interface CharacterLoadingProps {
  text?: string;
  spriteIndex?: number;
}

export default function CharacterLoading({ text = "Redirigiendo...", spriteIndex }: CharacterLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameWidth = 32;
  const frameHeight = 32;
  const totalFrames = 12;
  const frameDelay = 8;
  const scale = 3;

  const frameIndex = useRef(0);
  const frameCounter = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const selectedSprite = useRef(new window.Image());

  const sprites = [sprite1, sprite2, sprite3, sprite4];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const img = new window.Image();
    img.src = typeof spriteIndex === "number"
      ? sprites[spriteIndex % sprites.length]
      : sprites[Math.floor(Math.random() * sprites.length)];
    selectedSprite.current = img;

    let running = true;

    img.onload = () => {
      const update = () => {
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = (canvas.width - frameWidth * scale) / 2;
        const y = (canvas.height - frameHeight * scale) / 2;

        ctx.drawImage(
          selectedSprite.current,
          frameIndex.current * frameWidth,
          0,
          frameWidth,
          frameHeight,
          x,
          y,
          frameWidth * scale,
          frameHeight * scale
        );

        frameCounter.current += 1;
        if (frameCounter.current >= frameDelay) {
          frameIndex.current = (frameIndex.current + 1) % totalFrames;
          frameCounter.current = 0;
        }

        animationFrameId.current = requestAnimationFrame(update);
      };
      update();
    };

    return () => {
      running = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line
  }, [spriteIndex]);

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[99999]">
      <canvas
        ref={canvasRef}
        width={frameWidth * 4}
        height={frameHeight * 4}
        className="mb-4"
        style={{ imageRendering: "pixelated" }}
      />
      <span className="text-green-300 text-xl pixel-font">{text}</span>
    </div>
  );
}
