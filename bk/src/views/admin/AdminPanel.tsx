import { useState, useEffect } from 'react';
import {
  Users, Plus, Search, CheckCircle2, Lock, Ban,
  Eye, Package, Briefcase, BarChart3, DollarSign, TrendingUp,
  Award, CreditCard, Clock, Activity, Download, TrendingDown, ArrowUpRight, FileText, Target, ChevronDown, Wallet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, AreaChart, Area } from 'recharts';
import { KPIWidget, Modal, Button, Badge, CredentialDisplay, Avatar } from '../../components/SharedUI';
import {
  brands, products, kols, campaigns, tasks, payments, workHistory,
  kolRankings, campaignRankings, brandRankings, systemStats, nicheColors, nicheLabels,
  paymentStatusLabels, campaignStatusLabels, taskStatusLabels, taskStatusColors,
  type TaskStatus, type CampaignStatus, type KOL
} from '../../data/mockData';

const KOL_AVATAR_IMAGES: Record<string, string> = {
  LB: 'https://i.pravatar.cc/150?img=47',
  MF: 'https://i.pravatar.cc/150?img=11',
  TT: 'https://i.pravatar.cc/150?img=12',
  HF: 'https://i.pravatar.cc/150?img=53',
  PM: 'https://i.pravatar.cc/150?img=44',
  AK: 'https://i.pravatar.cc/150?img=15',
  MH: 'https://i.pravatar.cc/150?img=49',
  LT: 'https://i.pravatar.cc/150?img=48',
  HC: 'https://i.pravatar.cc/150?img=51',
  NM: 'https://i.pravatar.cc/150?img=14',
};
const BRAND_AVATAR_IMAGES: Record<string, string> = {
  GL: 'https://i.pravatar.cc/150?img=1',
  Su: 'https://i.pravatar.cc/150?img=2',
  Ve: 'https://i.pravatar.cc/150?img=3',
};
function getKolImage(initials: string) { return KOL_AVATAR_IMAGES[initials] || ''; }
function getBrandImage(initials: string) { return BRAND_AVATAR_IMAGES[initials] || ''; }

// ─── KPI SECTION COMPONENT ──────────────────────────────────────────
interface KPISectionProps {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    type: string;
    label: string;
    value: string | number;
    change?: string;
    positive?: boolean;
    icon: React.ReactNode;
    accent?: string;
    data: any[];
    detailTitle: string;
    detailColumns: string[];
    detailRender: (item: any) => string[];
    onRowClick?: (item: any) => void;
    navigateTo?: string;
  }>;
  defaultOpen?: boolean;
  onCardClick?: (type: string, title: string) => void;
  onNavigate?: (viewId: string) => void;
}

