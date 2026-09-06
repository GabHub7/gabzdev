import { type ReactNode, type ElementType } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * Wrapper "Fade Up" / "Reveal Up" — elemen mulai transparan + geser 24px ke
 * bawah, terus fade-in + geser balik ke posisi asli begitu kena viewport
 * (sekali doang, nggak ngulang tiap scroll naik-turun).
 *
 * Dipakai buat animasi masuk yang konsisten di SEMUA section (Hero, About,
 * Packages, Portfolio, Contact) — tinggal bungkus elemen/section apapun,
 * bisa dikasih `delay` (ms) buat efek berantai (stagger) kalau beberapa
 * FadeUp ada di section yang sama.
 *
 * Pakai IntersectionObserver dari useScrollReveal yang udah ada (bukan
 * bikin observer baru), biar behavior-nya konsisten di seluruh situs.
 */
export default function FadeUp({
  children,
  delay = 0,
  duration = 700,
  distance = 24,
  threshold = 0.15,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  as?: ElementType;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal(threshold);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
