import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, ChevronDown, Shield, Briefcase, User,
  LayoutDashboard, Users, BarChart3,
  Package, CircleUser as UserCircle, ClipboardList, Wallet,
  Settings, LogOut, Bell, Menu, Activity, Zap, Target, Eye, FileText, ChevronRight,
  Award, Clock, CheckCircle2, Lock, DollarSign, BarChart, ListFilter
} from 'lucide-react';
import { AdminDashboard, BrandManagement, CampaignManagement, KOLManagement, ProductManagement, PaymentMonitoring, WorkHistory, SystemRanking, ReportCenter, PerformanceCenter, PaymentProcessing, PaymentHold, PaymentPaid } from './views/admin/AdminPanel';
import { BrandDashboard } from './views/brand/BrandDashboard';
import { KOLDashboard } from './views/kol/KOLPortal';
import type { Role } from './data/mockData';

const roleConfig: Record<Role, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  admin: { label: 'Quản trị viên', icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' },
  brand: { label: 'Bảng điều khiển Brand', icon: Briefcase, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50' },
  kol: { label: 'Cổng KOL/KOC', icon: User, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' },
};

const sidebarItems: Record<Role, { id: string; label: string; icon: typeof Shield; children?: { id: string; label: string; icon: typeof Shield }[]; isHeader?: boolean }[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // BUSINESS section
    { id: 'business-header', label: 'BUSINESS', icon: Briefcase, isHeader: true },
    { id: 'brands', label: 'Brands', icon: Briefcase,
      children: [
        { id: 'brands', label: 'Danh sách Brand', icon: ListFilter },
      ]
    },
    { id: 'products', label: 'Products', icon: Package,
      children: [
        { id: 'products', label: 'Danh sách sản phẩm', icon: ListFilter },
      ]
    },
    { id: 'campaigns', label: 'Campaigns', icon: Target,
      children: [
        { id: 'campaigns', label: 'Danh sách chiến dịch', icon: ListFilter },
      ]
    },
    // CREATORS section
    { id: 'creators-header', label: 'CREATORS', icon: Users, isHeader: true },
    { id: 'kolmanagement', label: 'KOL/KOC', icon: Users,
      children: [
        { id: 'kolmanagement', label: 'Danh sách KOL/KOC', icon: ListFilter },
      ]
    },
    { id: 'rankings', label: 'Rankings', icon: Award,
      children: [
        { id: 'ranking', label: 'Xếp hạng', icon: Award },
      ]
    },
    // FINANCE section
    { id: 'finance-header', label: 'FINANCE', icon: Wallet, isHeader: true },
    { id: 'payments', label: 'Payments', icon: Wallet,
      children: [
        { id: 'payments', label: 'Danh sách thanh toán', icon: ListFilter },
        { id: 'payments-processing', label: 'Xử lý thanh toán', icon: DollarSign },
        { id: 'payments-paid', label: 'Đã thanh toán', icon: CheckCircle2 },
        { id: 'payments-hold', label: 'Tạm giữ', icon: Lock },
      ]
    },
    // ANALYTICS section
    { id: 'analytics-header', label: 'ANALYTICS', icon: BarChart3, isHeader: true },
    { id: 'performance', label: 'Performance', icon: Activity,
      children: [
        { id: 'performance', label: 'Tổng quan', icon: BarChart },
      ]
    },
    { id: 'reports', label: 'Reports', icon: FileText },
    // AUDIT section
    { id: 'audit-header', label: 'AUDIT', icon: Clock, isHeader: true },
    { id: 'history', label: 'Activity Logs', icon: Clock },
    // SYSTEM sections
    { id: 'system-header', label: 'SYSTEM', icon: Settings, isHeader: true },
  ],
  brand: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'campaigns', label: 'Chiến dịch', icon: Target },
    { id: 'kol', label: 'KOL/KOC', icon: Users },
    { id: 'tasks', label: 'Nhiệm vụ', icon: ClipboardList },
    { id: 'content', label: 'Phê duyệt nội dung', icon: Eye },
    { id: 'performance', label: 'Theo dõi hiệu suất', icon: Activity },
    { id: 'payment', label: 'Thanh toán', icon: Wallet },
  ],
  kol: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'profile', label: 'Hồ sơ & Thông tin', icon: UserCircle },
    { id: 'tasks', label: 'Nhiệm vụ', icon: ClipboardList },
    { id: 'payment', label: 'Thanh toán', icon: Wallet },
  ],
};


