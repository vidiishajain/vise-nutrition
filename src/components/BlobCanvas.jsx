import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";

// Pre-parsed rgba values for each blob colour
const BLOBS = [
  { r: 255, g: 191, b: 160, offX: 0.00, offY: 0.00, radius: 420 }, // #FFBFA0
  { r: 255, g: 212, b: 184, offX: 3.14, offY: 1.73, radius: 380 }, // #FFD4B8
  { r: 255, g: 170, b: 144, offX: 1.57, offY: 5.23, radius: 460 }, // #FFAA90
  { r: 245, g: 197, b: 176, offX: 7.31, offY: 2.41, radius: 350 }, // #F5C5B0
  { r: 255, g: 184, b: 192, offX: 4.81, offY: 8.14, radius: 400 }, // #FFB8C0
  { r: 250, g: 208, b: 192, offX: 9.24, offY: 4.62, radius: 310 }, // #FAD0C0
];

export default function BlobCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const noise2D = createNoise2D();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf;
    const draw = (time) => {
      const { width, height } = canvas;
      const t = time * 0.0003;

      // Base fill
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#FDE8E0";
      ctx.fillRect(0, 0, width, height);

      // Multiply blobs over the base — overlaps deepen warmly
      ctx.globalCompositeOperation = "multiply";

      for (const b of BLOBS) {
        // Independent noise paths per blob
        const nx = noise2D(t + b.offX, b.offY * 0.5);
        const ny = noise2D(b.offX * 0.5, t + b.offY);

        // Map [-1,1] to viewport coords
        const x = (nx * 0.5 + 0.5) * width;
        const y = (ny * 0.5 + 0.5) * height;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.radius);
        grad.addColorStop(0,   `rgba(${b.r},${b.g},${b.b},0.88)`);
        grad.addColorStop(0.45,`rgba(${b.r},${b.g},${b.b},0.40)`);
        grad.addColorStop(1,   `rgba(${b.r},${b.g},${b.b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
