export default function MountainIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 500 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f7f8fa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="mtn3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect width="500" height="200" fill="url(#skyGrad)" />

      {/* Sun */}
      <circle cx="380" cy="55" r="28" fill="url(#sunGrad)" />
      <circle cx="380" cy="55" r="20" fill="#fbbf24" fillOpacity="0.25" />
      <circle cx="380" cy="55" r="12" fill="#fde68a" fillOpacity="0.35" />

      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 380 + Math.cos(rad) * 32;
        const y1 = 55 + Math.sin(rad) * 32;
        const x2 = 380 + Math.cos(rad) * 40;
        const y2 = 55 + Math.sin(rad) * 40;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
        );
      })}

      {/* Clouds */}
      <g opacity="0.15">
        <ellipse cx="120" cy="50" rx="30" ry="10" fill="#94a3b8" />
        <ellipse cx="135" cy="45" rx="20" ry="8" fill="#94a3b8" />
        <ellipse cx="105" cy="47" rx="18" ry="7" fill="#94a3b8" />
      </g>
      <g opacity="0.1">
        <ellipse cx="300" cy="35" rx="25" ry="8" fill="#94a3b8" />
        <ellipse cx="315" cy="30" rx="18" ry="7" fill="#94a3b8" />
      </g>

      {/* Birds */}
      <g stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.2">
        <path d="M180 40 L185 35 L190 40" />
        <path d="M200 45 L204 41 L208 45" />
        <path d="M340 30 L344 26 L348 30" />
        <path d="M355 35 L358 32 L361 35" />
      </g>

      {/* Back mountains (lighter) */}
      <path
        d="M0 200 L0 140 L50 100 L100 130 L150 80 L200 120 L250 70 L300 110 L350 60 L400 100 L450 80 L500 110 L500 200 Z"
        fill="url(#mtn3)"
      />

      {/* Middle mountains */}
      <path
        d="M0 200 L0 155 L60 120 L120 150 L170 105 L220 140 L280 95 L340 130 L400 110 L460 135 L500 120 L500 200 Z"
        fill="url(#mtn2)"
      />

      {/* Snow caps on middle mountains */}
      <path
        d="M170 105 L180 115 L160 115 Z"
        fill="white"
        fillOpacity="0.3"
      />
      <path
        d="M280 95 L290 108 L270 108 Z"
        fill="white"
        fillOpacity="0.25"
      />

      {/* Front mountains (darker) */}
      <path
        d="M0 200 L0 160 L80 135 L160 165 L220 130 L280 155 L360 125 L440 150 L500 140 L500 200 Z"
        fill="url(#mtn1)"
      />

      {/* Foreground hills */}
      <path
        d="M0 200 L0 175 L100 165 L200 178 L300 168 L400 175 L500 170 L500 200 Z"
        fill="#93c5fd"
        fillOpacity="0.1"
      />

      {/* Small trees (silhouettes) */}
      <g fill="#64748b" fillOpacity="0.08">
        <path d="M60 175 L65 160 L70 175 Z" />
        <path d="M80 172 L84 158 L88 172 Z" />
        <path d="M400 170 L404 156 L408 170 Z" />
        <path d="M420 172 L424 160 L428 172 Z" />
        <path d="M440 174 L443 164 L446 174 Z" />
      </g>
    </svg>
  );
}
