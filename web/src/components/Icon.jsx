// Simple line icons drawn for this site.
const PATHS = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  phone: <path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z" />,
  repair: <path d="M14 7a4 4 0 0 0 5 5l-8 8a2 2 0 0 1-3-3l8-8a4 4 0 0 0-5-5l3 3z" />,
  plug: <><path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0z" /><path d="M12 17v5" /></>,
  plan: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h8V3M11 10v11M11 15h10" /></>,
  wire: <path d="M3 18c4 0 4-12 8-12s4 12 8 12M3 18h2M19 18h2" />,
  meter: <><rect x="4" y="3" width="16" height="18" rx="2" /><rect x="7" y="6" width="10" height="5" rx="1" /><path d="M8 15h2M14 15h2M8 18h8" /></>,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  check: <path d="m5 12 5 5L20 7" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  building: <><path d="M4 21V5l8-3v19M12 9h8v12M4 21h16" /><path d="M8 8h0M8 12h0M8 16h0M16 13h0M16 17h0" /></>,
  photo: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m3 17 5-4 4 3 3-2 6 4" /></>,
  pin: <><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
};

export default function Icon({ name, className = '' }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