function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState<Role>('brand');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [notificationOpen, setNotificationOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Chiến dịch mới được duyệt', message: 'Chiến dịch "Summer Sale 2026" đã được phê duyệt', time: '5 phút trước', unread: true },
    { id: 2, title: 'KOL hoàn thành nhiệm vụ', message: 'Nguyen Van A đã hoàn thành nhiệm vụ Campaign #123', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Thanh toán đã xử lý', message: 'Thanh toán 5,000,000 VND đã được xử lý thành công', time: '2 giờ trước', unread: false },
    { id: 4, title: 'Cảnh báo ngân sách', message: 'Chiến dịch "Black Friday" đã sử dụng 80% ngân sách', time: '1 ngày trước', unread: false },
  ];

  const viewComponents: Record<Role, Record<string, (props: { initialView?: string; initialStatus?: string }) => React.JSX.Element>> = {
    admin: {
      dashboard: (props) => <AdminDashboard onNavigate={(viewId) => {
        setActiveView(viewId);
        setExpandedItems(new Set());
      }} initialView={props?.initialView as any || 'dashboard'} />,
      brands: (props) => <AdminDashboard initialView="brands" onNavigate={(viewId) => setActiveView(viewId)} />,
      products: (props) => <AdminDashboard initialView="products" onNavigate={(viewId) => setActiveView(viewId)} />,
      campaigns: (props) => <AdminDashboard initialView="campaigns" onNavigate={(viewId) => setActiveView(viewId)} />,
      kolmanagement: (props) => <AdminDashboard initialView="kolmanagement" onNavigate={(viewId) => setActiveView(viewId)} />,
      ranking: (props) => <AdminDashboard initialView="ranking" onNavigate={(viewId) => setActiveView(viewId)} />,
      rankings: (props) => <AdminDashboard initialView="ranking" onNavigate={(viewId) => setActiveView(viewId)} />,
      payments: (props) => <AdminDashboard initialView="payments" onNavigate={(viewId) => setActiveView(viewId)} />,
      'payments-processing': (props) => <AdminDashboard initialView="payments-processing" onNavigate={(viewId) => setActiveView(viewId)} />,
      'payments-paid': (props) => <AdminDashboard initialView="payments-paid" onNavigate={(viewId) => setActiveView(viewId)} />,
      'payments-hold': (props) => <AdminDashboard initialView="payments-hold" onNavigate={(viewId) => setActiveView(viewId)} />,
      performance: (props) => <AdminDashboard initialView="performance" onNavigate={(viewId) => setActiveView(viewId)} />,
      reports: (props) => <AdminDashboard initialView="reports" onNavigate={(viewId) => setActiveView(viewId)} />,
      history: (props) => <AdminDashboard initialView="history" onNavigate={(viewId) => setActiveView(viewId)} />,
    },
    brand: {
      dashboard: (props) => <BrandDashboard initialView={props?.initialView as any || 'overview'} />,
      products: (props) => <BrandDashboard initialView="products" />,
      campaigns: (props) => <BrandDashboard initialView="campaigns" />,
      kol: (props) => <BrandDashboard initialView="kol" />,
      tasks: (props) => <BrandDashboard initialView="tasks" />,
      content: (props) => <BrandDashboard initialView="content" />,
      performance: (props) => <BrandDashboard initialView="performance" />,
      payment: (props) => <BrandDashboard initialView="payment" />,
    },
    kol: {
      dashboard: (props) => <KOLDashboard initialView={props?.initialView as any || 'dashboard'} />,
      profile: (props) => <KOLDashboard initialView={props?.initialView as any || 'profile'} />,
      tasks: (props) => <KOLDashboard initialView={props?.initialView as any || 'tasks'} />,
      submit: (props) => <KOLDashboard initialView={props?.initialView as any || 'submit'} />,
      payment: (props) => <KOLDashboard initialView={props?.initialView as any || 'payment'} />,
    },
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    setActiveView(sidebarItems[role][0].id);
  }, [role]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const currentRoleConfig = roleConfig[role];
  const RoleIcon = currentRoleConfig.icon;
  const ActiveComponent = viewComponents[role]?.[activeView];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 h-16 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200'} border-b backdrop-blur-md`}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                <img src="/logo.png" alt="KOLLAB" className="w-9 h-9 object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">KOLLAB</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Quản lý Chiến dịch KOL</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${currentRoleConfig.bg}`}
              >
                <RoleIcon className={`w-4 h-4 ${currentRoleConfig.color}`} />
                <span className={`hidden sm:inline ${currentRoleConfig.color}`}>{currentRoleConfig.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 ${currentRoleConfig.color}`} />
              </button>
              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden z-50"
                  >
                    {(Object.keys(roleConfig) as Role[]).map((r) => {
                      const config = roleConfig[r];
                      const Icon = config.icon;
                      const isActive = r === role;
                      return (
                        <button
                          key={r}
                          onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            isActive ? `${config.bg} ${config.color} font-semibold` : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? config.color : ''}`} />
                          {config.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {role !== 'kol' && (
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            )}

            {role !== 'kol' && (
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${role === 'admin' ? 'from-red-400 to-red-600' : 'from-teal-400 to-teal-600'} flex items-center justify-center text-white text-sm font-semibold cursor-pointer`}>JD</div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {notificationOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-4 top-16 w-80 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                <button className="text-xs text-teal-600 dark:text-teal-400 hover:underline">Đánh dấu đã đọc</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${notif.unread ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full ${notif.unread ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700">
                <button className="w-full text-center text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium">
                  Xem tất cả thông báo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed top-16 left-0 bottom-0 z-30 w-64 transition-transform duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-r ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="flex-1 p-3 overflow-y-auto">
            {sidebarItems[role].map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isParentActive = hasChildren && item.children?.some(child => activeView === child.id);
              const isActive = activeView === item.id;
              const isExpanded = expandedItems.has(item.id);
              const isHeader = item.id.endsWith('-header');

              if (isHeader) {
                return (
                  <div key={item.id} className="pt-4 pb-2 px-3">
                    <span className="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                      {item.label}
                    </span>
                  </div>
                );
              }

              if (hasChildren && item.children!.length > 1) {
                return (
                  <div key={item.id} className="mb-1">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isParentActive
                          ? `${role === 'admin' ? (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700') : role === 'kol' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700') : (darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700')} shadow-sm`
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isParentActive ? (role === 'admin' ? (darkMode ? 'text-red-400' : 'text-red-600') : role === 'kol' ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-teal-400' : 'text-teal-600')) : ''}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-3 border-l-2 border-gray-200 dark:border-slate-700 space-y-0.5 py-1">
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = activeView === child.id;
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => { setActiveView(child.id); setMobileMenuOpen(false); }}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isChildActive
                                      ? `${role === 'admin' ? (darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700') : role === 'kol' ? (darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-100 text-teal-700')} font-semibold`
                                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-300'
                                  }`}
                                >
                                  <ChildIcon className="w-3.5 h-3.5" />
                                  <span>{child.label}</span>
                                  {isChildActive && <motion.div layoutId="sidebarActive" className={`ml-auto w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-red-500' : role === 'kol' ? 'bg-blue-500' : 'bg-teal-500'}`} />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              if (hasChildren && item.children!.length === 1) {
                const singleChild = item.children![0];
                const isChildActive = activeView === singleChild.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(singleChild.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                      isChildActive
                        ? `${role === 'admin' ? (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700') : role === 'kol' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700') : (darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700')} shadow-sm`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isChildActive ? (role === 'admin' ? (darkMode ? 'text-red-400' : 'text-red-600') : role === 'kol' ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-teal-400' : 'text-teal-600')) : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isChildActive && <motion.div layoutId="sidebarActive" className={`ml-auto w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-red-500' : role === 'kol' ? 'bg-blue-500' : 'bg-teal-500'}`} />}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                    isActive
                      ? `${role === 'admin' ? (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700') : role === 'kol' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700') : (darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700')} shadow-sm`
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (role === 'admin' ? (darkMode ? 'text-red-400' : 'text-red-600') : role === 'kol' ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-teal-400' : 'text-teal-600')) : ''}`} />
                  {item.label}
                  {isActive && <motion.div layoutId="sidebarActive" className={`ml-auto w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-red-500' : role === 'kol' ? 'bg-blue-500' : 'bg-teal-500'}`} />}
                </button>
              );
            })}
          </div>
          <div className={`p-3 border-t ${darkMode ? 'border-slate-800' : 'border-gray-200'}`}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <Settings className="w-4 h-4" />Cài đặt
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4" />Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${activeView}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {ActiveComponent && <ActiveComponent initialView={activeView} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {roleDropdownOpen && <div className="fixed inset-0 z-30" onClick={() => setRoleDropdownOpen(false)} />}
    </div>
  );
}

export default App;
