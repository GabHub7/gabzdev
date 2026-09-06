/**
 * Ilustrasi isometrik "developer workflow" — dibuat sendiri sebagai SVG + animasi CSS,
 * bukan Lottie eksternal. Jadi ga butuh link/file apapun dari luar, langsung jalan.
 */
export default function DevWorkflowIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 380"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <style>{`
        @keyframes dwiFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes dwiFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes dwiPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes dwiTypeBlink {
          0%, 45% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes dwiOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .dwi-float { animation: dwiFloat 4.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .dwi-float-slow { animation: dwiFloatSlow 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .dwi-pulse { animation: dwiPulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .dwi-cursor { animation: dwiTypeBlink 1.1s steps(1) infinite; }
        .dwi-orbit { animation: dwiOrbit 14s linear infinite; transform-box: fill-box; transform-origin: 210px 190px; }
      `}</style>

      {/* Soft ground shadow */}
      <ellipse cx="210" cy="330" rx="150" ry="18" fill="#4F7FE0" opacity="0.08" />

      {/* Orbiting accent dot */}
      <g className="dwi-orbit">
        <circle cx="210" cy="60" r="5" fill="#4F7FE0" opacity="0.5" />
      </g>

      {/* Laptop base */}
      <g className="dwi-float">
        <rect x="105" y="215" width="210" height="14" rx="4" fill="#0F172A" />
        <rect x="118" y="90" width="184" height="128" rx="10" fill="#14213D" />
        <rect x="130" y="102" width="160" height="104" rx="4" fill="#F7F9FD" />

        {/* Browser chrome dots */}
        <circle cx="140" cy="110" r="2.5" fill="#EF4444" />
        <circle cx="149" cy="110" r="2.5" fill="#F59E0B" />
        <circle cx="158" cy="110" r="2.5" fill="#10B981" />

        {/* Code lines */}
        <rect x="140" y="122" width="70" height="5" rx="2.5" fill="#4F7FE0" opacity="0.75" />
        <rect x="140" y="133" width="95" height="5" rx="2.5" fill="#94A3B8" opacity="0.6" />
        <rect x="140" y="144" width="55" height="5" rx="2.5" fill="#4F7FE0" opacity="0.5" />
        <rect x="140" y="155" width="80" height="5" rx="2.5" fill="#94A3B8" opacity="0.6" />
        <rect x="140" y="166" width="40" height="5" rx="2.5" fill="#4F7FE0" opacity="0.75" />
        {/* blinking cursor */}
        <rect x="184" y="166" width="4" height="5" fill="#0F172A" className="dwi-cursor" />
      </g>

      {/* Floating code-window card (top-right) */}
      <g className="dwi-float-slow">
        <rect x="270" y="40" width="110" height="72" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
        <circle cx="286" cy="56" r="3" fill="#EF4444" />
        <circle cx="296" cy="56" r="3" fill="#F59E0B" />
        <circle cx="306" cy="56" r="3" fill="#10B981" />
        <rect x="284" y="68" width="60" height="4" rx="2" fill="#4F7FE0" opacity="0.7" />
        <rect x="284" y="78" width="80" height="4" rx="2" fill="#CBD5E1" />
        <rect x="284" y="88" width="45" height="4" rx="2" fill="#CBD5E1" />
        <rect x="284" y="98" width="65" height="4" rx="2" fill="#4F7FE0" opacity="0.5" />
      </g>

      {/* Magnifying glass (left) */}
      <g className="dwi-float">
        <circle cx="70" cy="150" r="26" fill="none" stroke="#4F7FE0" strokeWidth="6" opacity="0.85" />
        <line x1="89" y1="169" x2="106" y2="186" stroke="#4F7FE0" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* Gear / automation icon (bottom-right) */}
      <g className="dwi-float-slow" style={{ animationDelay: '0.6s' }}>
        <circle cx="330" cy="235" r="22" fill="#FFFFFF" stroke="#E2E8F0" />
        <path
          d="M330 222v-4m0 34v-4m13-13h4m-34 0h4m18.5-9.2l2.8-2.8m-25.6 25.6l2.8-2.8m0-20l-2.8-2.8m25.6 25.6l-2.8-2.8"
          stroke="#4F7FE0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="330" cy="235" r="7" fill="#4F7FE0" opacity="0.8" />
      </g>

      {/* Plant / growth accent */}
      <g className="dwi-float-slow" style={{ animationDelay: '1.2s' }}>
        <path d="M95 260 Q90 235 105 220" stroke="#4F7FE0" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M95 260 Q100 240 88 225" stroke="#4F7FE0" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
        <ellipse cx="105" cy="218" rx="8" ry="12" fill="#4F7FE0" opacity="0.3" transform="rotate(-20 105 218)" />
        <ellipse cx="88" cy="223" rx="7" ry="11" fill="#4F7FE0" opacity="0.25" transform="rotate(15 88 223)" />
      </g>

      {/* Status pulse dot (top-left, "online") */}
      <g transform="translate(150,55)">
        <circle r="5" fill="#10B981" className="dwi-pulse" />
      </g>
    </svg>
  );
}
