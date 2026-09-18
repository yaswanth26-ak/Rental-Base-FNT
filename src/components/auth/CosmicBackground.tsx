import { useMemo } from 'react';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function CosmicBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i + 1) * 100}%`,
        top: `${seededRandom(i + 17) * 100}%`,
        size: 1 + seededRandom(i + 33) * 2,
        delay: `${seededRandom(i + 51) * 3}s`,
        duration: `${2.5 + seededRandom(i + 71) * 2.5}s`,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,0,0.12),_transparent_45%),radial-gradient(ellipse_at_bottom,_rgba(20,20,40,0.9),_#050505)]" />

      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow:
              star.size > 2
                ? '0 0 6px rgba(255,180,100,0.8)'
                : '0 0 3px rgba(255,255,255,0.6)',
          }}
        />
      ))}

      <span className="absolute left-[-10%] top-[18%] h-px w-24 rotate-12 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-70 animate-shoot-star" />
      <span
        className="absolute left-[-10%] top-[42%] h-px w-16 rotate-[18deg] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shoot-star"
        style={{ animationDelay: '2s', animationDuration: '5.5s' }}
      />

      <div className="absolute -right-16 bottom-16 h-56 w-56 animate-float rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ff9a4d,_#ff6b00_35%,_#3a1a00_70%,_transparent_72%)] opacity-40 blur-[1px]" />
      <div className="absolute -left-10 top-24 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_35%_35%,_#6b7cff,_#1a1f4d_55%,_transparent_70%)] opacity-30 blur-sm" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}
