export default function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="brand-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CC785C" />
          <stop offset="100%" stopColor="#B0562B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#brand-mark-bg)" />
      <rect x="16" y="34" width="8" height="16" rx="2.5" fill="#F5F4EE" />
      <rect x="28" y="24" width="8" height="26" rx="2.5" fill="#F5F4EE" />
      <rect x="40" y="14" width="8" height="36" rx="2.5" fill="#F5F4EE" opacity="0.92" />
    </svg>
  );
}
