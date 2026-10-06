import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, BarChart3, Briefcase, ClipboardList, CreditCard, Eye, LayoutDashboard,
  LogOut, Menu, Moon, Package, Sun, UserCircle, Users, Wallet, X,
} from 'lucide-react';
const AdminDashboard = lazy(() => import('./views/admin/AdminPanel').then(m => ({ default: m.AdminDashboard })));
const BrandDashboard = lazy(() => import('./views/brand/BrandDashboard').then(m => ({ default: m.BrandDashboard })));
const KOLDashboard = lazy(() => import('./views/kol/KOLPortal').then(m => ({ default: m.KOLDashboard }))); 
import { authService } from './services/authService';
import { Login } from './views/auth/Login';
import { Logo } from './components/Logo';
import { Avatar, Modal } from './components/SharedUI';
import { AccountProfile } from './components/AccountProfile';
import { NotificationBell } from './components/NotificationBell';
import { userService } from './services/userService';
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
    { id: 'outcomes', label: 'Kết quả chiến dịch', icon: Activity },
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

function App() {
  const [user, setUser] = useState<AppUser | null>(() => authService.getCurrentUser());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('kollab_theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const userId = user?.id;
  const userRole = user?.role;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initialView = user ? navigation[user.role][0].id : 'dashboard';
  const [activeView, setActiveView] = useState(initialView);

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); localStorage.setItem('kollab_theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { if (userRole) setActiveView(navigation[userRole][0].id); }, [userId, userRole]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = async () => { try { const fresh = await userService.getById(userId); if (active) { authService.setCurrentUser(fresh); setUser(fresh); } } catch { /* Retain session on transient network failures. */ } };
    void refresh(); window.addEventListener('kollab:user-updated', refresh);
    return () => { active = false; window.removeEventListener('kollab:user-updated', refresh); };
  }, [userId]);

  const roleLabel = useMemo(() => ({ ADMIN: 'Quản trị viên', BRAND: 'Brand', KOL: 'KOL', KOC: 'KOC' }[user?.role ?? 'BRAND']), [user]);
  if (!user) return <Login onLogin={setUser} />;

  const items = navigation[user.role];
  const logout = () => { authService.logout(); setUser(null); };
  const content = user.role === 'ADMIN'
    ? <AdminDashboard initialView={activeView} user={user} />
    : user.role === 'BRAND'
      ? <BrandDashboard initialView={activeView} user={user} onNavigate={setActiveView} />
      : <KOLDashboard initialView={activeView} user={user} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden btn-ghost p-2"><Menu className="w-5 h-5" /></button>
            <Logo />
            <div><h1 className="text-sm font-bold text-slate-900 dark:text-white">KOLLAB</h1><p className="text-[10px] text-slate-500">Quản lý chiến dịch KOL</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex badge-info">{roleLabel}</span>
            <NotificationBell key={user.id} userId={user.id} onNavigate={view => { if (items.some(i => i.id === view)) { setActiveView(view); window.dispatchEvent(new Event('kollab:refresh')); } }} />
            <button className="btn-ghost p-2" onClick={() => setDarkMode(v => !v)} title="Đổi giao diện">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button aria-label="Hồ sơ tài khoản" title="Hồ sơ tài khoản" onClick={() => setProfileOpen(true)}><Avatar initials={user.full_name.slice(0, 2).toUpperCase()} image={user.avatar_url ?? undefined} role={user.role === 'ADMIN' ? 'admin' : user.role === 'BRAND' ? 'brand' : 'kol'} /></button>
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

      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="Hồ sơ tài khoản">{profileOpen && <AccountProfile user={user} onSaved={setUser} onClose={() => setProfileOpen(false)} />}</Modal>
      <main className="lg:ml-64 pt-16 min-h-screen"><div className="p-4 lg:p-8"><AnimatePresence mode="wait"><motion.div key={`${user.role}-${activeView}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><Suspense fallback={<div className="skeleton h-96" />}>{content}</Suspense></motion.div></AnimatePresence></div></main>
    </div>
  );
}

export default App;
