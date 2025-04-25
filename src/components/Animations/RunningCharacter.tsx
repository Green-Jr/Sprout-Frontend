import { useRef, useEffect } from "react";
import sprite1 from "../../components/Game/assets/characters/Frog/Run (32x32).png";
import sprite2 from "../../components/Game/assets/characters/Mask/Run (32x32).png";
import sprite3 from "../../components/Game/assets/characters/Pinkman/Run (32x32).png";
import sprite4 from "../../components/Game/assets/characters/VirtualGuy/Run (32x32).png";

export default function RunningCharacter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameWidth = 32;
  const frameHeight = 32;
  const totalFrames = 12;
  const speed = 3;
  const frameDelay = 10;

  const frameIndex = useRef(0);
  const xPosition = useRef(-frameWidth);
  const frameCounter = useRef(0);
  const running = useRef(false);
  const selectedSprite = useRef(new Image());
  const animationFrameId = useRef<number | null>(null);

  const sprites = [sprite1, sprite2, sprite3, sprite4];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const loadRandomSprite = () => {
      const img = new Image();
      img.src = sprites[Math.floor(Math.random() * sprites.length)];
      selectedSprite.current = img;
    };

    const update = () => {
      if (!running.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        selectedSprite.current,
        frameIndex.current * frameWidth,
        0,
        frameWidth,
        frameHeight,
        xPosition.current,
        canvas.height - frameHeight * 2,
        frameWidth * 2,
        frameHeight * 2
      );

      frameCounter.current += 1;
      if (frameCounter.current >= frameDelay) {
        frameIndex.current = (frameIndex.current + 1) % totalFrames;
        frameCounter.current = 0;
      }

      xPosition.current += speed;

      if (xPosition.current > canvas.width) {
        running.current = false;
        xPosition.current = -frameWidth;

        // Detener la animación antes de programar la siguiente
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }

        // Esperar 60 segundos antes de intentar otra ejecución con 50% de probabilidad
        setTimeout(() => {
          if (Math.random() < 0.5) {
            startAnimation();
          } else {
            setTimeout(startAnimation, 60000); // Reintentar en 60 segundos
          }
        }, 60000);
      } else {
        animationFrameId.current = requestAnimationFrame(update);
      }
    };

    const startAnimation = () => {
      if (running.current) return; // Evita que inicie si ya está en ejecución
      running.current = true;
      loadRandomSprite();
      selectedSprite.current.onload = () => {
        update();
      };
    };

    // Primera ejecución retrasada 60 segundos
    setTimeout(() => {
      if (Math.random() < 0.5) {
        startAnimation();
      } else {
        setTimeout(startAnimation, 60000); // Reintentar en 60 segundos si no ocurrió
      }
    }, 60000);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={80}
      className="fixed bottom-0 left-0 w-full h-20 z-[9999] pointer-events-none"
    />
  );
}
