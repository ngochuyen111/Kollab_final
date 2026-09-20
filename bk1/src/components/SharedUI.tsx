import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────
export const roleColors = {
  admin: {
    primary: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800/50',
    active: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300',
    iconBg: 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400',
    gradient: 'from-red-400 to-rose-500',
    gradientLight: 'from-red-50/80 to-rose-50/50 dark:from-red-900/15 dark:to-rose-900/15',
    buttonPrimary: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-500/40',
    buttonSecondary: 'bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/50 shadow-sm',
  },
  brand: {
    primary: 'text-brand-500 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-900/20',
    border: 'border-brand-200 dark:border-brand-800/50',
    active: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300',
    iconBg: 'bg-brand-100 dark:bg-brand-900/40 text-brand-500 dark:text-brand-400',
    gradient: 'from-brand-400 to-brand-600',
    gradientLight: 'from-brand-50/80 to-teal-50/50 dark:from-brand-900/15 dark:to-teal-900/15',
    buttonPrimary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-md focus:ring-brand-500/40',
    buttonSecondary: 'bg-white dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800/50 shadow-sm',
  },
  kol: {
    primary: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800/50',
    active: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400',
    gradient: 'from-blue-400 to-indigo-600',
    gradientLight: 'from-blue-50/80 to-indigo-50/50 dark:from-blue-900/15 dark:to-indigo-900/15',
    buttonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md focus:ring-blue-500/40',
    buttonSecondary: 'bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm',
  },
} as const;

export type RoleKey = keyof typeof roleColors;

// ─── CARD STYLES ────────────────────────────────────────────────────────
export const cardStyles = {
  container: 'bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-soft',
  containerFlat: 'bg-slate-50/80 dark:bg-slate-800/40 rounded-xl',
  padding: 'p-6',
  paddingSm: 'p-4',
  gap: 'gap-4',
  gapSm: 'gap-3',
  shadow: 'shadow-soft hover:shadow-card transition-shadow',
  hover: 'card-hover',
} as const;

// ─── TABLE STYLES ───────────────────────────────────────────────────────
export const tableStyles = {
  wrapper: 'overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-700/50',
  thead: 'bg-slate-50/80 dark:bg-slate-800/80',
  theadSticky: 'sticky top-0',
  th: 'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left whitespace-nowrap',
  td: 'px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300',
  tr: 'border-b border-slate-100 dark:border-slate-700/40 last:border-0',
  trHover: 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors',
} as const;

// ─── MODAL ───────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`${width} w-full bg-white dark:bg-slate-800 rounded-2xl shadow-panel overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── KPI WIDGET ──────────────────────────────────────────────────────────
interface KPIWidgetProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: ReactNode;
  accent?: string;
  role?: RoleKey;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPIWidget({ label, value, change, positive, icon, role = 'brand', trend }: KPIWidgetProps) {
  const colors = roleColors[role];
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`card-base p-5 ${colors.gradientLight} border-brand-200/40 dark:border-brand-700/40 card-hover relative h-full`}
    >
      <div className="flex flex-col justify-between h-full pr-10">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{value}</p>
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' || (positive && trend !== 'down') ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : trend === 'down' || (!positive) ? (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            ) : null}
            <span className={`text-xs font-semibold ${
              (trend === 'up' || (positive && trend !== 'down'))
                ? 'text-emerald-600 dark:text-emerald-400'
                : (trend === 'down' || !positive)
                ? 'text-red-500 dark:text-red-400'
                : 'text-slate-500'
            }`}>
              {change}
            </span>
            {trend !== 'neutral' && <span className="text-xs text-slate-400">vs kỳ trước</span>}
          </div>
        )}
      </div>
      <div className={`absolute top-4 right-4 p-1.5 rounded-lg ${colors.iconBg} shadow-sm`}>
        <div className="w-4 h-4">{icon}</div>
      </div>
    </motion.div>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────────
