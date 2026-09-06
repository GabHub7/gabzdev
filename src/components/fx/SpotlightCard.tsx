import { useRef, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Wrapper kartu dengan glow radial yang ngikutin posisi cursor pas hover.
 * Cuma nambah 1 layer <div> overlay di atas children, nggak ganggu style
 * kartu aslinya sama sekali — tinggal bungkus.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(79,127,224,0.35)',
  style,
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(280px circle at ${pos.x}% ${pos.y}%, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}
