import { useEffect, useRef } from "react";
import { useSprings, animated } from "@react-spring/web";

const N = 20;

export default function GlassColumns() {
  const mouseXRef = useRef(-9999);

  const [springs, api] = useSprings(N, () => ({
    scaleX: 1,
    config: { tension: 180, friction: 22 },
  }));

  useEffect(() => {
    const onMove = (e) => {
      mouseXRef.current = e.clientX;
    };

    // Pre-compute column centre positions; update on resize
    let centres = Array.from({ length: N }, (_, i) => (i + 0.5) * (window.innerWidth / N));
    const onResize = () => {
      centres = Array.from({ length: N }, (_, i) => (i + 0.5) * (window.innerWidth / N));
    };

    let raf;
    const tick = () => {
      const mx = mouseXRef.current;
      api.start((i) => ({
        scaleX: Math.abs(mx - centres[i]) < 150 ? 1.06 : 1,
      }));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [api]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      {springs.map((style, i) => (
        <animated.div
          key={i}
          style={{
            ...style,
            position: "absolute",
            top: 0,
            left: `${i * 5}vw`,
            width: "5vw",
            height: "100vh",
            overflow: "hidden",
            transformOrigin: "center center",
            backdropFilter: "blur(12px) saturate(200%) brightness(1.05) contrast(1.05)",
            WebkitBackdropFilter: "blur(12px) saturate(200%) brightness(1.05) contrast(1.05)",
            background:
              "linear-gradient(to right, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.04) 40%, rgba(0,0,0,0.04) 100%)",
            borderLeft: "1px solid rgba(255,255,255,0.45)",
            borderRight: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Ambient shimmer sweep — staggered per column */}
          <div
            className="col-shimmer"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        </animated.div>
      ))}
    </div>
  );
}
