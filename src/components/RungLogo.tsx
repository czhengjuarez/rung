export function RungLogo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="rung-logo-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB41AA" />
          <stop offset="100%" stopColor="#8F1F57" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="url(#rung-logo-g)" />
      <g stroke="white" strokeWidth="2" strokeLinecap="round">
        {/* Left rail */}
        <line x1="7.5" y1="2.5" x2="7.5" y2="21.5" />
        {/* Right rail */}
        <line x1="16.5" y1="2.5" x2="16.5" y2="21.5" />
        {/* Rungs — evenly spaced */}
        <line x1="7.5" y1="6.3"  x2="16.5" y2="6.3" />
        <line x1="7.5" y1="10.1" x2="16.5" y2="10.1" />
        <line x1="7.5" y1="13.9" x2="16.5" y2="13.9" />
        <line x1="7.5" y1="17.7" x2="16.5" y2="17.7" />
      </g>
    </svg>
  );
}