function KPISection({ title, icon, items, defaultOpen = true, onCardClick, onNavigate }: KPISectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getColorClass = (accent?: string) => {
    if (accent?.includes('purple')) return 'bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
    if (accent?.includes('blue')) return 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    if (accent?.includes('pink')) return 'bg-pink-100/80 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
    if (accent?.includes('orange')) return 'bg-orange-100/80 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
    if (accent?.includes('cyan')) return 'bg-cyan-100/80 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400';
    if (accent?.includes('teal') || accent?.includes('brand')) return 'bg-brand-100/80 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400';
    if (accent?.includes('amber')) return 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
    if (accent?.includes('emerald')) return 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
    return 'bg-slate-100/80 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="card-base overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100/80 dark:bg-red-900/30 rounded-xl text-brand-500 dark:text-brand-400">
            {icon}
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <Badge label={`${items.length} metrics`} colorClass="bg-slate-100/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300" />
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((kpi, idx) => (
              <button
                key={idx}
                onClick={() => kpi.navigateTo ? onNavigate?.(kpi.navigateTo) : onCardClick?.(kpi.type, kpi.detailTitle)}
                className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm text-left hover:shadow-card-hover hover:border-slate-300/70 dark:hover:border-slate-600/60 hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-1.5 rounded-lg ${getColorClass(kpi.accent)}`}>
                    <div className="w-4 h-4">{kpi.icon}</div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xl font-bold font-display text-slate-900 dark:text-white">{kpi.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{kpi.label}</p>
                {kpi.change && (
                  <div className="flex items-center gap-1 mt-1.5">
                    {kpi.positive ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${kpi.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {kpi.change}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────
interface AdminDashboardProps {
  onNavigate?: (viewId: string) => void;
  initialView?: string;
}

export function AdminDashboard({ onNavigate, initialView: initial }: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState('6tháng');
  const [activeView, setActiveView] = useState(initial || 'dashboard');
  const [detailModal, setDetailModal] = useState<{
    type: 'brands' | 'campaigns' | 'kols' | 'products' | 'views' | 'engagement' | 'conversion' | 'payments';
    title: string;
  } | null>(null);
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);

  // Sync activeView when initialView prop changes (e.g., sidebar navigation)
  useEffect(() => {
    if (initial) setActiveView(initial);
  }, [initial]);

  // Calculate KPIs from real data
  const totalViews = campaigns.reduce((sum, c) => sum + c.totalViews, 0);
  const totalEngagement = tasks.reduce((sum, t) => {
    if (t.metrics) {
      return sum + (t.metrics.likes || 0) + (t.metrics.comments || 0) + (t.metrics.shares || 0) + (t.metrics.saves || 0);
    }
    return sum;
  }, 0);
  const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews * 100) : 0;

  const pieData = [
    { name: 'Đang chạy', value: campaigns.filter(c => c.status === 'active').length, color: '#3B82F6' },
    { name: 'Theo dõi', value: campaigns.filter(c => c.status === 'tracking').length, color: '#F59E0B' },
    { name: 'Hoàn thành', value: campaigns.filter(c => c.status === 'completed').length, color: '#10B981' },
    { name: 'Bản nháp', value: campaigns.filter(c => c.status === 'draft').length, color: '#6B7280' },
  ];

  const monthlyData = [
    { month: 'T1', views: 320000, engagement: 5.2 },
    { month: 'T2', views: 480000, engagement: 5.8 },
    { month: 'T3', views: 620000, engagement: 6.1 },
    { month: 'T4', views: 850000, engagement: 6.5 },
    { month: 'T5', views: 1200000, engagement: 6.8 },
    { month: 'T6', views: totalViews, engagement: avgEngagementRate.toFixed(1) },
  ];

  // Recent activities
  const recentActivities = workHistory.slice(0, 8);

  // KPI Card data with click handlers and detail data
  const kpiCards = [
    { 
      type: 'brands' as const, label: 'Tổng Brand', value: systemStats.totalBrands, change: '+2', positive: true,
      icon: <Briefcase className="w-5 h-5" />, accent: 'from-purple-500/10 to-purple-600/5',
      data: brands,
      detailTitle: 'Danh sách Brand',
      detailColumns: ['Tên', 'Lĩnh vực', 'Gói', 'Chiến dịch', 'KOL/KOC', 'Trạng thái'],
      detailRender: (b: any) => [b.name, b.industry, b.plan, b.campaignCount.toString(), b.kolCount.toString(), b.status === 'active' ? 'Hoạt động' : 'Tạm khóa'],
      navigateTo: 'brands'
    },
    { 
      type: 'campaigns' as const, label: 'Tổng Chiến dịch', value: campaigns.length, change: '+3', positive: true,
      icon: <Activity className="w-5 h-5" />, accent: 'from-blue-500/10 to-blue-600/5',
      data: campaigns,
      detailTitle: 'Danh sách Chiến dịch',
      detailColumns: ['Tên', 'Brand', 'Sản phẩm', 'Views', 'Trạng thái'],
      detailRender: (c: any) => {
        const brand = brands.find(b => b.id === c.brandId);
        return [c.name, brand?.name || '-', c.productName, c.totalViews.toLocaleString(), campaignStatusLabels[c.status as CampaignStatus]];
      },
      navigateTo: 'campaigns'
    },
    { 
      type: 'kols' as const, label: 'Tổng KOL/KOC', value: systemStats.totalKOLs,
      icon: <Users className="w-5 h-5" />, accent: 'from-pink-500/10 to-pink-600/5',
      data: kols,
      detailTitle: 'Danh sách KOL/KOC',
      detailColumns: ['Tên', 'Brand', 'Nền tảng', 'Followers', 'TL Tương tác', 'Hành động'],
      detailRender: (k: any) => {
        const brand = brands.find(b => b.id === k.brandId);
        return [k.name, brand?.name || '-', k.platform, k.followersDisplay, k.engagementRate + '%', 'Xem profile'];
      },
      onRowClick: (k: KOL) => setSelectedKOL(k),
      navigateTo: 'kolmanagement'
    },
    { 
      type: 'products' as const, label: 'Tổng Sản phẩm', value: systemStats.totalProducts,
      icon: <Package className="w-5 h-5" />, accent: 'from-orange-500/10 to-orange-600/5',
      data: products,
      detailTitle: 'Danh sách Sản phẩm',
      detailColumns: ['Tên', 'Brand', 'Danh mục', 'Giá', 'Trạng thái'],
      detailRender: (p: any) => {
        const brand = brands.find(b => b.id === p.brandId);
        return [p.name, brand?.name || '-', p.category, p.price, p.status === 'active' ? 'Active' : 'Inactive'];
      },
      navigateTo: 'products'
    },
    { 
      type: 'views' as const, label: 'Tổng Lượt xem', value: totalViews >= 1000000 ? (totalViews / 1000000).toFixed(1) + 'M' : (totalViews / 1000).toFixed(0) + 'K', change: '+45%', positive: true,
      icon: <Eye className="w-5 h-5" />, accent: 'from-cyan-500/10 to-cyan-600/5',
      data: campaigns,
      detailTitle: 'Chi tiết Lượt xem theo Chiến dịch',
      detailColumns: ['Chiến dịch', 'Brand', 'Views', 'Mục tiêu', 'Tiến độ'],
      detailRender: (c: any) => {
        const brand = brands.find(b => b.id === c.brandId);
        const progress = Math.round((c.totalViews / c.kpiTarget.views) * 100);
        return [c.name, brand?.name || '-', c.totalViews.toLocaleString(), c.kpiTarget.views.toLocaleString(), progress + '%'];
      },
      navigateTo: 'campaigns'
    },
    { 
      type: 'engagement' as const, label: 'TL Tương tác TB', value: systemStats.avgEngagementRate.toFixed(1) + '%', change: '+0.6%', positive: true,
      icon: <TrendingUp className="w-5 h-5" />, accent: 'from-teal-500/10 to-teal-600/5',
      data: kolRankings,
      detailTitle: 'Bảng xếp hạng Engagement Rate',
      detailColumns: ['Hạng', 'KOL/KOC', 'Nền tảng', 'Views', 'Engagement Rate'],
      detailRender: (k: any) => ['#' + k.rank, k.kolName, k.platform, k.totalViews.toLocaleString(), k.avgEngagementRate + '%'],
      navigateTo: 'ranking'
    },
    { 
      type: 'conversion' as const, label: 'TL Chuyển đổi', value: systemStats.avgConversionRate.toFixed(1) + '%', change: '+0.3%', positive: true,
      icon: <BarChart3 className="w-5 h-5" />, accent: 'from-amber-500/10 to-amber-600/5',
      data: campaignRankings,
      detailTitle: 'Bảng xếp hạng Conversion Rate',
      detailColumns: ['Hạng', 'Chiến dịch', 'Brand', 'Conversions', 'Rate'],
      detailRender: (c: any) => ['#' + c.rank, c.campaignName, c.brandName, c.conversions?.toLocaleString() || '-', c.conversionRate + '%'],
      navigateTo: 'ranking'
    },
    { 
      type: 'payments' as const, label: 'Tổng Thanh toán', value: (systemStats.totalPayment / 1000000000).toFixed(1) + 'B VND',
      icon: <DollarSign className="w-5 h-5" />, accent: 'from-emerald-500/10 to-emerald-600/5',
      data: payments,
      detailTitle: 'Chi tiết Thanh toán',
      detailColumns: ['KOL/KOC', 'Chiến dịch', 'Sản phẩm', 'Số tiền', 'Trạng thái'],
      detailRender: (p: any) => [p.kolName, p.campaignName, p.productName, p.totalAmount.toLocaleString() + ' VND', paymentStatusLabels[p.status as keyof typeof paymentStatusLabels]],
      navigateTo: 'payments'
    },
  ];

  const handleNavigate = (viewId: string) => {
    if (viewId === 'dashboard') {
      setActiveView('dashboard');
    } else {
      onNavigate?.(viewId);
    }
  };

  if (activeView !== 'dashboard') {
    const viewMap: Record<string, React.ReactNode> = {
      brands: <BrandManagement />,
      products: <ProductManagement />,
      campaigns: <CampaignManagement />,
      kolmanagement: <KOLManagement />,
      ranking: <SystemRanking />,
      rankings: <SystemRanking />,
      payments: <PaymentMonitoring />,
      'payments-processing': <PaymentProcessing />,
      'payments-paid': <PaymentPaid />,
      'payments-hold': <PaymentHold />,
      performance: <PerformanceCenter />,
      reports: <ReportCenter />,
      history: <WorkHistory />,
    };
    const content = viewMap[activeView];
    if (content) return <>{content}</>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Tổng quan hệ thống</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Giám sát toàn bộ nền tảng KOLLAB</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="1tháng">1 tháng</option>
            <option value="3tháng">3 tháng</option>
            <option value="6tháng">6 tháng</option>
            <option value="1năm">1 năm</option>
          </select>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Collapsible KPI Sections */}
      <div className="space-y-4">
        {/* Section 1: Tổng quan */}
        <KPISection 
          title="Tổng quan hệ thống" 
          icon={<Briefcase className="w-5 h-5" />}
          items={kpiCards.filter((_, i) => i < 4)}
          onCardClick={(type, title) => setDetailModal({ type: type as any, title })}
          onNavigate={onNavigate}
        />

        {/* Section 2: Hiệu suất */}
        <KPISection 
          title="Hiệu suất" 
          icon={<TrendingUp className="w-5 h-5" />}
          items={kpiCards.filter((_, i) => i >= 4 && i < 7)}
          onCardClick={(type, title) => setDetailModal({ type: type as any, title })}
          onNavigate={onNavigate}
        />

        {/* Section 3: Thanh toán */}
        <KPISection 
          title="Thanh toán" 
          icon={<DollarSign className="w-5 h-5" />}
          items={kpiCards.filter((_, i) => i >= 7)}
          onCardClick={(type, title) => setDetailModal({ type: type as any, title })}
          onNavigate={onNavigate}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Campaign Status Pie Chart */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tình trạng chiến dịch</h3>
            <Badge label={`${campaigns.length} chiến dịch`} colorClass="bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-500">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Performance Line Chart */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lượt xem theo tháng</h3>
            <Award className="w-4 h-4 text-teal-500" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Brands Bar Chart */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Brand theo Views</h3>
            <Briefcase className="w-4 h-4 text-teal-500" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brands.slice(0, 4)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="totalViews" fill="#14B8A6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top KOL/KOC Ranking */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top KOL/KOC</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('ranking')}>Xem tất cả</Button>
          </div>
          <div className="space-y-2">
            {kolRankings.slice(0, 5).map((kol) => (
              <div key={kol.kolId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  kol.rank === 1 ? 'bg-amber-500 text-white' : 
                  kol.rank === 2 ? 'bg-slate-400' : 
                  kol.rank === 3 ? 'bg-amber-700 text-white' : 
                  'bg-slate-100 dark:bg-slate-600'
                }`}>
                  {kol.rank}
                </div>
                <Avatar initials={kol.kolAvatar} size="sm" image={getKolImage(kol.kolAvatar)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{kol.kolName}</p>
                  <p className="text-xs text-slate-500">{kol.platform} • {(kol.totalViews / 1000).toFixed(0)}K views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{kol.score.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">{kol.avgEngagementRate}% ER</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaign Ranking */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Chiến dịch</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('ranking')}>Xem tất cả</Button>
          </div>
          <div className="space-y-2">
            {campaignRankings.slice(0, 5).map((camp) => (
              <div key={camp.campaignId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  camp.rank === 1 ? 'bg-amber-500 text-white' : 
                  camp.rank === 2 ? 'bg-slate-400' : 
                  camp.rank === 3 ? 'bg-amber-700 text-white' : 
                  'bg-slate-100 dark:bg-slate-600'
                }`}>
                  {camp.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{camp.campaignName}</p>
                  <p className="text-xs text-slate-500">{camp.brandName} • {(camp.totalViews / 1000).toFixed(0)}K views</p>
                </div>
                <Badge 
                  label={campaignStatusLabels[camp.status as CampaignStatus]} 
                  colorClass={
                    camp.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                    camp.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                    'bg-slate-100 dark:bg-slate-700'
                  } 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Hoạt động gần đây</h3>
          <Badge label={`${recentActivities.length} sự kiện`} colorClass="bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400" />
        </div>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {recentActivities.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                item.actor === 'admin' ? 'bg-red-500' : 
                item.actor === 'brand' ? 'bg-teal-500' : 
                'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge 
                    label={item.actor === 'admin' ? 'Admin' : item.actor === 'brand' ? 'Brand' : 'KOL/KOC'} 
                    colorClass={
                      item.actor === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                      item.actor === 'brand' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    } 
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.actorName}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.action}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <span className="font-medium text-slate-900 dark:text-white">{item.target}</span>
                  {item.details && <span className="text-slate-500"> - {item.details}</span>}
                </p>
                <p className="text-xs text-slate-400 mt-1">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Detail Modal */}
      <Modal 
        isOpen={!!detailModal} 
        onClose={() => setDetailModal(null)} 
        title={detailModal?.title || ''} 
        width="max-w-4xl"
      >
        {detailModal && (
          <div className="space-y-4">
            {(() => {
              const kpi = kpiCards.find(k => k.type === detailModal.type);
              if (!kpi) return null;
              return (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 border border-blue-200 dark:border-blue-800/40">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">Tổng cộng:</span> {kpi.data.length} mục • 
                      <span className="font-semibold ml-2">Giá trị:</span> {kpi.value}
                    </p>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-700">
                        <tr>
                          {kpi.detailColumns.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80">
                        {kpi.data.slice(0, 20).map((item: any, idx: number) => (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${kpi.onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => kpi.onRowClick?.(item)}
                          >
                            {kpi.detailRender(item).map((val: string, i: number) => (
                              <td key={i} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                {val === 'Xem profile' ? (
                                  <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">{val}</span>
                                ) : val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {kpi.data.length > 20 && (
                    <p className="text-center text-sm text-slate-500 py-2">
                      Hiển thị 20/{kpi.data.length} mục
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* KOL Profile Modal */}
      <Modal isOpen={!!selectedKOL} onClose={() => setSelectedKOL(null)} title="Hồ sơ KOL/KOC" width="max-w-2xl">
        {selectedKOL && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar initials={selectedKOL.avatar} size="xl" image={getKolImage(selectedKOL.avatar)} />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 ${
                  selectedKOL.platform === 'TikTok' ? 'bg-black' :
                  selectedKOL.platform === 'Instagram' ? 'bg-pink-500' :
                  selectedKOL.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    {selectedKOL.platform === 'TikTok' ? '♪' : 
                     selectedKOL.platform === 'Instagram' ? '📷' : 
                     selectedKOL.platform === 'YouTube' ? '▶' : 'f'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedKOL.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">{selectedKOL.handle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={selectedKOL.role} colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" />
                  <Badge label={selectedKOL.platform} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" />
                  <Badge label={selectedKOL.status === 'active' ? 'Đang hoạt động' : selectedKOL.status === 'inactive' ? 'Không hoạt động' : 'Tạm dừng'} 
                    colorClass={selectedKOL.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Người theo dõi</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedKOL.followersDisplay}</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tỷ lệ tương tác</p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{selectedKOL.engagementRate}%</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Lĩnh vực</p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedKOL.niche}</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Giá booking</p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedKOL.bookingPrice.toLocaleString()} VNĐ</p>
              </div>
            </div>

            {selectedKOL.bio && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giới thiệu</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedKOL.bio}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Liên kết mạng xã hội</h4>
              <div className="flex gap-2">
                {selectedKOL.socialLinks.tiktok && (
                  <a href={selectedKOL.socialLinks.tiktok} target="_blank" className="px-3 py-2 bg-black text-white rounded text-sm hover:opacity-80">TikTok</a>
                )}
                {selectedKOL.socialLinks.instagram && (
                  <a href={selectedKOL.socialLinks.instagram} target="_blank" className="px-3 py-2 bg-pink-500 text-white rounded text-sm hover:opacity-80">Instagram</a>
                )}
                {selectedKOL.socialLinks.youtube && (
                  <a href={selectedKOL.socialLinks.youtube} target="_blank" className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:opacity-80">YouTube</a>
                )}
                {selectedKOL.socialLinks.facebook && (
                  <a href={selectedKOL.socialLinks.facebook} target="_blank" className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:opacity-80">Facebook</a>
                )}
              </div>
            </div>

            {selectedKOL.experience && selectedKOL.experience.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kinh nghiệm hợp tác</h4>
                <div className="space-y-2">
                  {selectedKOL.experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50/80 dark:bg-slate-700/50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{exp.campaign}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{exp.brand} • {exp.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < exp.rating ? 'text-amber-400' : 'text-slate-300'}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exp.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Email:</p>
              <p className="text-sm text-slate-900 dark:text-white">{selectedKOL.email}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── BRAND MANAGEMENT ──────────────────────────────────────────────
export function BrandManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [showChangePassModal, setShowChangePassModal] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeBrandTab, setActiveBrandTab] = useState<'campaigns' | 'products' | 'kol' | 'payments' | 'activity'>('campaigns');

  const industries = [...new Set(brands.map(b => b.industry))];

  const filteredBrands = brands.filter(b => {
    const searchMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const industryMatch = filterIndustry === 'all' || b.industry === filterIndustry;
    const statusMatch = filterStatus === 'all' || b.status === filterStatus;
    return searchMatch && industryMatch && statusMatch;
  });

  const selectedBrand = brands.find(b => b.id === showDetailModal);
  const brandCampaigns = campaigns.filter(c => c.brandId === showDetailModal);
  const brandKOLs = kols.filter(k => k.brandId === showDetailModal);
  const brandProducts = products.filter(p => p.brandId === showDetailModal);
  const brandPayments = payments.filter(p => brandCampaigns.some(c => c.id === p.campaignId));

  const handleCreateBrand = () => {
    const username = `brand_${Date.now().toString(36)}`;
    const password = Math.random().toString(36).slice(2, 10) + 'A1!';
    setCreatedCreds({ username, password });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Brand</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo và quản lý tài khoản Brand</p>
        </div>
        <Button onClick={() => { setShowCreateModal(true); setCreatedCreds(null); }}>
          <Plus className="w-4 h-4 mr-2" />Tạo Brand mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm Brand..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
          />
        </div>
        <select 
          value={filterIndustry} 
          onChange={(e) => setFilterIndustry(e.target.value)} 
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
        >
          <option value="all">Tất cả lĩnh vực</option>
          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="suspended">Tạm khóa</option>
        </select>
      </div>

      {/* Brand Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{brands.length}</p>
          <p className="text-xs text-slate-500">Tổng Brand</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{brands.filter(b => b.status === 'active').length}</p>
          <p className="text-xs text-slate-500">Đang hoạt động</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{brands.reduce((s, b) => s + b.campaignCount, 0)}</p>
          <p className="text-xs text-slate-500">Chiến dịch</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{brands.reduce((s, b) => s + b.kolCount, 0)}</p>
          <p className="text-xs text-slate-500">KOL/KOC</p>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lĩnh vực</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gói</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiến dịch</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOL/KOC</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thanh toán</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={brand.name.slice(0, 2)} size="sm" image={getBrandImage(brand.name.slice(0, 2))} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{brand.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{brand.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{brand.industry}</td>
                  <td className="px-6 py-4">
                    <Badge 
                      label={brand.plan} 
                      colorClass={
                        brand.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                        brand.plan === 'Agency' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-slate-100 dark:bg-slate-700'
                      } 
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{brand.campaignCount}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{brand.kolCount}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{brand.productCount}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{brand.totalViews >= 1000000 ? (brand.totalViews / 1000000).toFixed(1) + 'M' : (brand.totalViews / 1000).toFixed(0) + 'K'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">{(brand.totalPayment / 1000000).toFixed(1)}M</td>
                  <td className="px-6 py-4">
                    <Badge 
                      label={brand.status === 'active' ? 'Hoạt động' : 'Tạm khóa'} 
                      colorClass={brand.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setShowDetailModal(brand.id)}><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowChangePassModal(brand.id)}><Lock className="w-4 h-4" /></Button>
                      {brand.status === 'active' ? (
                        <Button size="sm" variant="ghost"><Ban className="w-4 h-4" /></Button>
                      ) : (
                        <Button size="sm" variant="ghost"><CheckCircle2 className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không tìm thấy Brand nào</p>
          </div>
        )}
      </div>

      {/* Create Brand Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setCreatedCreds(null); }} title="Tạo tài khoản Brand mới" width="max-w-xl">
        <div className="space-y-5">
          {!createdCreds ? (
            <>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800/40">
                <p className="text-sm text-blue-700 dark:text-blue-300">Hệ thống sẽ tự động tạo username và password cho Brand mới</p>
              </div>
              {[
                { label: 'Tên công ty *', placeholder: 'VD: Glow Beauty', field: 'company' },
                { label: 'Email quản trị *', placeholder: 'admin@company.vn', field: 'email' },
                { label: 'Số điện thoại', placeholder: '028 xxx xxxx', field: 'phone' },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lĩnh vực *</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="">Chọn lĩnh vực</option>
                  <option>Cosmetics</option><option>Food & Beverage</option><option>Technology</option><option>Fitness</option><option>Fashion</option><option>Travel</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                <Button onClick={handleCreateBrand}><Plus className="w-4 h-4 mr-2" />Tạo tài khoản</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Tài khoản Brand đã tạo thành công!</p>
              </div>
              <div className="p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
                <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">⚠️ Vui lòng lưu lại thông tin đăng nhập. Đây là lần duy nhất hiển thị password.</p>
                <CredentialDisplay username={createdCreds.username} password={createdCreds.password} />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => { setShowCreateModal(false); setCreatedCreds(null); }}>Hoàn tất</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Brand Detail Modal with Tabs */}
      <Modal isOpen={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={selectedBrand ? `Chi tiết: ${selectedBrand.name}` : ''} width="max-w-5xl">
        {selectedBrand && (
          <div className="space-y-6">
            {/* Brand Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl">
              <Avatar initials={selectedBrand.name.slice(0, 2)} size="lg" image={getBrandImage(selectedBrand.name.slice(0, 2))} />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedBrand.name}</h3>
                  <Badge label={selectedBrand.status === 'active' ? 'Hoạt động' : 'Tạm khóa'} colorClass={selectedBrand.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedBrand.email} • {selectedBrand.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={selectedBrand.industry} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" />
                  <Badge label={selectedBrand.plan} colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" />
                  <span className="text-xs text-slate-500">Ngày tạo: {selectedBrand.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm"><Lock className="w-4 h-4 mr-1" />Đổi mật khẩu</Button>
                {selectedBrand.status === 'active' ? (
                  <Button variant="secondary" size="sm"><Ban className="w-4 h-4 mr-1" />Tạm khóa</Button>
                ) : (
                  <Button size="sm"><CheckCircle2 className="w-4 h-4 mr-1" />Kích hoạt</Button>
                )}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBrand.campaignCount}</p>
                <p className="text-xs text-slate-500 mt-1">Tổng Campaign</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{campaigns.filter(c => c.brandId === selectedBrand.id && c.status === 'active').length}</p>
                <p className="text-xs text-slate-500 mt-1">Campaign đang chạy</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{campaigns.filter(c => c.brandId === selectedBrand.id && c.status === 'completed').length}</p>
                <p className="text-xs text-slate-500 mt-1">Hoàn thành</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{selectedBrand.kolCount}</p>
                <p className="text-xs text-slate-500 mt-1">KOL/KOC</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{(selectedBrand.totalPayment / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-slate-500 mt-1">Tổng chi (VND)</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedBrand.totalViews >= 1000000 ? (selectedBrand.totalViews / 1000000).toFixed(1) + 'M' : (selectedBrand.totalViews / 1000).toFixed(0) + 'K'}</p>
                <p className="text-xs text-slate-500 mt-1">Tổng Views</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{selectedBrand.engagementRate}%</p>
                <p className="text-xs text-slate-500 mt-1">TL Tương tác</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60 text-center">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedBrand.conversionRate}%</p>
                <p className="text-xs text-slate-500 mt-1">TL Chuyển đổi</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-100/80">
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-fit">
                {['campaigns', 'products', 'kol', 'payments', 'activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBrandTab(tab as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeBrandTab === tab 
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab === 'campaigns' ? 'Campaigns' : tab === 'products' ? 'Sản phẩm' : tab === 'kol' ? 'KOL/KOC' : tab === 'payments' ? 'Thanh toán' : 'Hoạt động'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeBrandTab === 'campaigns' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Danh sách chiến dịch ({brandCampaigns.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Chiến dịch</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Views</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KPI</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandCampaigns.map(c => {
                        const progress = Math.round((c.totalViews / c.kpiTarget.views) * 100);
                        return (
                          <tr key={c.id} className="border-b border-slate-100/60">
                            <td className="px-4 py-3"><p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p></td>
                            <td className="px-4 py-3 text-sm text-slate-600">{c.productName}</td>
                            <td className="px-4 py-3 text-sm font-medium">{c.totalViews >= 1000000 ? (c.totalViews / 1000000).toFixed(1) + 'M' : (c.totalViews / 1000).toFixed(0) + 'K'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                                </div>
                                <span className="text-xs text-slate-500">{progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><Badge label={campaignStatusLabels[c.status]} colorClass={c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-700'} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeBrandTab === 'products' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Danh sách sản phẩm ({brandProducts.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Danh mục</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Giá</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandProducts.map(p => (
                        <tr key={p.id} className="border-b border-slate-100/60">
                          <td className="px-4 py-3"><p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p></td>
                          <td className="px-4 py-3 text-sm text-slate-600">{p.category}</td>
                          <td className="px-4 py-3 text-sm font-medium">{p.price}</td>
                          <td className="px-4 py-3 text-sm">{p.campaignCount}</td>
                          <td className="px-4 py-3"><Badge label={p.status === 'active' ? 'Active' : 'Inactive'} colorClass={p.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeBrandTab === 'kol' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">KOL/KOC đã tham gia ({brandKOLs.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nền tảng</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Followers</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">TL Tương tác</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandKOLs.map(k => (
                        <tr key={k.id} className="border-b border-slate-100/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar initials={k.avatar} size="sm" image={getKolImage(k.avatar)} />
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{k.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{k.platform}</td>
                          <td className="px-4 py-3 text-sm font-medium">{k.followersDisplay}</td>
                          <td className="px-4 py-3 text-sm font-medium text-teal-600">{k.engagementRate}%</td>
                          <td className="px-4 py-3 text-sm">{tasks.filter(t => t.kolId === k.id).length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeBrandTab === 'payments' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Lịch sử thanh toán ({brandPayments.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Số tiền</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Đã thanh toán</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandPayments.map(p => (
                        <tr key={p.id} className="border-b border-slate-100/60">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{p.kolName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{p.campaignName}</td>
                          <td className="px-4 py-3 text-sm font-medium">{p.totalAmount.toLocaleString()} VND</td>
                          <td className="px-4 py-3 text-sm text-emerald-600">{p.paidAmount.toLocaleString()} VND</td>
                          <td className="px-4 py-3"><Badge label={paymentStatusLabels[p.status]} colorClass={p.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : p.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-700'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeBrandTab === 'activity' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Nhật ký hoạt động</h4>
                <div className="space-y-2">
                  {workHistory.slice(0, 10).map((log, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 surface-subtle">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 dark:text-white"><span className="font-medium">{log.actor}</span> {log.action.toLowerCase()}</p>
                        <p className="text-xs text-slate-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={!!showChangePassModal} onClose={() => setShowChangePassModal(null)} title="Đổi mật khẩu Brand">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Đổi mật khẩu cho: <span className="font-medium text-slate-900 dark:text-white">{brands.find(a => a.id === showChangePassModal)?.name}</span></p>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
            <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Nhập mật khẩu mới" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowChangePassModal(null)}>Hủy</Button>
            <Button onClick={() => setShowChangePassModal(null)}><Lock className="w-4 h-4 mr-2" />Cập nhật mật khẩu</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── CAMPAIGN MANAGEMENT ───────────────────────────────────────────
export function CampaignManagement() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  const filteredCampaigns = campaigns.filter(c => {
    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'all' || c.status === filterStatus;
    const brandMatch = filterBrand === 'all' || c.brandId === filterBrand;
    return searchMatch && statusMatch && brandMatch;
  });

  const selected = campaigns.find(c => c.id === selectedCampaign);
  const campaignTasks = tasks.filter(t => t.campaignId === selectedCampaign);
  const campaignPayments = payments.filter(p => p.campaignId === selectedCampaign);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý chiến dịch</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi tất cả chiến dịch trên hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm chiến dịch..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="active">Đang chạy</option>
          <option value="tracking">Theo dõi</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{campaigns.length}</p>
          <p className="text-xs text-slate-500">Tổng chiến dịch</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{campaigns.filter(c => c.status === 'active').length}</p>
          <p className="text-xs text-slate-500">Đang chạy</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{campaigns.filter(c => c.status === 'tracking').length}</p>
          <p className="text-xs text-slate-500">Đang theo dõi</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{campaigns.filter(c => c.status === 'completed').length}</p>
          <p className="text-xs text-slate-500">Hoàn thành</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{(campaigns.reduce((s, c) => s + c.totalViews, 0) / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-slate-500">Tổng Views</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiến dịch</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOLs</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TL Tương tác</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chuyển đổi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(c => {
                const brand = brands.find(b => b.id === c.brandId);
                const kolCount = tasks.filter(t => t.campaignId === c.id).length;
                return (
                  <tr key={c.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</p>
                        <p className="text-xs text-slate-500">Hạn: {c.deadline}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{brand?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{c.productName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{kolCount}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{c.totalViews >= 1000000 ? (c.totalViews / 1000000).toFixed(1) + 'M' : (c.totalViews / 1000).toFixed(0) + 'K'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">{c.avgEngagementRate}%</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{c.totalConversions}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={campaignStatusLabels[c.status]} 
                        colorClass={
                          c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          c.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          'bg-slate-100 dark:bg-slate-700'
                        } 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedCampaign(c.id); setShowDetail(true); }}><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không tìm thấy chiến dịch nào</p>
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      <Modal isOpen={showDetail && !!selected} onClose={() => setShowDetail(false)} title={selected?.name || ''} width="max-w-4xl">
        {selected && (
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="flex items-center gap-4 p-4 surface-subtle">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    label={campaignStatusLabels[selected.status]} 
                    colorClass={
                      selected.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      selected.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-slate-100 dark:bg-slate-700'
                    } 
                  />
                  <span className="text-sm text-slate-500">• {selected.deadline}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{brands.find(b => b.id === selected.brandId)?.name} • {selected.productName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Mục tiêu</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selected.kpiTarget.views.toLocaleString()} views</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 surface-subtle text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selected.totalViews >= 1000000 ? (selected.totalViews / 1000000).toFixed(1) + 'M' : (selected.totalViews / 1000).toFixed(0) + 'K'}</p>
                <p className="text-xs text-slate-500">Lượt xem</p>
                <p className="text-xs text-teal-600 mt-1">{Math.round(selected.totalViews / selected.kpiTarget.views * 100)}% đạt</p>
              </div>
              <div className="p-4 surface-subtle text-center">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{selected.avgEngagementRate}%</p>
                <p className="text-xs text-slate-500">TL tương tác</p>
                <p className="text-xs text-teal-600 mt-1">{Math.round(selected.avgEngagementRate / selected.kpiTarget.engagementRate * 100)}% đạt</p>
              </div>
              <div className="p-4 surface-subtle text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selected.totalConversions}</p>
                <p className="text-xs text-slate-500">Chuyển đổi</p>
                <p className="text-xs text-teal-600 mt-1">{Math.round(selected.totalConversions / selected.kpiTarget.conversions * 100)}% đạt</p>
              </div>
              <div className="p-4 surface-subtle text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{campaignTasks.length}</p>
                <p className="text-xs text-slate-500">KOL phân công</p>
              </div>
            </div>

            {/* KPI Target */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Mục tiêu KPI</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 surface-subtle">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selected.kpiTarget.views.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Mục tiêu views</p>
                </div>
                <div className="p-3 surface-subtle">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selected.kpiTarget.engagementRate}%</p>
                  <p className="text-xs text-slate-500">Mục tiêu ER</p>
                </div>
                <div className="p-3 surface-subtle">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selected.kpiTarget.conversions}</p>
                  <p className="text-xs text-slate-500">Mục tiêu conversion</p>
                </div>
              </div>
            </div>

            {/* KOL Tasks */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Nhiệm vụ KOL ({campaignTasks.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {campaignTasks.length > 0 ? campaignTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 surface-subtle">
                    <div className="flex items-center gap-2">
                      <Avatar initials={t.kolAvatar} size="sm" image={getKolImage(t.kolAvatar)} />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p>
                        <p className="text-xs text-slate-500">{t.kolPlatform}</p>
                      </div>
                    </div>
                    <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
                  </div>
                )) : <p className="text-sm text-slate-500 text-center py-4">Chưa có nhiệm vụ</p>}
              </div>
            </div>

            {/* Payments */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Thanh toán</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {campaignPayments.length > 0 ? campaignPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 surface-subtle">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{p.kolName}</p>
                      <p className="text-xs text-slate-500">{p.campaignName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.totalAmount.toLocaleString()} VND</p>
                      <Badge label={paymentStatusLabels[p.status]} colorClass={p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500 text-center py-4">Chưa có thanh toán</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── KOL/KOC MANAGEMENT ────────────────────────────────────────────
export function KOLManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const filteredKOLs = kols.filter(k => {
    const textMatch = k.name.toLowerCase().includes(searchTerm.toLowerCase()) || k.handle.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = filterBrand === 'all' || k.brandId === filterBrand;
    const platformMatch = filterPlatform === 'all' || k.platform === filterPlatform;
    return textMatch && brandMatch && platformMatch;
  });

  const selectedKOL = kols.find(k => k.id === showDetail);
  const kolTasks = tasks.filter(t => t.kolId === showDetail);
  const kolPayments = payments.filter(p => kolTasks.some(t => t.id === p.taskId));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý KOL/KOC</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Giám sát và quản lý tất cả KOL/KOC</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm KOL/KOC..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả nền tảng</option>
          <option>TikTok</option><option>Instagram</option><option>YouTube</option><option>Facebook</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kols.length}</p>
          <p className="text-xs text-slate-500">Tổng KOL/KOC</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{kols.filter(k => k.role === 'KOL').length}</p>
          <p className="text-xs text-slate-500">KOL</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{kols.filter(k => k.role === 'KOC').length}</p>
          <p className="text-xs text-slate-500">KOC</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{kols.reduce((s, k) => s + k.followers, 0) >= 1000000 ? (kols.reduce((s, k) => s + k.followers, 0) / 1000000).toFixed(1) + 'M' : (kols.reduce((s, k) => s + k.followers, 0) / 1000).toFixed(0) + 'K'}</p>
          <p className="text-xs text-slate-500">Tổng Followers</p>
        </div>
      </div>

      {/* KOLs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOL/KOC</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nền tảng</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Theo dõi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TL tương tác</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nhiệm vụ</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thứ hạng</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredKOLs.map(kol => {
                const brand = brands.find(b => b.id === kol.brandId);
                const ranking = kolRankings.find(r => r.kolId === kol.id);
                const kolTaskCount = tasks.filter(t => t.kolId === kol.id).length;
                return (
                  <tr key={kol.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={kol.avatar} size="sm" image={getKolImage(kol.avatar)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{kol.name}</p>
                          <p className="text-xs text-slate-500">{kol.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{brand?.name}</td>
                    <td className="px-6 py-4">
                      <Badge label={kol.platform} colorClass="bg-slate-100 dark:bg-slate-700" />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{kol.followersDisplay}</td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">{kol.engagementRate}%</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{kolTaskCount}</td>
                    <td className="px-6 py-4">
                      {ranking ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          ranking.rank === 1 ? 'bg-amber-500 text-white' : 
                          ranking.rank === 2 ? 'bg-slate-400' : 
                          ranking.rank === 3 ? 'bg-amber-700 text-white' : 
                          'bg-slate-100 dark:bg-slate-600'
                        }`}>
                          {ranking.rank}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="ghost" onClick={() => setShowDetail(kol.id)}><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredKOLs.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không tìm thấy KOL/KOC nào</p>
          </div>
        )}
      </div>

      {/* KOL Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={selectedKOL ? selectedKOL.name : ''} width="max-w-4xl">
        {selectedKOL && (
          <div className="space-y-6">
            {/* KOL Header */}
            <div className="flex items-center gap-4 p-4 surface-subtle">
              <Avatar initials={selectedKOL.avatar} size="lg" image={getKolImage(selectedKOL.avatar)} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedKOL.name}</h3>
                <p className="text-sm text-slate-500">{selectedKOL.handle} • {selectedKOL.platform} • {selectedKOL.role}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge label={nicheLabels[selectedKOL.niche] || selectedKOL.niche} colorClass={nicheColors[selectedKOL.niche]} />
                  <Badge label={`${selectedKOL.followersDisplay} followers`} colorClass="bg-slate-100 dark:bg-slate-700" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Niche</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedKOL.niche}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 surface-subtle text-center">
                <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{selectedKOL.engagementRate}%</p>
                <p className="text-xs text-slate-500">TL tương tác</p>
              </div>
              <div className="p-3 surface-subtle text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{kolTasks.length}</p>
                <p className="text-xs text-slate-500">Nhiệm vụ</p>
              </div>
              <div className="p-3 surface-subtle text-center">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{((selectedKOL.totalEarned || 0) / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-slate-500">Đã kiếm (VND)</p>
              </div>
              <div className="p-3 surface-subtle text-center">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{((selectedKOL.pendingPayment || 0) / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-slate-500">Chờ thanh toán</p>
              </div>
            </div>

            {/* Bio */}
            {selectedKOL.bio && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Giới thiệu</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 p-3 surface-subtle">{selectedKOL.bio}</p>
              </div>
            )}

            {/* Social Links */}
            {selectedKOL.socialLinks && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Liên kết mạng xã hội</h4>
                <div className="flex gap-2">
                  {selectedKOL.socialLinks.tiktok && (
                    <a href={selectedKOL.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="px-3 py-2 surface-subtle text-sm text-blue-600 hover:underline">TikTok</a>
                  )}
                  {selectedKOL.socialLinks.instagram && (
                    <a href={selectedKOL.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-3 py-2 surface-subtle text-sm text-pink-600 hover:underline">Instagram</a>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {selectedKOL.experience && selectedKOL.experience.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Kinh nghiệm chiến dịch</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedKOL.experience.map((exp, i) => (
                    <div key={i} className="p-3 surface-subtle">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{exp.campaign}</p>
                        <span className="text-xs text-slate-400">{exp.date}</span>
                      </div>
                      <p className="text-xs text-slate-500">{exp.brand}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{exp.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Nhiệm vụ gần đây ({kolTasks.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {kolTasks.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 surface-subtle">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{t.campaignName}</p>
                      <p className="text-xs text-slate-500">{t.productName}</p>
                    </div>
                    <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />Lịch sử thanh toán
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {kolPayments.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 surface-subtle">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        {p.status === 'paid' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{p.campaignName}</p>
                        <p className="text-xs text-slate-500">{p.productName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">{p.paidAmount.toLocaleString()} VND</p>
                      <p className="text-xs text-slate-500">{p.status === 'paid' ? 'Đã nhận' : 'Đang chờ'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 text-center text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Xem lịch sử đầy đủ
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── PRODUCT MANAGEMENT ────────────────────────────────────────────
export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const textMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = filterBrand === 'all' || p.brandId === filterBrand;
    const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
    return textMatch && brandMatch && categoryMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý sản phẩm</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Giám sát tất cả sản phẩm từ các Brand</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả danh mục</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</p>
          <p className="text-xs text-slate-500">Tổng sản phẩm</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{products.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-slate-500">Đang hoạt động</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
          <p className="text-xs text-slate-500">Danh mục</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{products.reduce((s, p) => s + p.campaignCount, 0)}</p>
          <p className="text-xs text-slate-500">Chiến dịch</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh mục</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiến dịch</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const brand = brands.find(b => b.id === p.brandId);
                return (
                  <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{brand?.name}</td>
                    <td className="px-6 py-4">
                      <Badge label={p.category} colorClass={nicheColors[p.category] || 'bg-slate-100 dark:bg-slate-700'} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{p.price}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{p.campaignCount}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={p.status === 'active' ? 'Active' : 'Inactive'} 
                        colorClass={p.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAYMENT MONITORING ────────────────────────────────────────────
export function PaymentMonitoring({ initialStatus }: { initialStatus?: string }) {
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus || 'all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(p => {
    const statusMatch = filterStatus === 'all' || p.status === filterStatus;
    const brandMatch = filterBrand === 'all' || campaigns.some(c => c.id === p.campaignId && c.brandId === filterBrand);
    const searchMatch = p.kolName.toLowerCase().includes(searchTerm.toLowerCase()) || p.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && brandMatch && searchMatch;
  });

  const totalAmount = payments.reduce((s, p) => s + p.totalAmount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);
  const pendingAmount = payments.filter(p => ['pending', 'partial_paid'].includes(p.status)).reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);

  const getStatusTitle = () => {
    switch (initialStatus) {
      case 'pending': return 'Chờ xử lý';
      case 'paid': return 'Đã thanh toán';
      case 'hold': return 'Tạm giữ';
      default: return 'Giám sát thanh toán';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{getStatusTitle()}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi tất cả thanh toán giữa Brand và KOL/KOC</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4 mr-2" />Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm thanh toán..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="unpaid">Chưa thanh toán</option>
          <option value="pending">Đang chờ</option>
          <option value="partial_paid">Thanh toán một phần</option>
          <option value="paid">Đã thanh toán</option>
          <option value="hold">Tạm giữ</option>
          <option value="rejected">Bị từ chối</option>
        </select>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIWidget label="Tổng thanh toán" value={(totalAmount / 1000000).toFixed(1) + 'M VND'} icon={<DollarSign className="w-5 h-5" />} />
        <KPIWidget label="Đã thanh toán" value={(paidAmount / 1000000).toFixed(1) + 'M VND'} icon={<CheckCircle2 className="w-5 h-5" />} accent="from-emerald-500/10 to-emerald-600/5" />
        <KPIWidget label="Đang chờ" value={(pendingAmount / 1000000).toFixed(1) + 'M VND'} icon={<Clock className="w-5 h-5" />} accent="from-amber-500/10 to-amber-600/5" />
        <KPIWidget label="Số giao dịch" value={payments.length.toString()} icon={<CreditCard className="w-5 h-5" />} accent="from-blue-500/10 to-blue-600/5" />
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOL/KOC</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiến dịch</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số tiền</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã trả</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Còn lại</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => {
                const remaining = p.totalAmount - p.paidAmount;
                return (
                  <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={p.kolAvatar} size="sm" image={getKolImage(p.kolAvatar)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{p.kolName}</p>
                          <p className="text-xs text-slate-500">{p.kolPlatform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{p.campaignName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{p.productName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{p.totalAmount.toLocaleString()} VND</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.paidAmount.toLocaleString()} VND</td>
                    <td className="px-6 py-4 text-sm font-semibold text-amber-600 dark:text-amber-400">{remaining.toLocaleString()} VND</td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={paymentStatusLabels[p.status]} 
                        colorClass={
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          p.status === 'partial_paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          p.status === 'hold' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-slate-100 dark:bg-slate-700'
                        } 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không tìm thấy thanh toán nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAYMENT PROCESSING ─────────────────────────────────────────────────
// Xử lý thanh toán - Danh sách các thanh toán cần xử lý
export function PaymentProcessing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());

  // Lọc chỉ các thanh toán chưa thanh toán đầy đủ
  const processingPayments = payments.filter(p => 
    p.status === 'pending' || p.status === 'partial_paid' || p.status === 'unpaid'
  ).filter(p => {
    const brandMatch = filterBrand === 'all' || campaigns.some(c => c.id === p.campaignId && c.brandId === filterBrand);
    const searchMatch = p.kolName.toLowerCase().includes(searchTerm.toLowerCase()) || p.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
    return brandMatch && searchMatch;
  });

  const totalProcessingAmount = processingPayments.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);
  const pendingCount = processingPayments.filter(p => p.status === 'pending').length;
  const partialCount = processingPayments.filter(p => p.status === 'partial_paid').length;

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedPayments);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPayments(newSet);
  };

  const selectAll = () => {
    if (selectedPayments.size === processingPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(processingPayments.map(p => p.id)));
    }
  };

  const selectedTotal = processingPayments.filter(p => selectedPayments.has(p.id)).reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Xử lý thanh toán</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Duyệt và xử lý các yêu cầu thanh toán từ KOL/KOC</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />Xuất danh sách
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded p-5 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{processingPayments.length}</p>
              <p className="text-xs text-slate-500">Cần xử lý</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-orange-200/60 dark:border-orange-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              <p className="text-xs text-slate-500">Đang chờ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-blue-200/60 dark:border-blue-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{partialCount}</p>
              <p className="text-xs text-slate-500">Một phần</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-teal-200/60 dark:border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{(totalProcessingAmount / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-slate-500">Cần thanh toán</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm KOL, chiến dịch..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
        </div>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Selected Actions */}
      {selectedPayments.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Đã chọn {selectedPayments.size} mục - Tổng: <span className="font-bold">{(selectedTotal / 1000000).toFixed(2)}M VND</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />Thanh toán tất cả
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedPayments(new Set())}>
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="px-4 py-4">
                  <input type="checkbox" checked={selectedPayments.size === processingPayments.length && processingPayments.length > 0} onChange={selectAll} className="w-4 h-4 rounded border-slate-300" />
                </th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">KOL/KOC</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Chiến dịch</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sản phẩm</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tổng tiền</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Đã trả</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Còn lại</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {processingPayments.map(p => {
                const remaining = p.totalAmount - p.paidAmount;
                const brand = campaigns.find(c => c.id === p.campaignId)?.brandId;
                const brandName = brands.find(b => b.id === brand)?.name || 'N/A';
                return (
                  <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedPayments.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={p.kolAvatar} size="sm" image={getKolImage(p.kolAvatar)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{p.kolName}</p>
                          <p className="text-xs text-slate-500">{p.kolPlatform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <p>{p.campaignName}</p>
                      <p className="text-xs text-slate-400">{brandName}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{p.productName}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{p.totalAmount.toLocaleString()} VND</td>
                    <td className="px-4 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.paidAmount.toLocaleString()} VND</td>
                    <td className="px-4 py-4 text-sm font-semibold text-amber-600 dark:text-amber-400">{remaining.toLocaleString()} VND</td>
                    <td className="px-4 py-4">
                      <Badge 
                        label={paymentStatusLabels[p.status]} 
                        colorClass={
                          p.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          p.status === 'partial_paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-slate-100 dark:bg-slate-700'
                        } 
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm">
                          Thanh toán
                        </Button>
                        <Button variant="secondary" size="sm">
                          Tạm giữ
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {processingPayments.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Tất cả thanh toán đã được xử lý!</p>
            <p className="text-sm text-slate-400">Không có yêu cầu thanh toán nào đang chờ</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAYMENT HOLD ──────────────────────────────────────────────────────
// Tạm giữ - Danh sách các thanh toán bị tạm giữ
export function PaymentHold() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');

  // Lọc chỉ các thanh toán bị tạm giữ
  const holdPayments = payments.filter(p => p.status === 'hold').filter(p => {
    const brandMatch = filterBrand === 'all' || campaigns.some(c => c.id === p.campaignId && c.brandId === filterBrand);
    const searchMatch = p.kolName.toLowerCase().includes(searchTerm.toLowerCase()) || p.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
    return brandMatch && searchMatch;
  });

  const totalHoldAmount = holdPayments.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tạm giữ thanh toán</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý các thanh toán bị tạm giữ chờ xác minh</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4 mr-2" />Xuất báo cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded p-5 border border-red-200/60 dark:border-red-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{holdPayments.length}</p>
              <p className="text-xs text-slate-500">Đang tạm giữ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-red-200/60 dark:border-red-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{(totalHoldAmount / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-slate-500">Số tiền tạm giữ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Ban className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{0}</p>
              <p className="text-xs text-slate-500">Khiếu nại</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm KOL, chiến dịch..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
        </div>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded p-4 border border-red-200 dark:border-red-800/40">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Các khoản thanh toán bị tạm giữ</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Thanh toán bị tạm giữ có thể do: khiếu nại từ KOL, xác minh thông tin, hoặc chờ phê duyệt từ Brand. 
              Vui lòng xem xét và giải quyết trước khi tiến hành thanh toán.
            </p>
          </div>
        </div>
      </div>

      {/* Hold Payments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">KOL/KOC</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Chiến dịch</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Brand</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sản phẩm</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tổng tiền</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Lý do tạm giữ</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày tạm giữ</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {holdPayments.map(p => {
                const brand = campaigns.find(c => c.id === p.campaignId)?.brandId;
                const brandName = brands.find(b => b.id === brand)?.name || 'N/A';
                const holdReason = 'Chờ xác minh';
                return (
                  <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={p.kolAvatar} size="sm" image={getKolImage(p.kolAvatar)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{p.kolName}</p>
                          <p className="text-xs text-slate-500">{p.kolPlatform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{p.campaignName}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{brandName}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{p.productName}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{p.totalAmount.toLocaleString()} VND</td>
                    <td className="px-4 py-4">
                      <Badge 
                        label={holdReason} 
                        colorClass="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" 
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{'2026-06-25'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm">
                          Giải phóng
                        </Button>
                        <Button variant="secondary" size="sm">
                          Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {holdPayments.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Không có thanh toán nào bị tạm giữ</p>
            <p className="text-sm text-slate-400">Tất cả thanh toán đang hoạt động bình thường</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAYMENT PAID ──────────────────────────────────────────────────────
// Đã thanh toán - Danh sách các thanh toán đã hoàn tất
export function PaymentPaid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Lọc chỉ các thanh toán đã thanh toán đầy đủ
  const paidPayments = payments.filter(p => p.status === 'paid').filter(p => {
    const brandMatch = filterBrand === 'all' || campaigns.some(c => c.id === p.campaignId && c.brandId === filterBrand);
    const searchMatch = p.kolName.toLowerCase().includes(searchTerm.toLowerCase()) || p.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
    return brandMatch && searchMatch;
  });

  const totalPaidAmount = paidPayments.reduce((s, p) => s + p.totalAmount, 0);
  const thisMonthAmount = paidPayments.slice(0, 3).reduce((s, p) => s + p.totalAmount, 0); // Giả lập tháng này

  // Simulated payment history data
  const paymentHistoryData = [
    { month: '2026-06', amount: thisMonthAmount, count: paidPayments.slice(0, 3).length },
    { month: '2026-05', amount: totalPaidAmount * 0.85, count: Math.floor(paidPayments.length * 0.8) },
    { month: '2026-04', amount: totalPaidAmount * 0.72, count: Math.floor(paidPayments.length * 0.7) },
    { month: '2026-03', amount: totalPaidAmount * 0.65, count: Math.floor(paidPayments.length * 0.6) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đã thanh toán</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Lịch sử các khoản thanh toán đã hoàn tất</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded p-5 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{paidPayments.length}</p>
              <p className="text-xs text-slate-500">Đã thanh toán</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-teal-200/60 dark:border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{(totalPaidAmount / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-slate-500">Tổng VND</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-blue-200/60 dark:border-blue-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{(thisMonthAmount / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-slate-500">Tháng này</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded p-5 border border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{(totalPaidAmount / paidPayments.length / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-slate-500">Trung bình</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card-base p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Xu hướng thanh toán 4 tháng gần nhất</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={paymentHistoryData}>
              <defs>
                <linearGradient id="colorPaidAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: 'white' }}
                formatter={(value: number) => [(value / 1000000).toFixed(1) + 'M VND', 'Số tiền']}
              />
              <Area type="monotone" dataKey="amount" stroke="#10B981" fill="url(#colorPaidAmount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm KOL, chiến dịch..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
        </div>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả tháng</option>
          <option value="2026-06">Tháng 6/2026</option>
          <option value="2026-05">Tháng 5/2026</option>
          <option value="2026-04">Tháng 4/2026</option>
          <option value="2026-03">Tháng 3/2026</option>
        </select>
      </div>

      {/* Success Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-4 border border-emerald-200 dark:border-emerald-800/40">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Thanh toán thành công</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Tất cả {paidPayments.length} khoản thanh toán đã được hoàn tất. Tổng số tiền: {(totalPaidAmount / 1000000).toFixed(2)}M VND
            </p>
          </div>
        </div>
      </div>

      {/* Paid Payments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">KOL/KOC</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Chiến dịch</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Brand</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sản phẩm</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Số tiền</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã GD</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày TT</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paidPayments.map(p => {
                const brand = campaigns.find(c => c.id === p.campaignId)?.brandId;
                const brandName = brands.find(b => b.id === brand)?.name || 'N/A';
                const invoiceId = `INV-${p.id.toUpperCase()}-${p.campaignId.slice(-4).toUpperCase()}`;
                return (
                  <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={p.kolAvatar} size="sm" image={getKolImage(p.kolAvatar)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{p.kolName}</p>
                          <p className="text-xs text-slate-500">{p.kolPlatform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{p.campaignName}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{brandName}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{p.productName}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.totalAmount.toLocaleString()} VND</td>
                    <td className="px-4 py-4 text-xs font-mono text-slate-500">{invoiceId}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">2026-06-{20 + paidPayments.indexOf(p)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                          Xem hóa đơn
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paidPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Chưa có thanh toán nào hoàn tất</p>
            <p className="text-sm text-slate-400">Danh sách sẽ được cập nhật khi có thanh toán hoàn tất</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WORK HISTORY ────────────────────────────────────────────────────
export function WorkHistory() {
  const [activeTab, setActiveTab] = useState<'brand' | 'kol' | 'campaign' | 'payment'>('brand');
  const [searchTerm, setSearchTerm] = useState('');

  // Separate history data by type - EXACT match for each tab
  const brandHistory = workHistory.filter(h => h.targetType === 'brand');
  const kolHistory = workHistory.filter(h => h.targetType === 'kol');
  const campaignHistory = workHistory.filter(h => h.targetType === 'campaign' || h.targetType === 'task');
  const paymentHistory = workHistory.filter(h => h.targetType === 'payment');

  // Get current filtered history based on active tab
  const getCurrentHistory = () => {
    let data: typeof workHistory = [];
    switch (activeTab) {
      case 'brand': data = brandHistory; break;
      case 'kol': data = kolHistory; break;
      case 'campaign': data = campaignHistory; break;
      case 'payment': data = paymentHistory; break;
    }
    if (searchTerm) {
      data = data.filter(h => 
        h.actorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        h.target.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  };

  const currentHistory = getCurrentHistory();

  // Get stats for each tab
  const getTabStats = () => {
    switch (activeTab) {
      case 'brand': return { total: brandHistory.length, icon: Briefcase, color: 'teal' };
      case 'kol': return { total: kolHistory.length, icon: Users, color: 'blue' };
      case 'campaign': return { total: campaignHistory.length, icon: Target, color: 'amber' };
      case 'payment': return { total: paymentHistory.length, icon: CreditCard, color: 'emerald' };
    }
  };

  const tabStats = getTabStats();

  // Render content based on tab type
  const renderActivityItem = (item: typeof workHistory[0]) => {
    return (
      <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
          item.actor === 'admin' ? 'bg-red-500' : 
          item.actor === 'brand' ? 'bg-teal-500' : 
          'bg-blue-500'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              label={item.actor === 'admin' ? 'Admin' : item.actor === 'brand' ? 'Brand' : 'KOL/KOC'} 
              colorClass={
                item.actor === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                item.actor === 'brand' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
              } 
            />
            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.actorName}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{item.action}</span>
            <Badge label={item.targetType} colorClass="bg-slate-100 dark:bg-slate-700" />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
            <span className="font-medium text-slate-900 dark:text-white">{item.target}</span>
            {item.details && <span className="text-slate-500"> - {item.details}</span>}
          </p>
          <p className="text-xs text-slate-400 mt-1">{item.timestamp}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nhật ký Hoạt động</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi hoạt động trên hệ thống</p>
        </div>
        <Button variant="secondary" size="sm">
          <Download className="w-4 h-4 mr-2" />Xuất nhật ký
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-fit">
        <button 
          onClick={() => { setActiveTab('brand'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'brand' ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Briefcase className="w-4 h-4" /> Brand Activity
        </button>
        <button 
          onClick={() => { setActiveTab('kol'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'kol' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Users className="w-4 h-4" /> KOL/KOC Activity
        </button>
        <button 
          onClick={() => { setActiveTab('campaign'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'campaign' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Target className="w-4 h-4" /> Campaign Activity
        </button>
        <button 
          onClick={() => { setActiveTab('payment'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'payment' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <CreditCard className="w-4 h-4" /> Payment Activity
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm hoạt động..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded border ${
          activeTab === 'brand' ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/40' :
          activeTab === 'kol' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40' :
          activeTab === 'campaign' ? 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' :
          'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
        }`}>
          <tabStats.icon className={`w-5 h-5 ${
            activeTab === 'brand' ? 'text-teal-600' :
            activeTab === 'kol' ? 'text-blue-600' :
            activeTab === 'campaign' ? 'text-amber-600' :
            'text-emerald-600'
          }`} />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{tabStats.total} hoạt động</span>
        </div>
      </div>

      {/* Activity List - Each tab shows different data */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="divide-y divide-slate-100/80 max-h-[600px] overflow-y-auto">
          {currentHistory.length > 0 ? currentHistory.map(item => renderActivityItem(item)) : (
            <div className="text-center py-12">
              <tabStats.icon className={`w-12 h-12 mx-auto mb-3 ${
                activeTab === 'brand' ? 'text-teal-200' :
                activeTab === 'kol' ? 'text-blue-200' :
                activeTab === 'campaign' ? 'text-amber-200' :
                'text-emerald-200'
              }`} />
              <p className="text-slate-500">
                {activeTab === 'brand' && 'Chưa có hoạt động nào của Brand'}
                {activeTab === 'kol' && 'Chưa có hoạt động nào của KOL/KOC'}
                {activeTab === 'campaign' && 'Chưa có hoạt động nào của Campaign'}
                {activeTab === 'payment' && 'Chưa có hoạt động thanh toán nào'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SYSTEM RANKING ────────────────────────────────────────────────
export function SystemRanking() {
  const [activeTab, setActiveTab] = useState<'kol' | 'campaign' | 'brand'>('kol');
  const [sortBy, setSortBy] = useState<'score' | 'views' | 'engagement'>('score');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<typeof brands[0] | null>(null);

  const sortedKolRankings = [...kolRankings].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'views') return b.totalViews - a.totalViews;
    return b.avgEngagementRate - a.avgEngagementRate;
  });

  const sortedCampaignRankings = [...campaignRankings].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'views') return b.totalViews - a.totalViews;
    return b.avgEngagementRate - a.avgEngagementRate;
  });

  const sortedBrandRankings = [...brandRankings].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'views') return b.totalViews - a.totalViews;
    return b.avgEngagementRate - a.avgEngagementRate;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Xếp hạng hệ thống</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bảng xếp hạng KOL/KOC, chiến dịch và Brand</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sắp xếp theo:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)} 
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="score">Điểm</option>
            <option value="views">Lượt xem</option>
            <option value="engagement">Tương tác</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('kol')} 
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'kol' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Xếp hạng KOL/KOC
        </button>
        <button 
          onClick={() => setActiveTab('campaign')} 
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'campaign' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Xếp hạng chiến dịch
        </button>
        <button 
          onClick={() => setActiveTab('brand')} 
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'brand' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Xếp hạng Brand
        </button>
      </div>

      {/* KOL Ranking */}
      {activeTab === 'kol' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hạng</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOL/KOC</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nền tảng</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng views</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TL tương tác</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TL chuyển đổi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiến độ</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {sortedKolRankings.map(kol => (
                  <tr key={kol.kolId} className="border-b border-slate-100/60 hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        kol.rank === 1 ? 'bg-amber-500 text-white' : 
                        kol.rank === 2 ? 'bg-slate-400' : 
                        kol.rank === 3 ? 'bg-amber-700 text-white' : 
                        'bg-slate-100 dark:bg-slate-600'
                      }`}>
                        {kol.rank === 1 ? '🥇' : kol.rank === 2 ? '🥈' : kol.rank === 3 ? '🥉' : kol.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          const foundKOL = kols.find(k => k.id === kol.kolId);
                          if (foundKOL) setSelectedKOL(foundKOL);
                        }}
                        className="flex items-center gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Avatar initials={kol.kolAvatar} size="sm" image={getKolImage(kol.kolAvatar)} />
                        <p className="font-medium text-slate-900 dark:text-white">{kol.kolName}</p>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{kol.platform}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{kol.totalViews >= 1000000 ? (kol.totalViews / 1000000).toFixed(1) + 'M' : (kol.totalViews / 1000).toFixed(0) + 'K'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">{kol.avgEngagementRate}%</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{kol.conversionRate}%</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(kol.tasksCompleted / kol.totalTasks) * 100 || 0}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{kol.tasksCompleted}/{kol.totalTasks}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{kol.score.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Ranking */}
      {activeTab === 'campaign' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hạng</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiến dịch</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lượt xem</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TL tương tác</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KPI tiến độ</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {sortedCampaignRankings.map(camp => (
                  <tr key={camp.campaignId} className="border-b border-slate-100/60 hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        camp.rank === 1 ? 'bg-amber-500 text-white' : 
                        camp.rank === 2 ? 'bg-slate-400' : 
                        camp.rank === 3 ? 'bg-amber-700 text-white' : 
                        'bg-slate-100 dark:bg-slate-600'
                      }`}>
                        {camp.rank === 1 ? '🥇' : camp.rank === 2 ? '🥈' : camp.rank === 3 ? '🥉' : camp.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{camp.campaignName}</p>
                        <p className="text-xs text-slate-500">{camp.productName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{camp.brandName}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={campaignStatusLabels[camp.status as CampaignStatus]} 
                        colorClass={
                          camp.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          camp.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-slate-100 dark:bg-slate-700'
                        } 
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{camp.totalViews >= 1000000 ? (camp.totalViews / 1000000).toFixed(1) + 'M' : (camp.totalViews / 1000).toFixed(0) + 'K'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">{camp.avgEngagementRate}%</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${camp.kpiProgress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{camp.kpiProgress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{camp.score.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brand Ranking */}
      {activeTab === 'brand' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hạng</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngành</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiến dịch</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOLs</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lượt xem</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TL tương tác</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {sortedBrandRankings.map(brand => (
                  <tr key={brand.brandId} className="border-b border-slate-100/60 hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        brand.rank === 1 ? 'bg-amber-500 text-white' : 
                        brand.rank === 2 ? 'bg-slate-400' : 
                        brand.rank === 3 ? 'bg-amber-700 text-white' : 
                        'bg-slate-100 dark:bg-slate-600'
                      }`}>
                        {brand.rank === 1 ? '🥇' : brand.rank === 2 ? '🥈' : brand.rank === 3 ? '🥉' : brand.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          const b = brands.find(b => b.id === brand.brandId);
                          if (b) setSelectedBrand(b);
                        }}
                        className="flex items-center gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Avatar initials={brand.brandName.slice(0, 2)} size="sm" image={getBrandImage(brand.brandName.slice(0, 2))} />
                        <p className="font-medium text-slate-900 dark:text-white">{brand.brandName}</p>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{brand.industry}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">{brand.activeCampaigns}</span>
                        <span className="text-slate-400"> / {brand.totalCampaigns} đang chạy</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{brand.totalKOLs}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{brand.totalViews >= 1000000 ? (brand.totalViews / 1000000).toFixed(1) + 'M' : (brand.totalViews / 1000).toFixed(0) + 'K'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">{brand.avgEngagementRate}%</td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{brand.score.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KOL Profile Modal */}
      <Modal isOpen={!!selectedKOL} onClose={() => setSelectedKOL(null)} title="Hồ sơ KOL/KOC" width="max-w-2xl">
        {selectedKOL && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar initials={selectedKOL.avatar} size="xl" image={getKolImage(selectedKOL.avatar)} />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 ${
                  selectedKOL.platform === 'TikTok' ? 'bg-black' :
                  selectedKOL.platform === 'Instagram' ? 'bg-pink-500' :
                  selectedKOL.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    {selectedKOL.platform === 'TikTok' ? '♪' : 
                     selectedKOL.platform === 'Instagram' ? '📷' : 
                     selectedKOL.platform === 'YouTube' ? '▶' : 'f'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedKOL.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">{selectedKOL.handle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={selectedKOL.role} colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" />
                  <Badge label={selectedKOL.platform} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" />
                  <Badge label={selectedKOL.status === 'active' ? 'Đang hoạt động' : selectedKOL.status === 'inactive' ? 'Không hoạt động' : 'Tạm dừng'} 
                    colorClass={selectedKOL.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Người theo dõi</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedKOL.followersDisplay}</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tỷ lệ tương tác</p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{selectedKOL.engagementRate}%</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Lĩnh vực</p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedKOL.niche}</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Giá booking</p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedKOL.bookingPrice.toLocaleString()} VNĐ</p>
              </div>
            </div>

            {selectedKOL.bio && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giới thiệu</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedKOL.bio}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Liên kết mạng xã hội</h4>
              <div className="flex gap-2">
                {selectedKOL.socialLinks.tiktok && (
                  <a href={selectedKOL.socialLinks.tiktok} target="_blank" className="px-3 py-2 bg-black text-white rounded text-sm hover:opacity-80">TikTok</a>
                )}
                {selectedKOL.socialLinks.instagram && (
                  <a href={selectedKOL.socialLinks.instagram} target="_blank" className="px-3 py-2 bg-pink-500 text-white rounded text-sm hover:opacity-80">Instagram</a>
                )}
                {selectedKOL.socialLinks.youtube && (
                  <a href={selectedKOL.socialLinks.youtube} target="_blank" className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:opacity-80">YouTube</a>
                )}
                {selectedKOL.socialLinks.facebook && (
                  <a href={selectedKOL.socialLinks.facebook} target="_blank" className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:opacity-80">Facebook</a>
                )}
              </div>
            </div>

            {selectedKOL.experience && selectedKOL.experience.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kinh nghiệm hợp tác</h4>
                <div className="space-y-2">
                  {selectedKOL.experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50/80 dark:bg-slate-700/50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{exp.campaign}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{exp.brand} • {exp.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < exp.rating ? 'text-amber-400' : 'text-slate-300'}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exp.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Email:</p>
              <p className="text-sm text-slate-900 dark:text-white">{selectedKOL.email}</p>
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />Lịch sử thanh toán
              </h4>
              <div className="space-y-2">
                {[
                  { date: '28/05/2026', campaign: 'Summer Sale 2026', amount: '15,000,000', status: 'paid', method: 'Chuyển khoản' },
                  { date: '15/05/2026', campaign: 'Spring Collection', amount: '12,500,000', status: 'paid', method: 'Chuyển khoản' },
                  { date: '01/05/2026', campaign: 'Tech Review Campaign', amount: '8,000,000', status: 'paid', method: 'Momo' },
                ].map((payment, i) => (
                  <div key={i} className="flex items-center justify-between p-3 surface-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{payment.campaign}</p>
                        <p className="text-xs text-slate-500">{payment.date} • {payment.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">{payment.amount} VND</p>
                      <p className="text-xs text-slate-500">Đã nhận</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 text-center text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Xem lịch sử đầy đủ
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Brand Profile Modal */}
      <Modal isOpen={!!selectedBrand} onClose={() => setSelectedBrand(null)} title="Hồ sơ Brand" width="max-w-2xl">
        {selectedBrand && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <Avatar initials={selectedBrand.name.slice(0, 2)} size="xl" image={getBrandImage(selectedBrand.name.slice(0, 2))} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBrand.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">{selectedBrand.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={selectedBrand.industry} colorClass="bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400" />
                  <Badge label={selectedBrand.plan} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" />
                  <Badge label={selectedBrand.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'} 
                    colorClass={selectedBrand.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="surface-subtle p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Chiến dịch</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBrand.campaignCount}</p>
              </div>
              <div className="surface-subtle p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Sản phẩm</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBrand.productCount}</p>
              </div>
              <div className="surface-subtle p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">KOL/KOC</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBrand.kolCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tổng lượt xem</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedBrand.totalViews >= 1000000 ? (selectedBrand.totalViews / 1000000).toFixed(1) + 'M' : (selectedBrand.totalViews / 1000).toFixed(0) + 'K'}
                </p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tổng thanh toán</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedBrand.totalPayment.toLocaleString()}đ</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">TL tương tác</p>
                <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{selectedBrand.engagementRate}%</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">TL chuyển đổi</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedBrand.conversionRate}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Điện thoại:</p>
              <p className="text-sm text-slate-900 dark:text-white">{selectedBrand.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Ngày tham gia:</p>
              <p className="text-sm text-slate-900 dark:text-white">{selectedBrand.createdAt}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── PERFORMANCE CENTER ──────────────────────────────────────────────
export function PerformanceCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'brand' | 'campaign' | 'kol'>('brand');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchCampaign, setSearchCampaign] = useState('');
  const [searchKOL, setSearchKOL] = useState('');
  const [timeRange, setTimeRange] = useState('6tháng');
  const [brandSortBy, setBrandSortBy] = useState<'views' | 'engagement' | 'conversion' | 'campaigns'>('views');
  const [campaignSortBy, setCampaignSortBy] = useState<'views' | 'engagement' | 'conversion' | 'er'>('views');
  const [kolSortBy, setKolSortBy] = useState<'views' | 'er' | 'tasks' | 'followers'>('views');

  // Calculate KPIs
  const totalViews = campaigns.reduce((s, c) => s + c.totalViews, 0);
  const totalEngagement = tasks.reduce((s, t) => {
    if (t.metrics) return s + (t.metrics.likes || 0) + (t.metrics.comments || 0) + (t.metrics.shares || 0);
    return s;
  }, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.totalConversions, 0);

  // Filtered data
  const filteredCampaigns = selectedBrand !== 'all' 
    ? campaigns.filter(c => c.brandId === selectedBrand) 
    : campaigns;
  
  const filteredViews = filteredCampaigns.reduce((s, c) => s + c.totalViews, 0);
  const filteredConversions = filteredCampaigns.reduce((s, c) => s + c.totalConversions, 0);
  const filteredEngagement = filteredCampaigns.length > 0 
    ? (totalEngagement / filteredCampaigns.length) 
    : 0;

  // Monthly performance data
  const monthlyPerformance = [
    { month: 'T1', views: 320000, engagement: 12000, conversion: 1200 },
    { month: 'T2', views: 480000, engagement: 18000, conversion: 1800 },
    { month: 'T3', views: 620000, engagement: 24000, conversion: 2400 },
    { month: 'T4', views: 850000, engagement: 32000, conversion: 3200 },
    { month: 'T5', views: 1200000, engagement: 45000, conversion: 4500 },
    { month: 'T6', views: totalViews, engagement: totalEngagement, conversion: totalConversions },
  ];

  // Top performers
  const topBrands = [...brands].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
  const topCampaigns = [...campaigns].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
  const topKOLs = [...kolRankings].sort((a, b) => b.score - a.score).slice(0, 5);

  // Brand performance data with detailed metrics
  const brandPerformanceData = brands
    .filter(b => searchBrand === '' || b.name.toLowerCase().includes(searchBrand.toLowerCase()))
    .map(brand => {
      const bCampaigns = campaigns.filter(c => c.brandId === brand.id);
      const bTasks = tasks.filter(t => bCampaigns.some(c => c.id === t.campaignId));
      const bPayments = payments.filter(p => bCampaigns.some(c => c.id === p.campaignId));
      const bViews = bCampaigns.reduce((s, c) => s + c.totalViews, 0);
      const bLikes = bTasks.reduce((s, t) => s + (t.metrics?.likes || 0), 0);
      const bComments = bTasks.reduce((s, t) => s + (t.metrics?.comments || 0), 0);
      const bShares = bTasks.reduce((s, t) => s + (t.metrics?.shares || 0), 0);
      const bConversions = bCampaigns.reduce((s, c) => s + c.totalConversions, 0);
      const bCompletedTasks = bTasks.filter(t => t.status === 'completed').length;
      const bPaidAmount = bPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.paidAmount, 0);
      return {
        ...brand,
        campaigns: bCampaigns.length,
        views: bViews,
        likes: bLikes,
        comments: bComments,
        shares: bShares,
        engagement: bLikes + bComments + bShares,
        conversions: bConversions,
        conversionRate: bViews > 0 ? (bConversions / bViews * 100) : 0,
        er: bViews > 0 ? ((bLikes + bComments + bShares) / bViews * 100) : 0,
        tasks: bTasks.length,
        completedTasks: bCompletedTasks,
        taskCompletionRate: bTasks.length > 0 ? (bCompletedTasks / bTasks.length * 100) : 0,
        paidAmount: bPaidAmount,
        avgViewsPerCampaign: bCampaigns.length > 0 ? bViews / bCampaigns.length : 0,
      };
    })
    .sort((a, b) => {
      switch (brandSortBy) {
        case 'views': return b.views - a.views;
        case 'engagement': return b.engagement - a.engagement;
        case 'conversion': return b.conversions - a.conversions;
        case 'campaigns': return b.campaigns - a.campaigns;
        default: return 0;
      }
    });

  // Campaign performance data with detailed metrics
  const campaignPerformanceData = filteredCampaigns
    .filter(c => searchCampaign === '' || c.name.toLowerCase().includes(searchCampaign.toLowerCase()))
    .map(camp => {
      const brand = brands.find(b => b.id === camp.brandId);
      const cTasks = tasks.filter(t => t.campaignId === camp.id);
      const cKOLs = [...new Set(cTasks.map(t => t.kolId))];
      const cLikes = cTasks.reduce((s, t) => s + (t.metrics?.likes || 0), 0);
      const cComments = cTasks.reduce((s, t) => s + (t.metrics?.comments || 0), 0);
      const cShares = cTasks.reduce((s, t) => s + (t.metrics?.shares || 0), 0);
      const cCompletedTasks = cTasks.filter(t => t.status === 'completed').length;
      const kpiProgress = Math.round((camp.totalViews / camp.kpiTarget.views) * 100);
      return {
        ...camp,
        brandName: brand?.name || 'N/A',
        kolCount: cKOLs.length,
        views: camp.totalViews,
        likes: cLikes,
        comments: cComments,
        shares: cShares,
        engagement: cLikes + cComments + cShares,
        er: camp.avgEngagementRate,
        viewsPerTask: cCompletedTasks > 0 ? camp.totalViews / cCompletedTasks : 0,
        kpiProgress,
        kpiER: camp.kpiTarget.engagementRate,
        completedTasks: cCompletedTasks,
        totalTasks: cTasks.length,
        taskCompletionRate: cTasks.length > 0 ? (cCompletedTasks / cTasks.length * 100) : 0,
      };
    })
    .sort((a, b) => {
      switch (campaignSortBy) {
        case 'views': return b.views - a.views;
        case 'engagement': return b.engagement - a.engagement;
        case 'conversion': return b.kpiProgress - a.kpiProgress;
        case 'er': return b.er - a.er;
        default: return 0;
      }
    });

  // KOL performance data with detailed metrics
  const kolPerformanceData = kols
    .filter(k => searchKOL === '' || k.name.toLowerCase().includes(searchKOL.toLowerCase()))
    .map(kol => {
      const kTasks = tasks.filter(t => t.kolId === kol.id);
      const kCampaigns = [...new Set(kTasks.map(t => t.campaignId))];
      const kBrands = [...new Set(campaigns.filter(c => kCampaigns.includes(c.id)).map(c => c.brandId))];
      const kLikes = kTasks.reduce((s, t) => s + (t.metrics?.likes || 0), 0);
      const kComments = kTasks.reduce((s, t) => s + (t.metrics?.comments || 0), 0);
      const kShares = kTasks.reduce((s, t) => s + (t.metrics?.shares || 0), 0);
      const kViews = kTasks.reduce((s, t) => s + (t.metrics?.views || 0), 0);
      const kCompletedTasks = kTasks.filter(t => t.status === 'completed').length;
      const kRank = kolRankings.find(r => r.kolId === kol.id);
      const avgViewsPerTask = kCompletedTasks > 0 ? kViews / kCompletedTasks : 0;
      const avgER = kViews > 0 ? ((kLikes + kComments + kShares) / kViews * 100) : 0;
      const consistencyScore = kRank ? (kRank.tasksCompleted / kRank.totalTasks * 100) : 0;
      return {
        ...kol,
        tasks: kTasks.length,
        completedTasks: kCompletedTasks,
        taskCompletionRate: kTasks.length > 0 ? (kCompletedTasks / kTasks.length * 100) : 0,
        campaigns: kCampaigns.length,
        brands: kBrands.length,
        views: kViews,
        likes: kLikes,
        comments: kComments,
        shares: kShares,
        engagement: kLikes + kComments + kShares,
        er: avgER,
        avgViewsPerTask,
        totalViews: kRank?.totalViews || 0,
        avgEngagementRate: kRank?.avgEngagementRate || 0,
        score: kRank?.score || 0,
        consistencyScore,
        conversionRate: kRank?.conversionRate || 0,
      };
    })
    .sort((a, b) => {
      switch (kolSortBy) {
        case 'views': return b.views - a.views;
        case 'er': return b.er - a.er;
        case 'tasks': return b.completedTasks - a.completedTasks;
        case 'followers': return b.followers - a.followers;
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trung tâm Hiệu suất</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi hiệu suất chi tiết theo Brand, Campaign và KOL</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
            <option value="all">Tất cả Brand</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
            <option value="1tháng">1 tháng</option>
            <option value="3tháng">3 tháng</option>
            <option value="6tháng">6 tháng</option>
            <option value="1năm">1 năm</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-fit">
        {['overview', 'brand', 'campaign', 'kol'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab 
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'overview' ? 'Tổng quan' : tab === 'brand' ? 'Theo Brand' : tab === 'campaign' ? 'Theo Campaign' : 'Theo KOL'}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {filteredViews >= 1000000 ? (filteredViews / 1000000).toFixed(1) + 'M' : (filteredViews / 1000).toFixed(0) + 'K'}
              </p>
              <p className="text-sm text-slate-500 mt-1">Tổng lượt xem</p>
            </div>
            <div className="card-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredEngagement.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Tổng tương tác</p>
            </div>
            <div className="card-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredConversions.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Tổng chuyển đổi</p>
            </div>
            <div className="card-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{(totalViews > 0 ? (filteredConversions / filteredViews * 100) : 0).toFixed(2)}%</p>
              <p className="text-sm text-slate-500 mt-1">TL Chuyển đổi</p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="card-base p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Biểu đồ hiệu suất</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyPerformance}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Views" />
                  <Area type="monotone" dataKey="engagement" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.1} name="Engagement" />
                  <Area type="monotone" dataKey="conversion" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} name="Conversion" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top Brands */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Brand</h3>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="space-y-3">
                {topBrands.map((brand, idx) => (
                  <div key={brand.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <Avatar initials={brand.name.slice(0, 2)} size="sm" image={getBrandImage(brand.name.slice(0, 2))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{brand.name}</p>
                      <p className="text-xs text-slate-500">{brand.totalViews >= 1000000 ? (brand.totalViews / 1000000).toFixed(1) + 'M' : (brand.totalViews / 1000).toFixed(0) + 'K'} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Campaigns */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Campaign</h3>
                <Activity className="w-4 h-4 text-teal-500" />
              </div>
              <div className="space-y-3">
                {topCampaigns.map((camp, idx) => (
                  <div key={camp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{camp.name}</p>
                      <p className="text-xs text-slate-500">{camp.totalViews >= 1000000 ? (camp.totalViews / 1000000).toFixed(1) + 'M' : (camp.totalViews / 1000).toFixed(0) + 'K'} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top KOLs */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top KOL/KOC</h3>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-3">
                {topKOLs.map((kol, idx) => (
                  <div key={kol.kolId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <Avatar initials={kol.kolAvatar} size="sm" image={getKolImage(kol.kolAvatar)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{kol.kolName}</p>
                      <p className="text-xs text-slate-500">{kol.avgEngagementRate}% ER</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Brand Performance - DETAILED */}
      {activeTab === 'brand' && (
        <>
          {/* Search and Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm Brand..." value={searchBrand} onChange={e => setSearchBrand(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <select value={brandSortBy} onChange={e => setBrandSortBy(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
              <option value="views">Sắp xếp: Views</option>
              <option value="engagement">Sắp xếp: Tương tác</option>
              <option value="conversion">Sắp xếp: Chuyển đổi</option>
              <option value="campaigns">Sắp xếp: Campaigns</option>
            </select>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white rounded p-4 border border-blue-200/40 dark:border-blue-800/40">
              <p className="text-2xl font-bold text-blue-600">{brandPerformanceData.length}</p>
              <p className="text-xs text-slate-500">Brand</p>
            </div>
            <div className="bg-white rounded p-4 border border-purple-200/40 dark:border-purple-800/40">
              <p className="text-2xl font-bold text-purple-600">{brandPerformanceData.reduce((s, b) => s + b.campaigns, 0)}</p>
              <p className="text-xs text-slate-500">Campaigns</p>
            </div>
            <div className="bg-white rounded p-4 border border-cyan-200/40 dark:border-cyan-800/40">
              <p className="text-2xl font-bold text-cyan-600">{brandPerformanceData.reduce((s, b) => s + b.views, 0) >= 1000000 ? (brandPerformanceData.reduce((s, b) => s + b.views, 0) / 1000000).toFixed(1) + 'M' : (brandPerformanceData.reduce((s, b) => s + b.views, 0) / 1000).toFixed(0) + 'K'}</p>
              <p className="text-xs text-slate-500">Tổng Views</p>
            </div>
            <div className="bg-white rounded p-4 border border-teal-200/40 dark:border-teal-800/40">
              <p className="text-2xl font-bold text-teal-600">{brandPerformanceData.reduce((s, b) => s + b.engagement, 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">Tổng Tương tác</p>
            </div>
            <div className="bg-white rounded p-4 border border-amber-200/40 dark:border-amber-800/40">
              <p className="text-2xl font-bold text-amber-600">{brandPerformanceData.reduce((s, b) => s + b.conversions, 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">Tổng Chuyển đổi</p>
            </div>
            <div className="bg-white rounded p-4 border border-emerald-200/40 dark:border-emerald-800/40">
              <p className="text-2xl font-bold text-emerald-600">{(totalViews > 0 ? (brandPerformanceData.reduce((s, b) => s + b.conversions, 0) / brandPerformanceData.reduce((s, b) => s + b.views, 0) * 100) : 0).toFixed(2)}%</p>
              <p className="text-xs text-slate-500">TL Chuyển đổi</p>
            </div>
          </div>

          {/* Detailed Brand Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px]">
                <thead>
                  <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase w-52">Brand</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Campaigns</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Tasks</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views Chart</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Likes</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Comments</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Shares</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Engagement</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">ER %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Chuyển đổi</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">TL CV %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Task Complete %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Đã thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {brandPerformanceData.map(brand => {
                    // Generate mini chart data for this brand
                    const brandChartData = [
                      { name: 'T1', views: Math.round(brand.views * 0.12), engagement: Math.round(brand.engagement * 0.12), conversion: Math.round(brand.conversions * 0.12) },
                      { name: 'T2', views: Math.round(brand.views * 0.18), engagement: Math.round(brand.engagement * 0.18), conversion: Math.round(brand.conversions * 0.18) },
                      { name: 'T3', views: Math.round(brand.views * 0.25), engagement: Math.round(brand.engagement * 0.25), conversion: Math.round(brand.conversions * 0.25) },
                      { name: 'T4', views: Math.round(brand.views * 0.38), engagement: Math.round(brand.engagement * 0.38), conversion: Math.round(brand.conversions * 0.38) },
                      { name: 'T5', views: Math.round(brand.views * 0.55), engagement: Math.round(brand.engagement * 0.55), conversion: Math.round(brand.conversions * 0.55) },
                      { name: 'T6', views: brand.views, engagement: brand.engagement, conversion: brand.conversions },
                    ];
                    const brandEngagementBreakdown = [
                      { name: 'Likes', value: brand.likes, color: '#EC4899' },
                      { name: 'Comments', value: brand.comments, color: '#3B82F6' },
                      { name: 'Shares', value: brand.shares, color: '#8B5CF6' },
                    ];
                    return (
                      <tr key={brand.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={brand.name.slice(0, 2)} size="sm" image={getBrandImage(brand.name.slice(0, 2))} />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{brand.name}</p>
                              <p className="text-xs text-slate-500">{brand.industry}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">{brand.campaigns}</td>
                        <td className="px-4 py-4 text-sm">{brand.tasks} <span className="text-slate-400">({brand.completedTasks} done)</span></td>
                        <td className="px-4 py-4 text-sm font-bold">{brand.views >= 1000000 ? (brand.views / 1000000).toFixed(1) + 'M' : (brand.views / 1000).toFixed(0) + 'K'}</td>
                        <td className="px-4 py-4">
                          <div className="h-12 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={brandChartData}>
                                <defs>
                                  <linearGradient id={`brandGrad-${brand.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="views" stroke="#3B82F6" fill={`url(#brandGrad-${brand.id})`} strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-pink-600">{brand.likes.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-blue-600">{brand.comments.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-violet-600">{brand.shares.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={brandEngagementBreakdown} cx="50%" cy="50%" innerRadius={12} outerRadius={18} dataKey="value" strokeWidth={0}>
                                    {brandEngagementBreakdown.map((entry, i) => (
                                      <Cell key={i} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <span className="text-sm font-medium text-teal-600">{brand.engagement.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-teal-600">{brand.er.toFixed(2)}%</td>
                        <td className="px-4 py-4 text-sm font-medium text-amber-600">{brand.conversions.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm font-bold text-emerald-600">{brand.conversionRate.toFixed(2)}%</td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${brand.taskCompletionRate >= 80 ? 'bg-emerald-500' : brand.taskCompletionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${brand.taskCompletionRate}%` }} />
                            </div>
                            <span className="text-xs font-medium">{brand.taskCompletionRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-emerald-600">{(brand.paidAmount / 1000000).toFixed(1)}M</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Campaign Performance - DETAILED */}
      {activeTab === 'campaign' && (
        <>
          {/* Search and Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm Campaign..." value={searchCampaign} onChange={e => setSearchCampaign(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
              <option value="all">Tất cả</option>
              {filteredCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={campaignSortBy} onChange={e => setCampaignSortBy(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
              <option value="views">Sắp xếp: Views</option>
              <option value="engagement">Sắp xếp: Tương tác</option>
              <option value="conversion">Sắp xếp: KPI Progress</option>
              <option value="er">Sắp xếp: ER</option>
            </select>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white rounded p-4 border border-blue-200/40 dark:border-blue-800/40">
              <p className="text-2xl font-bold text-blue-600">{campaignPerformanceData.length}</p>
              <p className="text-xs text-slate-500">Campaigns</p>
            </div>
            <div className="bg-white rounded p-4 border border-purple-200/40 dark:border-purple-800/40">
              <p className="text-2xl font-bold text-purple-600">{campaignPerformanceData.reduce((s, c) => s + c.kolCount, 0)}</p>
              <p className="text-xs text-slate-500">KOLs</p>
            </div>
            <div className="bg-white rounded p-4 border border-cyan-200/40 dark:border-cyan-800/40">
              <p className="text-2xl font-bold text-cyan-600">{campaignPerformanceData.reduce((s, c) => s + c.views, 0) >= 1000000 ? (campaignPerformanceData.reduce((s, c) => s + c.views, 0) / 1000000).toFixed(1) + 'M' : (campaignPerformanceData.reduce((s, c) => s + c.views, 0) / 1000).toFixed(0) + 'K'}</p>
              <p className="text-xs text-slate-500">Tổng Views</p>
            </div>
            <div className="bg-white rounded p-4 border border-teal-200/40 dark:border-teal-800/40">
              <p className="text-2xl font-bold text-teal-600">{campaignPerformanceData.reduce((s, c) => s + c.engagement, 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">Tổng Tương tác</p>
            </div>
            <div className="bg-white rounded p-4 border border-pink-200/40 dark:border-pink-800/40">
              <p className="text-2xl font-bold text-pink-600">{campaignPerformanceData.reduce((s, c) => s + c.comments, 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">Comments</p>
            </div>
            <div className="bg-white rounded p-4 border border-amber-200/40 dark:border-amber-800/40">
              <p className="text-2xl font-bold text-amber-600">{campaignPerformanceData.reduce((s, c) => s + c.viewsPerTask, 0) >= 1000 ? (campaignPerformanceData.reduce((s, c) => s + c.viewsPerTask, 0) / campaignPerformanceData.length / 1000).toFixed(1) + 'K' : Math.round(campaignPerformanceData.reduce((s, c) => s + c.viewsPerTask, 0) / campaignPerformanceData.length)}</p>
              <p className="text-xs text-slate-500">Avg Views/Task</p>
            </div>
          </div>

          {/* Detailed Campaign Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1800px]">
                <thead>
                  <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase w-52">Campaign</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Brand</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">KOLs</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Tasks</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views Chart</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Likes</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Comments</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Shares</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Engagement</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">ER %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">KPI Progress</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views/Task</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Task Complete %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformanceData.map(camp => {
                    // Generate mini chart data for this campaign
                    const campaignChartData = [
                      { name: 'T1', views: Math.round(camp.views * 0.12), engagement: Math.round(camp.engagement * 0.12) },
                      { name: 'T2', views: Math.round(camp.views * 0.18), engagement: Math.round(camp.engagement * 0.18) },
                      { name: 'T3', views: Math.round(camp.views * 0.25), engagement: Math.round(camp.engagement * 0.25) },
                      { name: 'T4', views: Math.round(camp.views * 0.38), engagement: Math.round(camp.engagement * 0.38) },
                      { name: 'T5', views: Math.round(camp.views * 0.55), engagement: Math.round(camp.engagement * 0.55) },
                      { name: 'T6', views: camp.views, engagement: camp.engagement },
                    ];
                    const campaignEngagementBreakdown = [
                      { name: 'Likes', value: camp.likes, color: '#EC4899' },
                      { name: 'Comments', value: camp.comments, color: '#3B82F6' },
                      { name: 'Shares', value: camp.shares, color: '#8B5CF6' },
                    ];
                    return (
                      <tr key={camp.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{camp.name}</p>
                            <p className="text-xs text-slate-500">{camp.productName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">{camp.brandName}</td>
                        <td className="px-4 py-4 text-sm font-medium">{camp.kolCount}</td>
                        <td className="px-4 py-4 text-sm">{camp.totalTasks} <span className="text-slate-400">({camp.completedTasks} done)</span></td>
                        <td className="px-4 py-4 text-sm font-bold">{camp.views >= 1000000 ? (camp.views / 1000000).toFixed(1) + 'M' : (camp.views / 1000).toFixed(0) + 'K'}</td>
                        <td className="px-4 py-4">
                          <div className="h-12 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={campaignChartData}>
                                <defs>
                                  <linearGradient id={`campGrad-${camp.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="views" stroke="#14B8A6" fill={`url(#campGrad-${camp.id})`} strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-pink-600">{camp.likes.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-blue-600">{camp.comments.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-violet-600">{camp.shares.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={campaignEngagementBreakdown} cx="50%" cy="50%" innerRadius={12} outerRadius={18} dataKey="value" strokeWidth={0}>
                                    {campaignEngagementBreakdown.map((entry, i) => (
                                      <Cell key={i} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <span className="text-sm font-medium text-teal-600">{camp.engagement.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-teal-600">{camp.er}%</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${camp.kpiProgress >= 100 ? 'bg-emerald-500' : camp.kpiProgress >= 80 ? 'bg-teal-500' : camp.kpiProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(camp.kpiProgress, 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium">{camp.kpiProgress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">{camp.viewsPerTask >= 1000 ? (camp.viewsPerTask / 1000).toFixed(1) + 'K' : Math.round(camp.viewsPerTask)}</td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${camp.taskCompletionRate >= 80 ? 'bg-emerald-500' : camp.taskCompletionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${camp.taskCompletionRate}%` }} />
                            </div>
                            <span className="text-xs font-medium">{camp.taskCompletionRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge label={campaignStatusLabels[camp.status]} colorClass={camp.status === 'active' ? 'bg-blue-100 text-blue-800' : camp.status === 'tracking' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* KOL Performance - DETAILED */}
      {activeTab === 'kol' && (
        <>
          {/* Search and Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm KOL..." value={searchKOL} onChange={e => setSearchKOL(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <select value={kolSortBy} onChange={e => setKolSortBy(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
              <option value="views">Sắp xếp: Views</option>
              <option value="er">Sắp xếp: ER</option>
              <option value="tasks">Sắp xếp: Tasks</option>
              <option value="followers">Sắp xếp: Followers</option>
            </select>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white rounded p-4 border border-blue-200/40 dark:border-blue-800/40">
              <p className="text-2xl font-bold text-blue-600">{kolPerformanceData.length}</p>
              <p className="text-xs text-slate-500">KOLs</p>
            </div>
            <div className="bg-white rounded p-4 border border-purple-200/40 dark:border-purple-800/40">
              <p className="text-2xl font-bold text-purple-600">{kolPerformanceData.reduce((s, k) => s + k.campaigns, 0)}</p>
              <p className="text-xs text-slate-500">Campaigns</p>
            </div>
            <div className="bg-white rounded p-4 border border-cyan-200/40 dark:border-cyan-800/40">
              <p className="text-2xl font-bold text-cyan-600">{kolPerformanceData.reduce((s, k) => s + k.views, 0) >= 1000000 ? (kolPerformanceData.reduce((s, k) => s + k.views, 0) / 1000000).toFixed(1) + 'M' : (kolPerformanceData.reduce((s, k) => s + k.views, 0) / 1000).toFixed(0) + 'K'}</p>
              <p className="text-xs text-slate-500">Tổng Views</p>
            </div>
            <div className="bg-white rounded p-4 border border-teal-200/40 dark:border-teal-800/40">
              <p className="text-2xl font-bold text-teal-600">{kolPerformanceData.reduce((s, k) => s + k.engagement, 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">Tổng Tương tác</p>
            </div>
            <div className="bg-white rounded p-4 border border-pink-200/40 dark:border-pink-800/40">
              <p className="text-2xl font-bold text-pink-600">{kolPerformanceData.reduce((s, k) => s + k.comments, 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">Comments</p>
            </div>
            <div className="bg-white rounded p-4 border border-amber-200/40 dark:border-amber-800/40">
              <p className="text-2xl font-bold text-amber-600">{kolPerformanceData.reduce((s, k) => s + k.completedTasks, 0)}</p>
              <p className="text-xs text-slate-500">Tasks Done</p>
            </div>
          </div>

          {/* Detailed KOL Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1700px]">
                <thead>
                  <tr className="border-b border-slate-100/80 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Platform</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Followers</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Campaigns</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Tasks</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Likes</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Comments</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Shares</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Engagement</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">ER %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Views/Task</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Task Complete %</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Score</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Consistency</th>
                  </tr>
                </thead>
                <tbody>
                  {kolPerformanceData.map(kol => (
                    <tr key={kol.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={kol.avatar} size="sm" image={getKolImage(kol.avatar)} />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{kol.name}</p>
                            <p className="text-xs text-slate-500">{kol.niche}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          kol.platform === 'TikTok' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/40' :
                          kol.platform === 'YouTube' ? 'bg-red-100 text-red-800 dark:bg-red-900/40' :
                          kol.platform === 'Instagram' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/40'
                        }`}>{kol.platform}</span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">{kol.followersDisplay}</td>
                      <td className="px-4 py-4 text-sm">{kol.campaigns}</td>
                      <td className="px-4 py-4 text-sm">{kol.tasks} <span className="text-slate-400">({kol.completedTasks} done)</span></td>
                      <td className="px-4 py-4 text-sm font-bold">{kol.views >= 1000000 ? (kol.views / 1000000).toFixed(1) + 'M' : (kol.views / 1000).toFixed(0) + 'K'}</td>
                      <td className="px-4 py-4 text-sm text-pink-600">{kol.likes.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-blue-600">{kol.comments.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-violet-600">{kol.shares.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-medium text-teal-600">{kol.engagement.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-bold text-teal-600">{kol.er.toFixed(2)}%</td>
                      <td className="px-4 py-4 text-sm">{kol.avgViewsPerTask >= 1000 ? (kol.avgViewsPerTask / 1000).toFixed(1) + 'K' : Math.round(kol.avgViewsPerTask)}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${kol.taskCompletionRate >= 80 ? 'bg-emerald-500' : kol.taskCompletionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${kol.taskCompletionRate}%` }} />
                          </div>
                          <span className="text-xs font-medium">{kol.taskCompletionRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-amber-600">{kol.score.toFixed(1)}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${kol.consistencyScore}%` }} />
                          </div>
                          <span className="text-xs font-medium">{kol.consistencyScore.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── REPORT CENTER ──────────────────────────────────────────────────
export function ReportCenter() {
  const [reportType, setReportType] = useState<'system' | 'brand' | 'campaign' | 'kol'>('system');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedKOL, setSelectedKOL] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-06-02' });
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Get filtered data based on selections
  const selectedBrandData = selectedBrand !== 'all' ? brands.find(b => b.id === selectedBrand) : null;
  const selectedCampaignData = selectedCampaign !== 'all' ? campaigns.find(c => c.id === selectedCampaign) : null;
  const selectedKOLData = selectedKOL !== 'all' ? kols.find(k => k.id === selectedKOL) : null;

  // Brand-specific metrics
  const brandMetrics = selectedBrandData ? {
    campaigns: campaigns.filter(c => c.brandId === selectedBrand),
    tasks: tasks.filter(t => campaigns.filter(c => c.brandId === selectedBrand).some(c => c.id === t.campaignId)),
    totalViews: campaigns.filter(c => c.brandId === selectedBrand).reduce((s, c) => s + c.totalViews, 0),
    totalEngagement: tasks.filter(t => campaigns.filter(c => c.brandId === selectedBrand).some(c => c.id === t.campaignId)).reduce((s, t) => s + (t.metrics?.likes || 0) + (t.metrics?.comments || 0), 0),
    totalConversions: campaigns.filter(c => c.brandId === selectedBrand).reduce((s, c) => s + c.totalConversions, 0),
    avgER: campaigns.filter(c => c.brandId === selectedBrand).reduce((s, c) => s + c.avgEngagementRate, 0) / Math.max(campaigns.filter(c => c.brandId === selectedBrand).length, 1),
  } : null;

  // Campaign-specific metrics
  const campaignMetrics = selectedCampaignData ? {
    tasks: tasks.filter(t => t.campaignId === selectedCampaign),
    kolList: [...new Set(tasks.filter(t => t.campaignId === selectedCampaign).map(t => t.kolId))].map(id => kols.find(k => k.id === id)).filter(Boolean),
    totalViews: tasks.filter(t => t.campaignId === selectedCampaign).reduce((s, t) => s + (t.metrics?.views || 0), 0),
    totalLikes: tasks.filter(t => t.campaignId === selectedCampaign).reduce((s, t) => s + (t.metrics?.likes || 0), 0),
    totalComments: tasks.filter(t => t.campaignId === selectedCampaign).reduce((s, t) => s + (t.metrics?.comments || 0), 0),
    totalShares: tasks.filter(t => t.campaignId === selectedCampaign).reduce((s, t) => s + (t.metrics?.shares || 0), 0),
    avgER: selectedCampaignData.avgEngagementRate,
    kpiProgress: Math.round((selectedCampaignData.totalViews / selectedCampaignData.kpiTarget.views) * 100),
  } : null;

  // KOL-specific metrics
  const kolMetrics = selectedKOLData ? {
    tasks: tasks.filter(t => t.kolId === selectedKOL),
    campaigns: [...new Set(tasks.filter(t => t.kolId === selectedKOL).map(t => t.campaignId))],
    totalViews: tasks.filter(t => t.kolId === selectedKOL).reduce((s, t) => s + (t.metrics?.views || 0), 0),
    totalLikes: tasks.filter(t => t.kolId === selectedKOL).reduce((s, t) => s + (t.metrics?.likes || 0), 0),
    totalComments: tasks.filter(t => t.kolId === selectedKOL).reduce((s, t) => s + (t.metrics?.comments || 0), 0),
    totalShares: tasks.filter(t => t.kolId === selectedKOL).reduce((s, t) => s + (t.metrics?.shares || 0), 0),
    avgER: selectedKOLData.engagementRate,
    completedTasks: tasks.filter(t => t.kolId === selectedKOL && t.status === 'completed').length,
    avgViewsPerTask: tasks.filter(t => t.kolId === selectedKOL && t.status === 'completed').length > 0 
      ? tasks.filter(t => t.kolId === selectedKOL).reduce((s, t) => s + (t.metrics?.views || 0), 0) / tasks.filter(t => t.kolId === selectedKOL && t.status === 'completed').length 
      : 0,
  } : null;

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };

  const handleReportTypeChange = (type: any) => {
    setReportType(type);
    setReportGenerated(false);
  };

  const reportTypes = [
    { id: 'system', label: 'Báo cáo hệ thống', icon: Briefcase, desc: 'Tổng quan toàn bộ nền tảng', color: 'blue' },
    { id: 'brand', label: 'Báo cáo Brand', icon: Package, desc: 'Chi tiết từng Brand', color: 'teal' },
    { id: 'campaign', label: 'Báo cáo Campaign', icon: Target, desc: 'Chi tiết từng Chiến dịch', color: 'amber' },
    { id: 'kol', label: 'Báo cáo KOL/KOC', icon: Users, desc: 'Chi tiết từng KOL/KOC', color: 'purple' },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', text: 'text-blue-600', icon: 'bg-blue-100 dark:bg-blue-900/40' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-500', text: 'text-teal-600', icon: 'bg-teal-100 dark:bg-teal-900/40' },
    amber: { bg: 'bg-amber-50/80 dark:bg-amber-900/20', border: 'border-amber-500', text: 'text-amber-600', icon: 'bg-amber-100 dark:bg-amber-900/40' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500', text: 'text-purple-600', icon: 'bg-purple-100 dark:bg-purple-900/40' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trung tâm Báo cáo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo và xuất báo cáo chi tiết theo từng mục</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const colors = colorClasses[type.color];
          const isActive = reportType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => handleReportTypeChange(type.id)}
              className={`p-6 rounded-lg border-2 text-left transition-colors ${
                isActive 
                  ? `${colors.bg} ${colors.border}` 
                  : 'border-slate-200/80 hover:border-brand-300'
              }`}
            >
              <div className={`p-3 rounded-xl w-fit mb-4 ${isActive ? colors.icon : 'bg-slate-100 dark:bg-slate-700'}`}>
                <Icon className={`w-6 h-6 ${isActive ? colors.text : 'text-slate-500'}`} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{type.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{type.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card-base p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Bộ lọc báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Từ ngày</label>
            <input 
              type="date" 
              value={dateRange.from} 
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Đến ngày</label>
            <input 
              type="date" 
              value={dateRange.to} 
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          
          {/* Brand Filter - shown for brand/campaign/system reports */}
          {(reportType === 'brand' || reportType === 'campaign' || reportType === 'system') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Brand</label>
              <select 
                value={selectedBrand} 
                onChange={e => { setSelectedBrand(e.target.value); setReportGenerated(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              >
                <option value="all">Tất cả Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {/* KOL Filter - shown for KOL reports */}
          {reportType === 'kol' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">KOL/KOC</label>
              <select 
                value={selectedKOL} 
                onChange={e => { setSelectedKOL(e.target.value); setReportGenerated(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              >
                <option value="all">Tất cả KOL</option>
                {kols.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          )}

          {/* Campaign Filter - only for campaign reports */}
          {reportType === 'campaign' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Campaign</label>
              <select 
                value={selectedCampaign} 
                onChange={e => { setSelectedCampaign(e.target.value); setReportGenerated(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              >
                <option value="all">Tất cả Campaign</option>
                {(selectedBrand !== 'all' ? campaigns.filter(c => c.brandId === selectedBrand) : campaigns).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo báo cáo...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Tạo báo cáo
              </>
            )}
          </Button>
          {reportGenerated && (
            <Badge label="Báo cáo đã sẵn sàng" colorClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* REPORT PREVIEWS - EACH REPORT TYPE HAS UNIQUE CONTENT */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      {/* SYSTEM REPORT */}
      {reportType === 'system' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-slate-100/80 dark:border-slate-700/40">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">BÁO CÁO HỆ THỐNG KOLLAB</h3>
              <p className="text-sm text-slate-500 mt-1">Thời gian: {dateRange.from} - {dateRange.to}</p>
            </div>
            
            {/* System Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              <div className="bg-white rounded p-4 border border-blue-200/40">
                <p className="text-2xl font-bold text-blue-600">{brands.length}</p>
                <p className="text-xs text-slate-500">Tổng Brand</p>
              </div>
              <div className="bg-white rounded p-4 border border-teal-200/40">
                <p className="text-2xl font-bold text-teal-600">{campaigns.length}</p>
                <p className="text-xs text-slate-500">Tổng Campaign</p>
              </div>
              <div className="bg-white rounded p-4 border border-purple-200/40">
                <p className="text-2xl font-bold text-purple-600">{kols.length}</p>
                <p className="text-xs text-slate-500">Tổng KOL/KOC</p>
              </div>
              <div className="bg-white rounded p-4 border border-amber-200/40">
                <p className="text-2xl font-bold text-amber-600">{(systemStats.totalPayment / 1000000000).toFixed(1)}B</p>
                <p className="text-xs text-slate-500">Tổng Thanh toán</p>
              </div>
            </div>

            {/* System Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tổng số</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Đang hoạt động</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tổng Views</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tổng Tương tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Brands</td>
                    <td className="px-6 py-4 text-sm">{brands.length}</td>
                    <td className="px-6 py-4 text-sm">{brands.filter(b => campaigns.some(c => c.brandId === b.id && c.status === 'active')).length}</td>
                    <td className="px-6 py-4 text-sm">{brands.reduce((s, b) => s + b.totalViews, 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{brands.reduce((s, b) => s + (b.totalViews * 0.05), 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Campaigns</td>
                    <td className="px-6 py-4 text-sm">{campaigns.length}</td>
                    <td className="px-6 py-4 text-sm">{campaigns.filter(c => c.status === 'active').length}</td>
                    <td className="px-6 py-4 text-sm">{campaigns.reduce((s, c) => s + c.totalViews, 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{campaigns.reduce((s, c) => s + c.totalConversions, 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">KOLs/KOCs</td>
                    <td className="px-6 py-4 text-sm">{kols.length}</td>
                    <td className="px-6 py-4 text-sm">{kols.length}</td>
                    <td className="px-6 py-4 text-sm">{kolRankings.reduce((s, k) => s + k.totalViews, 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{kolRankings.reduce((s, k) => s + k.tasksCompleted, 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BRAND REPORT - Shows unique metrics for selected brand */}
      {reportType === 'brand' && (
        <div className="space-y-6">
          {/* Brand Detail Card */}
          {selectedBrandData && brandMetrics ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-slate-100/80 dark:border-slate-700/40 bg-gradient-to-r from-teal-500/10 to-transparent">
                <div className="flex items-center gap-4">
                  <Avatar initials={selectedBrandData.name.slice(0, 2)} size="lg" image={getBrandImage(selectedBrandData.name.slice(0, 2))} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedBrandData.name}</h3>
                    <p className="text-sm text-slate-500">{selectedBrandData.industry} • {selectedBrandData.plan} Plan</p>
                    <p className="text-xs text-slate-400 mt-1">Thời gian: {dateRange.from} - {dateRange.to}</p>
                  </div>
                </div>
              </div>

              {/* Brand KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-2xl font-bold text-blue-600">{brandMetrics.campaigns.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Campaigns</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                  <p className="text-2xl font-bold text-cyan-600">{brandMetrics.totalViews >= 1000000 ? (brandMetrics.totalViews / 1000000).toFixed(1) + 'M' : (brandMetrics.totalViews / 1000).toFixed(0) + 'K'}</p>
                  <p className="text-xs text-slate-500 mt-1">Tổng Views</p>
                </div>
                <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded">
                  <p className="text-2xl font-bold text-teal-600">{brandMetrics.totalEngagement.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Tương tác</p>
                </div>
                <div className="text-center p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{brandMetrics.avgER.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 mt-1">ER Trung bình</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                  <p className="text-2xl font-bold text-emerald-600">{brandMetrics.totalConversions.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Chuyển đổi</p>
                </div>
              </div>

              {/* Brand Campaigns Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Views</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">KOLs</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">ER %</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Chuyển đổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {brandMetrics.campaigns.map(camp => (
                      <tr key={camp.id}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{camp.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{camp.productName}</td>
                        <td className="px-6 py-4"><Badge label={campaignStatusLabels[camp.status]} colorClass="bg-blue-100 text-blue-800" /></td>
                        <td className="px-6 py-4 text-sm text-right font-medium">{camp.totalViews >= 1000000 ? (camp.totalViews / 1000000).toFixed(1) + 'M' : (camp.totalViews / 1000).toFixed(0) + 'K'}</td>
                        <td className="px-6 py-4 text-sm text-right">{tasks.filter(t => t.campaignId === camp.id && t.kolId).length}</td>
                        <td className="px-6 py-4 text-sm text-right text-teal-600">{camp.avgEngagementRate}%</td>
                        <td className="px-6 py-4 text-sm text-right text-amber-600">{camp.totalConversions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Vui lòng chọn Brand để xem báo cáo chi tiết</p>
            </div>
          )}
        </div>
      )}

      {/* CAMPAIGN REPORT - Shows unique metrics for selected campaign */}
      {reportType === 'campaign' && (
        <div className="space-y-6">
          {selectedCampaignData && campaignMetrics ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-slate-100/80 dark:border-slate-700/40 bg-gradient-to-r from-amber-500/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCampaignData.name}</h3>
                    <p className="text-sm text-slate-500">{selectedCampaignData.productName} • {brands.find(b => b.id === selectedCampaignData.brandId)?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Thời gian: {dateRange.from} - {dateRange.to}</p>
                  </div>
                  <Badge label={campaignStatusLabels[selectedCampaignData.status]} colorClass="bg-blue-100 text-blue-800" />
                </div>
              </div>

              {/* Campaign KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-2xl font-bold text-blue-600">{campaignMetrics.kolList.length}</p>
                  <p className="text-xs text-slate-500 mt-1">KOLs tham gia</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                  <p className="text-2xl font-bold text-cyan-600">{campaignMetrics.totalViews >= 1000000 ? (campaignMetrics.totalViews / 1000000).toFixed(1) + 'M' : (campaignMetrics.totalViews / 1000).toFixed(0) + 'K'}</p>
                  <p className="text-xs text-slate-500 mt-1">Tổng Views</p>
                </div>
                <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded">
                  <p className="text-2xl font-bold text-pink-600">{campaignMetrics.totalLikes.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Likes (React)</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-2xl font-bold text-blue-600">{campaignMetrics.totalComments.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Comments</p>
                </div>
                <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded">
                  <p className="text-2xl font-bold text-violet-600">{campaignMetrics.totalShares.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Shares</p>
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="px-6 pb-6">
                <div className="surface-subtle p-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Chi tiết Engagement</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-pink-600">{campaignMetrics.totalLikes.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Likes</p>
                    </div>
                    <div className="text-center border-x border-slate-200 dark:border-slate-700">
                      <p className="text-xl font-bold text-blue-600">{campaignMetrics.totalComments.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Comments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-violet-600">{campaignMetrics.totalShares.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Shares</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 items-center">
                    <span className="text-xs text-slate-500">ER Campaign:</span>
                    <span className="text-sm font-bold text-teal-600">{campaignMetrics.avgER}%</span>
                    <span className="text-xs text-slate-500 ml-4">KPI Progress:</span>
                    <span className="text-sm font-bold text-amber-600">{campaignMetrics.kpiProgress}%</span>
                  </div>
                </div>
              </div>

              {/* KOLs in Campaign Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Followers</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status Task</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Views</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Likes</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {campaignMetrics.kolList.filter(Boolean).map((kol: any) => {
                      const kolTask = tasks.find(t => t.campaignId === selectedCampaign && t.kolId === kol.id);
                      return (
                        <tr key={kol.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar initials={kol.avatar} size="sm" image={getKolImage(kol.avatar)} />
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{kol.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{kol.platform}</td>
                          <td className="px-6 py-4 text-sm">{kol.followersDisplay}</td>
                          <td className="px-6 py-4">
                            <Badge label={kolTask ? taskStatusLabels[kolTask.status] : 'Chưa nhận'} colorClass={kolTask ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'} />
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium">{(kolTask?.metrics?.views || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-pink-600">{(kolTask?.metrics?.likes || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-blue-600">{(kolTask?.metrics?.comments || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Vui lòng chọn Campaign để xem báo cáo chi tiết</p>
            </div>
          )}
        </div>
      )}

      {/* KOL REPORT - Shows unique metrics for selected KOL */}
      {reportType === 'kol' && (
        <div className="space-y-6">
          {selectedKOLData && kolMetrics ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-slate-100/80 dark:border-slate-700/40 bg-gradient-to-r from-purple-500/10 to-transparent">
                <div className="flex items-center gap-4">
                  <Avatar initials={selectedKOLData.avatar} size="lg" image={getKolImage(selectedKOLData.avatar)} />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedKOLData.name}</h3>
                    <p className="text-sm text-slate-500">{selectedKOLData.platform} • {selectedKOLData.niche} • {selectedKOLData.followersDisplay} followers</p>
                    <p className="text-xs text-slate-400 mt-1">Thời gian: {dateRange.from} - {dateRange.to}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{kolRankings.find(r => r.kolId === selectedKOL)?.score.toFixed(1) || kolMetrics.avgER.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">Score</p>
                  </div>
                </div>
              </div>

              {/* KOL KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-2xl font-bold text-blue-600">{kolMetrics.campaigns.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Campaigns</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                  <p className="text-2xl font-bold text-cyan-600">{kolMetrics.totalViews >= 1000000 ? (kolMetrics.totalViews / 1000000).toFixed(1) + 'M' : (kolMetrics.totalViews / 1000).toFixed(0) + 'K'}</p>
                  <p className="text-xs text-slate-500 mt-1">Tổng Views</p>
                </div>
                <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded">
                  <p className="text-2xl font-bold text-pink-600">{kolMetrics.totalLikes.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Likes (React)</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-2xl font-bold text-blue-600">{kolMetrics.totalComments.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Comments</p>
                </div>
                <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded">
                  <p className="text-2xl font-bold text-violet-600">{kolMetrics.totalShares.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Shares</p>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="px-6 pb-6">
                <div className="surface-subtle p-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Chi tiết Hiệu suất</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-teal-600">{kolMetrics.avgER.toFixed(2)}%</p>
                      <p className="text-xs text-slate-500">Engagement Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-600">{kolMetrics.avgViewsPerTask >= 1000 ? (kolMetrics.avgViewsPerTask / 1000).toFixed(1) + 'K' : Math.round(kolMetrics.avgViewsPerTask)}</p>
                      <p className="text-xs text-slate-500">Avg Views/Task</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-emerald-600">{kolMetrics.completedTasks}/{kolMetrics.tasks.length}</p>
                      <p className="text-xs text-slate-500">Tasks Hoàn thành</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">{kolMetrics.tasks.length > 0 ? Math.round(kolMetrics.completedTasks / kolMetrics.tasks.length * 100) : 0}%</p>
                      <p className="text-xs text-slate-500">Task Completion</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOL Tasks Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Views</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Likes</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Comments</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Shares</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {kolMetrics.tasks.slice(0, 10).map(task => {
                      const camp = campaigns.find(c => c.id === task.campaignId);
                      const brand = brands.find(b => b.id === camp?.brandId);
                      return (
                        <tr key={task.id}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{camp?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{brand?.name || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <Badge label={taskStatusLabels[task.status]} colorClass={task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : task.status === 'tracking' || task.status === 'published' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'} />
                          </td>
                          <td className="px-6 py-4 text-sm text-right">{(task.metrics?.views || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-pink-600">{(task.metrics?.likes || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-blue-600">{(task.metrics?.comments || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-violet-600">{(task.metrics?.shares || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Vui lòng chọn KOL/KOC để xem báo cáo chi tiết</p>
            </div>
          )}
        </div>
      )}

      {/* Download Actions */}
      {reportGenerated && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />PDF
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />Excel
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />CSV
          </Button>
        </div>
      )}
    </div>
  );
}

