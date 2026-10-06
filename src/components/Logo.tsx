export function Logo({ className = 'w-9 h-11' }: { className?: string }) {
  return <img src="/logo-mark.svg" alt="Kollab" width="48" height="56" className={`${className} shrink-0 object-contain overflow-visible`} />;
}
