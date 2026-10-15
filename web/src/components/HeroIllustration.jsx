// Original illustration of the hero: an electrical panel with breakers and a glowing bulb.
export default function HeroIllustration() {
  return (
    <svg className="hero__art" viewBox="0 0 420 380" role="img" aria-label="Электрощиток и лампа">
      <defs>
        <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d3557" />
          <stop offset="1" stopColor="#13243d" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd23f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="320" cy="96" r="92" fill="url(#glow)" />

      <rect x="40" y="70" width="230" height="270" rx="18" fill="url(#panel)" stroke="#2c4a73" strokeWidth="2" />
      <rect x="60" y="92" width="190" height="10" rx="5" fill="#2c4a73" />
      {[0, 1, 2].map((row) => (
        <g key={row} transform={`translate(62 ${122 + row * 70})`}>
          <rect width="186" height="52" rx="8" fill="#0d1b2e" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${10 + i * 35} 8)`}>
              <rect width="26" height="36" rx="4" fill="#e9eef5" />
              <rect x="7" y={(row + i) % 3 === 0 ? 6 : 18} width="12" height="12" rx="2"
                fill={(row + i) % 3 === 0 ? '#ffc21a' : '#5b7290'} />
            </g>
          ))}
        </g>
      ))}

      <path d="M270 150 C 330 150, 320 120, 320 150" fill="none" stroke="#5b7290" strokeWidth="4" />
      <path d="M320 128 v 32" stroke="#5b7290" strokeWidth="4" />
      <g transform="translate(320 96)">
        <path d="M-26 0 a26 26 0 1 1 52 0 c0 12 -9 18 -12 28 h-28 c-3 -10 -12 -16 -12 -28z" fill="#ffd23f" />
        <rect x="-14" y="30" width="28" height="12" rx="3" fill="#c9d4e2" />
        <path d="M-6 6 l6 -12 l2 10 h6 l-8 14 l-1 -10z" fill="#13243d" />
      </g>
      <g stroke="#ffd23f" strokeWidth="4" strokeLinecap="round">
        <path d="M320 40 v-14" /><path d="M362 58 l10 -10" /><path d="M278 58 l-10 -10" />
        <path d="M380 96 h14" /><path d="M260 96 h-14" />
      </g>
    </svg>
  );
}
