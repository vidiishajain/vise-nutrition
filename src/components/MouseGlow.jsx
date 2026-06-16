import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const divRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    let raf;
    const tick = () => {
      const { x, y } = mouseRef.current;
      if (divRef.current) {
        divRef.current.style.background =
          `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,150,80,0.50) 0%, rgba(255,120,60,0.20) 40%, transparent 70%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}
