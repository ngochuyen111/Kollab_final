import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, BarChart3, Bell, Briefcase, ClipboardList, CreditCard, Eye, LayoutDashboard,
  LogOut, Menu, Moon, Package, Sun, UserCircle, Users, Wallet, X,
} from 'lucide-react';
import { AdminDashboard } from './views/admin/AdminPanel';
import { BrandDashboard } from './views/brand/BrandDashboard';
import { KOLDashboard } from './views/kol/KOLPortal';
import { authService } from './services/authService';
import { getErrorMessage } from './constants/domain';
import type { AppUser, UserRole } from './types/database';

type NavItem = { id: string; label: string; icon: typeof LayoutDashboard };

const navigation: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { id: 'dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { id: 'brands', label: 'Brands', icon: Briefcase },
    { id: 'campaigns', label: 'Chiến dịch', icon: BarChart3 },
    { id: 'creators', label: 'KOL/KOC', icon: Users },
    { id: 'payments', label: 'Thanh toán', icon: Wallet },
  ],
  BRAND: [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'campaigns', label: 'Chiến dịch', icon: BarChart3 },
    { id: 'kol', label: 'KOL/KOC', icon: Users },
    { id: 'tasks', label: 'Nhiệm vụ', icon: ClipboardList },
    { id: 'content', label: 'Phê duyệt nội dung', icon: Eye },
    { id: 'performance', label: 'Theo dõi hiệu suất', icon: Activity },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
  ],
  KOL: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'profile', label: 'Hồ sơ & Thông tin', icon: UserCircle },
    { id: 'tasks', label: 'Nhiệm vụ', icon: ClipboardList },
    { id: 'payment', label: 'Thanh toán', icon: Wallet },
  ],
  KOC: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'profile', label: 'Hồ sơ & Thông tin', icon: UserCircle },
    { id: 'tasks', label: 'Nhiệm vụ', icon: ClipboardList },
    { id: 'payment', label: 'Thanh toán', icon: Wallet },
  ],
};

function Login({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      onLogin(await authService.login(email, password));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card-base p-8">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Kollab" className="w-12 h-12 object-contain" />
          <div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">KOLLAB</h1><p className="text-sm text-slate-500">Influencer Marketing Platform</p></div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="input-label">Email</label><input className="input-base" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></div>
          <div><label className="input-label">Mật khẩu</label><input className="input-base" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></div>
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">{error}</p>}
          <button disabled={loading} className="btn-primary w-full" type="submit">{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>
        <p className="mt-6 text-xs text-slate-400 text-center">Tài khoản được xác thực từ bảng users trên Supabase.</p>
      </motion.div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<AppUser | null>(() => authService.getCurrentUser());
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initialView = user ? navigation[user.role][0].id : 'dashboard';
  const [activeView, setActiveView] = useState(initialView);

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  useEffect(() => { if (user) setActiveView(navigation[user.role][0].id); }, [user]);

  const roleLabel = useMemo(() => ({ ADMIN: 'Quản trị viên', BRAND: 'Brand', KOL: 'KOL', KOC: 'KOC' }[user?.role ?? 'BRAND']), [user]);
  if (!user) return <Login onLogin={setUser} />;

  const items = navigation[user.role];
  const logout = () => { authService.logout(); setUser(null); };
  const content = user.role === 'ADMIN'
    ? <AdminDashboard initialView={activeView} />
    : user.role === 'BRAND'
      ? <BrandDashboard initialView={activeView} user={user} />
      : <KOLDashboard initialView={activeView} user={user} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden btn-ghost p-2"><Menu className="w-5 h-5" /></button>
            <img src="/logo.png" alt="Kollab" className="w-9 h-9 object-contain" />
            <div><h1 className="text-sm font-bold text-slate-900 dark:text-white">KOLLAB</h1><p className="text-[10px] text-slate-500">Quản lý chiến dịch KOL</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex badge-info">{roleLabel}</span>
            <button className="btn-ghost p-2" title="Thông báo"><Bell className="w-5 h-5" /></button>
            <button className="btn-ghost p-2" onClick={() => setDarkMode(v => !v)} title="Đổi giao diện">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold flex items-center justify-center">{user.full_name.slice(0, 2).toUpperCase()}</div>
          </div>
        </div>
      </header>

      <AnimatePresence>{mobileMenuOpen && <motion.button aria-label="Đóng menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}</AnimatePresence>
      <aside className={`fixed left-0 top-16 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="lg:hidden flex justify-end p-3"><button onClick={() => setMobileMenuOpen(false)} className="btn-ghost p-2"><X className="w-5 h-5" /></button></div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {items.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return <button key={item.id} onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Icon className="w-4 h-4" />{item.label}</button>;
            })}
          </nav>
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 pb-3"><p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.full_name}</p><p className="text-xs text-slate-400 truncate">{user.email}</p></div>
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut className="w-4 h-4" />Đăng xuất</button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 min-h-screen"><div className="p-4 lg:p-8"><AnimatePresence mode="wait"><motion.div key={`${user.role}-${activeView}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>{content}</motion.div></AnimatePresence></div></main>
    </div>
  );
}

export default App;