export function Badge({ label, colorClass }: { label: string; colorClass?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
      {label}
    </span>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────────────
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  role?: RoleKey;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, role = 'brand', icon, iconPosition = 'left' }: ButtonProps) {
  const colors = roleColors[role];
  const sizes = { xs: 'px-2.5 py-1 text-xs gap-1', sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2' };

  let variantClass = '';
  if (variant === 'primary') {
    variantClass = `${colors.buttonPrimary} rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`;
  } else if (variant === 'danger') {
    variantClass = 'bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2';
  } else if (variant === 'secondary') {
    variantClass = `${colors.buttonSecondary} rounded-xl font-semibold active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`;
  } else {
    variantClass = 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl font-medium transition-all duration-200 focus:outline-none';
  }

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center ${sizes[size]} ${variantClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {content}
    </motion.button>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 'md', role = 'brand', image }: { initials: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; role?: RoleKey; image?: string }) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-20 h-20 text-2xl' };
  const gradients = { admin: 'from-red-400 to-rose-500', brand: 'from-brand-400 to-brand-600', kol: 'from-blue-400 to-indigo-600' };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br ${gradients[role]} flex items-center justify-center text-white font-bold shadow-sm overflow-hidden`}>
      {image ? <img src={image} alt={initials} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

// ─── COPY BUTTON ─────────────────────────────────────────────────────────
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
      title="Sao chép"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }} className="text-emerald-500">
            <Check className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
            <Copy className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── QR DISPLAY ──────────────────────────────────────────────────────────
export function QRDisplay({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' };
  const pattern = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
    [0,0,0,1,0,1,0,0,0],
    [1,0,1,0,1,0,1,0,1],
    [0,0,0,1,0,1,0,0,0],
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
  ];
  return (
    <div className={`${sizes[size]} bg-white rounded-xl p-1.5 shadow-sm`}>
      <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-px">
        {pattern.flat().map((cell, i) => (
          <div key={i} className={`rounded-[1px] ${cell ? 'bg-slate-900' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── CREDENTIAL DISPLAY ─────────────────────────────────────────────────
export function CredentialDisplay({ username, password }: { username: string; password: string }) {
  return (
    <div className="bg-brand-50/80 dark:bg-brand-900/15 border border-brand-200/60 dark:border-brand-800/40 rounded-xl p-4 space-y-3">
      <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Thông tin đăng nhập</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2.5">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Tài khoản: </span>
            <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{username}</span>
          </div>
          <CopyButton text={username} />
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2.5">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Mật khẩu: </span>
            <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{password}</span>
          </div>
          <CopyButton text={password} />
        </div>
      </div>
    </div>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${i < Math.round(rating) ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-600'}`} />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── PAGE TRANSITION ─────────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, trend, icon, color }: {
  label: string; value: string; sub?: string; trend?: { value: string; positive: boolean };
  icon?: ReactNode; color?: 'brand' | 'red' | 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorMap = {
    brand: 'from-brand-400 to-brand-600',
    red: 'from-red-400 to-rose-500',
    blue: 'from-blue-400 to-indigo-500',
    emerald: 'from-emerald-400 to-teal-500',
    amber: 'from-amber-400 to-orange-500',
    purple: 'from-purple-400 to-fuchsia-500',
  };
  const c = color ?? 'brand';
  return (
    <div className="card-base p-5 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[c]} shadow-sm flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'brand', size = 'md', showLabel = false }: {
  value: number; max?: number; color?: 'brand' | 'red' | 'blue' | 'emerald' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg'; showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };
  const sizeMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{value.toLocaleString()} / {max.toLocaleString()}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100/80 dark:bg-slate-700/60 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ─── CHIP ─────────────────────────────────────────────────────────────────
// Compact pill for tags, categories, filters
export function Chip({ label, selected, onClick, colorClass }: {
  label: string; selected?: boolean; onClick?: () => void; colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
        selected
          ? (colorClass ?? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300')
          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full bg-slate-100 dark:bg-slate-700/50 ${className}`} />;
}

// ─── SKELETON CARD ─────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card-base p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-2 bg-slate-100 dark:bg-slate-700/60 rounded w-3/4" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-2 bg-slate-100 dark:bg-slate-700/60 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

// ─── METRIC TILE ──────────────────────────────────────────────────────────
export function MetricTile({ label, value, icon, trend, trendValue }: {
  label: string; value: string; icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral'; trendValue?: string;
}) {
  return (
    <div className="surface-subtle p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      {trendValue && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
          trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
          trend === 'down' ? 'text-red-500 dark:text-red-400' :
          'text-slate-500'
        }`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
  );
}
