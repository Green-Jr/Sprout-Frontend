import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles: any[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      depth: number;
      trail: { x: number; y: number }[];

      constructor(x: number, y: number, size: number, speedX: number, speedY: number, depth: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.opacity = 0.3 + (depth * 0.7);
        this.depth = depth;
        this.trail = [];
      }

      update() {
        if (!canvas) return;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();

        this.x -= this.speedX * this.depth;
        this.y += this.speedY * this.depth;

        if (this.y > canvas.height || this.x < -50) {
          if (Math.random() > 0.5) {
            this.x = Math.random() * canvas.width;
            this.y = -20;
          } else {
            this.x = canvas.width + 20;
            this.y = Math.random() * canvas.height;
          }
        }
      }

      draw() {
        if (!ctx) return;

        // **Dibujar la estela**
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const alpha = (i + 1) / this.trail.length;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * this.opacity})`;
          ctx.beginPath();
          ctx.arc(this.trail[i].x, this.trail[i].y, this.size * (i / this.trail.length), 0, Math.PI * 2);
          ctx.fill();
        }

        // **Dibujar el meteorito**
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // **Generar meteoritos pequeños**
    for (let i = 0; i < 30; i++) {
      const depth = Math.random() * 0.7 + 0.3;
      const startX = Math.random() > 0.5 ? Math.random() * canvas.width : canvas.width + 20;
      const startY = Math.random() > 0.5 ? -20 : Math.random() * canvas.height;
      particles.push(
        new Particle(
          startX,
          startY,
          (Math.random() * 3 + 1) * depth,
          (Math.random() * 2 + 1) * depth,
          (Math.random() * 1.5 + 0.5) * depth,
          depth
        )
      );
    }

    // **Animación**
    function animate() {
      if (!canvas || !ctx) return;

      ctx.fillStyle = "rgba(5, 5, 20, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none" />;
}
