import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Clock, Upload, Link, Wallet, DollarSign,
  FileText, CheckCircle2, Camera, Award,
  ExternalLink, TrendingUp, Eye, MessageCircle,
  QrCode, User, AlertTriangle, Check, X, Edit3,
  Settings, Bell, Search, Star, ChevronRight, Handshake, BarChart3,
  Heart, Share2, Bookmark, Calendar
} from 'lucide-react';
import { Modal, Button, Badge, Avatar } from '../../components/SharedUI';
import { campaignService } from '../../services/campaignService';
import { taskStatusLabels, taskStatusColors, paymentStatusLabels, type TaskStatus } from '../../data/mockData';
import { taskService } from '../../services/taskService';

// ─── DEMO DATA ───────────────────────────────────────────────────────────

const currentKOL = {
  id: 'k1',
  name: 'Linh Beauty',
  handle: '@linhbeauty.official',
  platform: 'TikTok',
  avatar: 'LB',
  followers: 1200000,
  followersDisplay: '1.2M',
  engagementRate: 6.8,
  niche: 'Skincare',
  contentCategory: 'Chăm sóc da',
  bio: 'Beauty Blogger | Skincare Enthusiast | 1.2M followers on TikTok. Chia sẻ tips chăm sóc da, review mỹ phẩm thật.',
  totalEarned: 127500000,
  pendingPayment: 17000000,
  currentRank: 1,
  bankName: 'TPBank',
  bankAccount: '0123 456 7890',
  bankHolder: 'Nguyễn Thị Linh',
  email: 'linhbeauty.official@gmail.com',
  tiktok: 'https://tiktok.com/@linhbeauty.official',
  instagram: 'https://instagram.com/linhbeauty',
  qrUploaded: true,
};

// ─── CAMPAIGN THẬT TỪ SUPABASE (bảng campaigns, status = ACTIVE) ─────────
type ExploreCampaign = {
  id: string; brandName: string; productName: string;
  brief: string; requirements: string; paymentRule: string;
  targetViews: number; targetER: number; deadline: string;
  rewardLabel: string; productValue: number;
  productImage: string; status: string; category: string;
};

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/kollab-campaign/400/300';

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Supabase (snake_case + join products/brands) → shape mà UI KOL đang dùng
function mapExploreRow(row: Record<string, any>): ExploreCampaign {
  return {
    id: String(row.id),
    brandName: row.brands?.brand_name ?? 'Brand',
    productName: row.products?.product_name ?? row.campaign_name ?? '—',
    brief: row.campaign_brief ?? row.objective ?? '',
    requirements: row.objective ?? '',
    paymentRule: row.payment_rule ?? '',
    targetViews: toNum(row.target_views),
    targetER: toNum(row.target_engagement_rate),
    deadline: row.end_date ? String(row.end_date).slice(0, 10) : '-',
    rewardLabel: 'Theo thỏa thuận',   // thù lao thật nằm ở campaign_tasks.payment_amount (khi Brand giao nhiệm vụ)
    productValue: toNum(row.products?.price),
    productImage: row.products?.image_url || PLACEHOLDER_IMAGE,
    status: 'open',
    category: row.brands?.industry ?? 'Campaign',
  };
}

type ExploreContextValue = {
  campaigns: ExploreCampaign[]; loading: boolean; error: string | null; reload: () => Promise<void>;
};
const ExploreContext = createContext<ExploreContextValue>({
  campaigns: [], loading: true, error: null, reload: async () => { },
});
const useExplore = () => useContext(ExploreContext);





// Thanh toán
const kolPayments = [
  { id: 'pay1', campaignName: 'Beauty Launch', amount: 12000000, paidAmount: 12000000, status: 'paid' as const, date: '2026-05-30', method: 'Chuyển khoản', note: '' },
  { id: 'pay2', campaignName: 'Spring Collection', amount: 15000000, paidAmount: 0, status: 'pending' as const, date: '', method: 'Chuyển khoản', note: 'Đang xử lý' },
  { id: 'pay3', campaignName: 'Summer Sale 2026', amount: 10000000, paidAmount: 0, status: 'pending' as const, date: '', method: 'Chuyển khoản', note: 'Chờ Brand xác nhận metrics' },
  { id: 'pay4', campaignName: 'Fitness Gear Review', amount: 9000000, paidAmount: 9000000, status: 'paid' as const, date: '2026-05-10', method: 'Momo', note: '' },
  { id: 'pay5', campaignName: 'Skincare Routine', amount: 7500000, paidAmount: 7500000, status: 'paid' as const, date: '2026-04-22', method: 'Chuyển khoản', note: '' },
];

// ─── KOL PORTAL ──────────────────────────────────────────────────────────

// Component gốc: tải campaign đang mở từ Supabase rồi cấp cho toàn bộ portal qua context
export function KOLDashboard({ initialView = 'dashboard' }: { initialView?: string }) {
  const [campaigns, setCampaigns] = useState<ExploreCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const rows = await campaignService.getOpenCampaigns();
      setCampaigns((rows as Record<string, any>[]).map(mapExploreRow));
    } catch (e) {
      console.error('Load open campaigns error:', e);
      setError('Không thể tải chiến dịch từ Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => ({ campaigns, loading, error, reload }), [campaigns, loading, error, reload]);

  return (
    <ExploreContext.Provider value={value}>
      <KOLDashboardShell initialView={initialView} />
    </ExploreContext.Provider>
  );
}

function KOLDashboardShell({ initialView = 'dashboard' }: { initialView?: string }) {


  const [tasks, setTasks] = useState<any[]>([]);


  useEffect(() => {

    async function loadTasks() {

      try {

        const data = await taskService.getTasksByKol(
          currentKOL.id
        );

        setTasks(data);

      } catch (error) {

        console.error(error);

      }

    }


    loadTasks();

  }, []);



  const [activeView, setActiveView] = useState<
    'dashboard' | 'explore' | 'tasks' | 'task_detail' | 'wallet' | 'profile' | 'payment'
  >(
    initialView as any || 'dashboard'
  );

}

// ─── KPI POPUP: TỔNG THU NHẬP ─────────────────────────────────────────

function KPIPopupEarnings() {
  const paidPayments = kolPayments.filter(p => p.status === 'paid');
  const totalPaid = paidPayments.reduce((s, p) => s + p.paidAmount, 0);
  const monthlyData = [
    { month: 'Tháng 1', amount: 18750000 },
    { month: 'Tháng 2', amount: 22500000 },
    { month: 'Tháng 3', amount: 15000000 },
    { month: 'Tháng 4', amount: 31250000 },
    { month: 'Tháng 5', amount: 40500000 },
    { month: 'Tháng 6', amount: 0 },
  ];
  const maxAmount = Math.max(...monthlyData.map(m => m.amount));
  const currentMonth = monthlyData[monthlyData.length - 2]; // May 2026

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800/40">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Tổng đã nhận</p>
          <p className="text-2xl font-bold text-emerald-600">{(totalPaid / 1000000).toFixed(1)}M ₫</p>
          <p className="text-xs text-gray-400 mt-1">{paidPayments.length} khoản</p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 text-center border border-teal-200 dark:border-teal-800/40">
          <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">Tháng này</p>
          <p className="text-2xl font-bold text-teal-600">{(currentMonth.amount / 1000000).toFixed(1)}M ₫</p>
          <p className="text-xs text-gray-400 mt-1">Tháng 5/2026</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 p-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Thu nhập theo tháng</p>
        <div className="flex items-end gap-2 h-32">
          {monthlyData.map((m) => {
            const pct = maxAmount > 0 ? (m.amount / maxAmount) * 100 : 0;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">{m.amount > 0 ? `${(m.amount / 1000000).toFixed(1)}M` : '-'}</span>
                <div className="w-full rounded-t-lg bg-teal-500 dark:bg-teal-600 transition-all" style={{ height: `${Math.max(pct, 4)}%` }} />
                <span className="text-[10px] text-gray-400">{m.month.replace('Tháng ', '')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment history */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lịch sử thanh toán</p>
        {paidPayments.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{p.campaignName}</p>
              <p className="text-xs text-gray-400">{p.date} • {p.method}</p>
            </div>
            <p className="text-sm font-bold text-emerald-600">+{p.paidAmount.toLocaleString()}₫</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI POPUP: ĐANG CHỜ THANH TOÁN ─────────────────────────────────────

function KPIPopupPendingPayments() {
  const pendingPayments = kolPayments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/40 text-center">
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Tổng đang chờ</p>
        <p className="text-3xl font-bold text-amber-600">{(currentKOL.pendingPayment / 1000000).toFixed(1)}M ₫</p>
        <p className="text-xs text-gray-400 mt-1">{pendingPayments.length} khoản đang xử lý</p>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {pendingPayments.map(p => {
          const task = kolTasks.find(t => t.campaignName === p.campaignName);
          return (
            <div key={p.id} className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-900/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.campaignName}</p>
                  <p className="text-xs text-gray-400">Thù lao theo hợp đồng</p>
                </div>
                <p className="text-lg font-bold text-amber-600">{p.amount.toLocaleString()}₫</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />Đã gửi metrics</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />Chờ Brand duyệt</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task?.deadline || '—'}</span>
              </div>
              {task && (
                <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-xs text-gray-500">KPI: {task.kpiTarget.views >= 1000 ? Math.round(task.kpiTarget.views / 1000) + 'K' : task.kpiTarget.views} views • {task.kpiTarget.engagementRate}% ER</p>
                  {task.metrics.views > 0 && (
                    <p className="text-xs text-teal-600 mt-0.5">✓ Đã đạt KPI — Views: {task.metrics.views >= 1000 ? `${Math.round(task.metrics.views / 1000)}K` : task.metrics.views} • ER: {task.metrics.engagementRate}%</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── KPI POPUP: THỨ HẠNG KOL ──────────────────────────────────────────

function KPIPopupRanking() {
  const rankings = [
    { rank: 1, name: 'Linh Beauty', platform: 'TikTok', followers: '1.2M', er: '6.8%', score: 98, trend: '+2', color: 'bg-amber-500', badge: '🏆' },
    { rank: 2, name: 'Minh Tech Review', platform: 'YouTube', followers: '850K', er: '5.2%', score: 91, trend: '-1', color: 'bg-gray-400', badge: '' },
    { rank: 3, name: 'Foodie Hà Nội', platform: 'TikTok', followers: '2.1M', er: '4.1%', score: 89, trend: '+1', color: 'bg-amber-700', badge: '' },
    { rank: 4, name: 'Gym Coach Nam', platform: 'Instagram', followers: '320K', er: '7.3%', score: 85, trend: '0', color: 'bg-gray-300', badge: '' },
    { rank: 5, name: 'Mỹ Phẩm Thật', platform: 'Facebook', followers: '500K', er: '3.9%', score: 80, trend: '+3', color: 'bg-gray-300', badge: '' },
  ];

  const topKol = rankings[0];
  const yourStats = rankings.find(r => r.name === currentKOL.name);

  return (
    <div className="space-y-4">
      {/* Top KOL */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/40 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">{topKol.badge || '👑'}</span>
          <div>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{topKol.name}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">{topKol.platform} • {topKol.followers} • ER {topKol.er}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 rounded-full px-3 py-1">
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Score: {topKol.score}</span>
          <span className="text-xs text-emerald-600">↑ {topKol.trend}</span>
        </div>
      </div>

      {/* Rankings table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/80">
              <tr className="border-b border-gray-200 dark:border-slate-600">
                {['Hạng', 'KOL', 'Nền tảng', 'Followers', 'ER', 'Score', 'Xu hướng'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.rank} className={`border-b border-gray-50 dark:border-slate-700/50 ${r.name === currentKOL.name ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}>
                  <td className="px-3 py-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${r.color}`}>{r.rank}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{r.platform}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-gray-200">{r.followers}</td>
                  <td className="px-3 py-2.5 text-xs font-medium text-teal-600">{r.er}</td>
                  <td className="px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white">{r.score}</td>
                  <td className="px-3 py-2.5 text-xs font-medium">
                    {r.trend.startsWith('+') && <span className="text-emerald-600">↑ {r.trend}</span>}
                    {r.trend.startsWith('-') && <span className="text-red-500">↓ {r.trend}</span>}
                    {r.trend === '0' && <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {yourStats && yourStats.rank !== 1 && (
        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 border border-violet-200 dark:border-violet-800/40 text-center">
          <p className="text-xs text-violet-600 dark:text-violet-400">Cách top 1</p>
          <p className="text-sm font-bold text-violet-700 dark:text-violet-300">{topKol.score - yourStats.score} điểm</p>
        </div>
      )}
    </div>
  );
}

// ─── KPI POPUP: ĐÃ HOÀN THÀNH ─────────────────────────────────────────

function KPIPopupCompleted({ onViewTask }: { onViewTask: (id: string) => void }) {
  const completedTasks = kolTasks.filter(t => ['published', 'paid', 'metrics_approved'].includes(t.status));

  const summary = {
    total: completedTasks.length,
    totalViews: completedTasks.reduce((s, t) => s + (t.metrics?.views || 0), 0),
    avgER: completedTasks.length > 0
      ? (completedTasks.reduce((s, t) => s + (t.metrics?.engagementRate || 0), 0) / completedTasks.length).toFixed(1)
      : '0',
    totalEarned: completedTasks.reduce((s, t) => s + t.payment, 0),
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Chiến dịch', value: summary.total.toString() },
          { label: 'Tổng Views', value: summary.totalViews >= 1000000 ? `${(summary.totalViews / 1000000).toFixed(1)}M` : `${Math.round(summary.totalViews / 1000)}K` },
          { label: 'ER TB', value: `${summary.avgER}%` },
          { label: 'Tổng thu', value: `${(summary.totalEarned / 1000000).toFixed(1)}M` },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {completedTasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.campaignName}</p>
                <p className="text-xs text-gray-400">{task.productName} • {task.brandName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">{task.payment.toLocaleString()}₫</p>
                <Badge label={task.status === 'paid' ? 'Đã thanh toán' : 'Hoàn thành'}
                  colorClass={task.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'} />
              </div>
            </div>
            {task.metrics.views > 0 && (
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                {[
                  { label: 'Views', value: task.metrics.views >= 1000 ? `${Math.round(task.metrics.views / 1000)}K` : task.metrics.views.toString() },
                  { label: 'Likes', value: task.metrics.likes >= 1000 ? `${Math.round(task.metrics.likes / 1000)}K` : task.metrics.likes.toString() },
                  { label: 'Comments', value: task.metrics.comments.toString() },
                  { label: 'Shares', value: task.metrics.shares >= 1000 ? `${Math.round(task.metrics.shares / 1000)}K` : task.metrics.shares.toString() },
                  { label: 'ER', value: `${task.metrics.engagementRate}%` },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{m.value}</p>
                    <p className="text-[10px] text-gray-400">{m.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => onViewTask(task.id)}>
                <TrendingUp className="w-3 h-3 mr-1" />Xem chi tiết
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────

function KPICard({ label, value, suffix, icon, accent = 'from-blue-500/10 to-blue-600/5', onClick }: {
  label: string; value: string; suffix?: string; icon: React.ReactNode; accent?: string; onClick?: () => void;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className={`bg-gradient-to-br ${accent} to-white rounded-2xl p-4 border border-gray-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}{suffix && <span className="text-xs font-normal text-gray-400 ml-0.5">{suffix}</span>}</p>
        </div>
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
    </motion.div>
  );
}

// ─── DASHBOARD VIEW ─────────────────────────────────────────────────────

function DashboardView({ navigateTo, onSelectTask }: {
  navigateTo: (v: 'dashboard' | 'explore' | 'tasks' | 'task_detail' | 'wallet' | 'profile') => void;
  onSelectTask: (id: string) => void;
}) {
  const { campaigns: exploreCampaigns } = useExplore();
  const pendingTasks = kolTasks.filter(t => ['assigned', 'approved_to_publish', 'draft_submitted'].includes(t.status));
  const revisionTasks = kolTasks.filter(t => t.status === 'revision_required');
  // (in-progress tracked via metrics)
  const newCampaigns = exploreCampaigns.slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickNavCard icon={<Search className="w-5 h-5" />} label="Khám phá chiến dịch" count={exploreCampaigns.length} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20"
          onClick={() => navigateTo('explore')} />
        <QuickNavCard icon={<FileText className="w-5 h-5" />} label="Nhiệm vụ của tôi" count={kolTasks.length} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20"
          onClick={() => navigateTo('tasks')} />
        <QuickNavCard icon={<Wallet className="w-5 h-5" />} label="Ví & Thanh toán" count={kolPayments.filter(p => p.status === 'pending').length} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20"
          onClick={() => navigateTo('wallet')} />
        <QuickNavCard icon={<Settings className="w-5 h-5" />} label="Cài đặt" count={0} color="text-gray-500" bg="bg-gray-50 dark:bg-slate-700/50"
          onClick={() => navigateTo('profile')} />
      </div>

      {/* Nhiệm vụ cần xử lý */}
      {(pendingTasks.length > 0 || revisionTasks.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />Cần xử lý ngay
            </h3>
            <button onClick={() => navigateTo('tasks')} className="text-xs text-teal-600 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...revisionTasks, ...pendingTasks].slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Chiến dịch mới để đăng ký */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />Chiến dịch mới dành cho bạn
          </h3>
          <button onClick={() => navigateTo('explore')} className="text-xs text-teal-600 hover:underline font-medium">Xem thêm →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newCampaigns.map(c => (
            <ExploreCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>

      {/* Performance nổi bật */}
      {kolTasks.filter(t => t.metrics.views > 0).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />Performance nổi bật
            </h3>
            <button onClick={() => navigateTo('tasks')} className="text-xs text-teal-600 hover:underline font-medium">Chi tiết →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kolTasks.filter(t => t.metrics.views > 0).slice(0, 3).map(task => (
              <div key={task.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-2">{task.campaignName}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{task.metrics.views >= 1000 ? `${Math.round(task.metrics.views / 1000)}K` : task.metrics.views}</p>
                    <p className="text-[10px] text-gray-500">Views</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-pink-600">{task.metrics.engagementRate}%</p>
                    <p className="text-[10px] text-gray-500">ER</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-emerald-600">{task.metrics.likes >= 1000 ? `${Math.round(task.metrics.likes / 1000)}K` : task.metrics.likes}</p>
                    <p className="text-[10px] text-gray-500">Likes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function QuickNavCard({ icon, label, count, color, bg, onClick }: {
  icon: React.ReactNode; label: string; count: number; color: string; bg: string; onClick: () => void;
}) {
  return (
    <motion.button whileHover={{ y: -2 }} onClick={onClick}
      className={`${bg} rounded-2xl p-4 border border-gray-200/60 dark:border-slate-700/60 text-left hover:shadow-sm transition-all flex items-center gap-3`}>
      <div className={`${color}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{label}</p>
        {count > 0 && <p className="text-xs text-gray-500">{count} mục</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </motion.button>
  );
}

// ─── EXPLORE VIEW ────────────────────────────────────────────────────────

function ExploreView({ onBack }: {
  onBack: () => void;
}) {
  const { campaigns: exploreCampaigns, loading, error, reload } = useExplore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>← Quay lại</Button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Khám phá chiến dịch</h3>
        <Button variant="secondary" size="sm" onClick={() => { reload(); }}>Làm mới</Button>
      </div>

      {loading && <p className="text-sm text-gray-500 py-8 text-center">Đang tải chiến dịch...</p>}
      {error && <p className="text-sm text-red-500 py-2">{error}</p>}
      {!loading && !error && exploreCampaigns.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Chưa có chiến dịch nào đang mở. Brand cần kích hoạt chiến dịch trước.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exploreCampaigns.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 overflow-hidden">
            <img src={c.productImage} alt={c.productName} className="w-full h-36 object-cover" />
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{c.brandName}</p>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{c.productName}</h4>
                </div>
                <Badge label={c.category} colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{c.brief}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.targetViews >= 1000 ? `${Math.round(c.targetViews / 1000)}K` : c.targetViews}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{c.targetER}% ER</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.deadline}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-700">
                <p className="text-sm font-bold text-emerald-600">{c.rewardLabel}</p>
                <Button size="sm" onClick={() => { setSelectedId(c.id); }}>
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!selectedId} onClose={() => setSelectedId(null)} title="Chi tiết chiến dịch" width="max-w-2xl">
        {selectedId && <CampaignDetailModal campaignId={selectedId} onClose={() => setSelectedId(null)} />}
      </Modal>
    </motion.div>
  );
}

function ExploreCard({ campaign }: { campaign: ExploreCampaign }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 overflow-hidden flex">
      <img src={campaign.productImage} alt={campaign.productName} className="w-24 h-24 object-cover flex-shrink-0" />
      <div className="p-3 flex-1 min-w-0">
        <p className="text-xs text-teal-600 font-medium">{campaign.brandName}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{campaign.productName}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>Target {campaign.targetViews >= 1000 ? `${Math.round(campaign.targetViews / 1000)}K` : campaign.targetViews} views</span>
          <span>•</span>
          <span className="font-bold text-emerald-600">{campaign.rewardLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CAMPAIGN DETAIL MODAL ───────────────────────────────────────────────

function CampaignDetailModal({ campaignId, onClose }: {
  campaignId: string; onClose: () => void;
}) {
  const { campaigns: exploreCampaigns } = useExplore();
  const [registered, setRegistered] = useState(false);
  const campaign = exploreCampaigns.find(c => c.id === campaignId);
  if (!campaign) return <p className="p-4 text-sm text-gray-500">Không tìm thấy chiến dịch.</p>;

  return (
    <div className="space-y-4">
      <img src={campaign.productImage} alt={campaign.productName} className="w-full h-40 object-cover rounded-xl" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">{campaign.brandName}</p>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.productName}</h3>
        </div>
        <Badge label={campaign.status === 'open' ? 'Đang tuyển' : campaign.status} colorClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Target Views', value: `${campaign.targetViews >= 1000 ? Math.round(campaign.targetViews / 1000) + 'K' : campaign.targetViews}` },
          { label: 'Target ER', value: `${campaign.targetER}%` },
          { label: 'Thù lao', value: campaign.rewardLabel },
          { label: 'Deadline', value: campaign.deadline },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5"><FileText className="w-4 h-4" />Brief nội dung</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{campaign.brief}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Mục tiêu chiến dịch</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{campaign.requirements || '—'}</p>
        </div>
        {campaign.paymentRule && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1.5 flex items-center gap-1.5"><DollarSign className="w-4 h-4" />Quy tắc thanh toán</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{campaign.paymentRule}</p>
          </div>
        )}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <span className="text-xs text-gray-500">Giá trị sản phẩm mẫu</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{campaign.productValue.toLocaleString()}₫</span>
        </div>
      </div>

      {!registered ? (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={() => setRegistered(true)}>
            <Handshake className="w-4 h-4 mr-2" />Đăng ký tham gia
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />Bạn đã đăng ký! Chờ Brand phê duyệt và giao nhiệm vụ.
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => { setRegistered(false); onClose(); }}>Đóng</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TASKS VIEW ─────────────────────────────────────────────────────────

function TasksView({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'revision' | 'approved' | 'published'>('all');

  const filtered = kolTasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['assigned', 'approved_to_publish', 'draft_submitted'].includes(t.status);
    if (filter === 'revision') return t.status === 'revision_required';
    if (filter === 'approved') return t.status === 'approved_to_publish';
    if (filter === 'published') return ['published', 'tracking', 'paid', 'metrics_approved'].includes(t.status);
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nhiệm vụ của tôi</h3>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tất cả', count: kolTasks.length },
          { id: 'pending', label: 'Chờ xử lý', count: kolTasks.filter(t => ['assigned', 'approved_to_publish', 'draft_submitted'].includes(t.status)).length },
          { id: 'revision', label: 'Cần sửa', count: kolTasks.filter(t => t.status === 'revision_required').length },
          { id: 'approved', label: 'Đã duyệt', count: kolTasks.filter(t => t.status === 'approved_to_publish').length },
          { id: 'published', label: 'Đã xuất bản', count: kolTasks.filter(t => ['published', 'tracking', 'paid', 'metrics_approved'].includes(t.status)).length },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter === f.id ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onClick }: { task: typeof kolTasks[0]; onClick: () => void }) {
  const canSubmitDraft = task.status === 'assigned' || task.status === 'revision_required';
  const canSubmitLink = task.status === 'approved_to_publish';
  const canSubmitMetrics = ['published', 'tracking'].includes(task.status);

  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5 cursor-pointer hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{task.campaignName}</p>
          <p className="text-xs text-gray-500">{task.productName}</p>
        </div>
        <Badge label={taskStatusLabels[task.status as TaskStatus]} colorClass={taskStatusColors[task.status as TaskStatus]} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{task.brief}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.deadline}</span>
        <span className="font-medium text-emerald-600">{task.payment.toLocaleString()}₫</span>
      </div>
      {(canSubmitDraft || canSubmitLink || canSubmitMetrics) && (
        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {canSubmitDraft && 'Cần gửi bản nháp'}
            {canSubmitLink && 'Cần gửi link bài đăng'}
            {canSubmitMetrics && 'Cần cập nhật metrics'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── TASK DETAIL VIEW ───────────────────────────────────────────────────

function TaskDetailView({ taskId, onBack }: { taskId: string; onBack: () => void }) {
  const task = kolTasks.find(t => t.id === taskId);

  const [activeTab, setActiveTab] = useState<'detail' | 'drafts' | 'metrics'>('detail');
  const [showSubmitDraft, setShowSubmitDraft] = useState(false);
  const [showSubmitLink, setShowSubmitLink] = useState(false);
  const [showSubmitMetrics, setShowSubmitMetrics] = useState(false);
  const [showPreviewDraft, setShowPreviewDraft] = useState<number | null>(null);

  const canSubmitDraft = task.status === 'assigned' || task.status === 'revision_required';
  const canSubmitLink = task.status === 'approved_to_publish';
  const canSubmitMetrics = ['published', 'tracking'].includes(task.status);
  const hasMetrics = task.metrics.views > 0;


  if (!task) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>← Quay lại danh sách nhiệm vụ</Button>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{task.brandName}</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{task.campaignName}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{task.productName}</p>
          </div>
          <Badge label={taskStatusLabels[task.status as TaskStatus]} colorClass={taskStatusColors[task.status as TaskStatus]} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Target Views" value={task.kpiTarget.views.toLocaleString()} />
          <StatCard label="Target ER" value={`${task.kpiTarget.engagementRate}%`} />
          <StatCard label="Hạn chót" value={task.deadline} />
          <StatCard label="Thù lao" value={`${(task.payment / 1000000).toFixed(1)}M`} suffix="₫" accent="teal" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl w-fit">
        {[
          { id: 'detail', label: 'Chi tiết nhiệm vụ' },
          { id: 'drafts', label: `Bản nháp (${task.drafts.length})` },
          { id: 'metrics', label: `Performance ${hasMetrics ? '✓' : ''}` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Chi tiết */}
      {activeTab === 'detail' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4" />Brief nội dung</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{task.brief}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Yêu cầu nội dung</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{task.contentRequirements}</p>
          </div>

          {/* Action Cards */}
          {canSubmitDraft && (
            <ActionCard icon={<Upload className="w-5 h-5" />} color="amber" title="Gửi bản nháp nội dung"
              desc="Tải lên video/hình ảnh bản nháp để Brand xem trước và phản hồi."
              btnLabel="Gửi bản nháp" onClick={() => setShowSubmitDraft(true)} />
          )}
          {canSubmitLink && (
            <ActionCard icon={<Link className="w-5 h-5" />} color="teal" title="Gửi link bài đăng"
              desc="Bản nháp đã được phê duyệt. Gửi link bài đã xuất bản kèm ảnh chụp."
              btnLabel="Gửi link & ảnh" onClick={() => setShowSubmitLink(true)} />
          )}
          {canSubmitMetrics && (
            <ActionCard icon={<BarChart3 className="w-5 h-5" />} color="blue" title="Cập nhật metrics"
              desc="Gửi số liệu views, likes, comments, shares, saves kèm ảnh chụp minh chứng."
              btnLabel="Cập nhật metrics" onClick={() => setShowSubmitMetrics(true)} />
          )}
        </div>
      )}

      {/* Tab: Bản nháp */}
      {activeTab === 'drafts' && (
        <div className="space-y-3">
          {task.drafts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-8 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chưa có bản nháp nào được gửi.</p>
              {canSubmitDraft && (
                <Button size="sm" className="mt-3" onClick={() => setShowSubmitDraft(true)}>
                  <Upload className="w-4 h-4 mr-1.5" />Gửi bản nháp đầu tiên
                </Button>
              )}
            </div>
          ) : (
            [...task.drafts].reverse().map((draft, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden ${i === 0 && draft.status === 'draft_submitted' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' : 'bg-white dark:bg-slate-800 border-gray-200/60 dark:border-slate-700/60'}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Phiên bản {draft.version}</span>
                      <Badge label={draft.status === 'approved' ? 'Đã duyệt' : draft.status === 'draft_submitted' ? 'Chờ duyệt' : 'Cần sửa'}
                        colorClass={draft.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          draft.status === 'draft_submitted' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'} />
                    </div>
                    <span className="text-xs text-gray-400">Nộp lúc {draft.submittedAt}</span>
                  </div>
                  {draft.image && (
                    <img src={draft.image} alt={`Draft v${draft.version}`} className="w-full h-48 object-cover rounded-xl mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowPreviewDraft(i)} />
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{draft.caption}"</p>
                  {draft.feedback && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-300 font-medium mb-1 flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />Phản hồi từ Brand:</p>
                      <p className="text-xs text-red-500 dark:text-red-400">{draft.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Performance */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {!hasMetrics ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-8 text-center">
              <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chưa có dữ liệu performance. Gửi link bài đăng để bắt đầu theo dõi.</p>
              {canSubmitLink && (
                <Button size="sm" className="mt-3" onClick={() => setShowSubmitLink(true)}>
                  <Link className="w-4 h-4 mr-1.5" />Gửi link bài đăng
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Views', value: task.metrics.views >= 1000 ? `${Math.round(task.metrics.views / 1000)}K` : task.metrics.views.toString(), color: 'text-gray-900' },
                  { label: 'Likes', value: task.metrics.likes >= 1000 ? `${Math.round(task.metrics.likes / 1000)}K` : task.metrics.likes.toString(), color: 'text-pink-600' },
                  { label: 'Comments', value: task.metrics.comments.toString(), color: 'text-blue-600' },
                  { label: 'Shares', value: task.metrics.shares >= 1000 ? `${Math.round(task.metrics.shares / 1000)}K` : task.metrics.shares.toString(), color: 'text-teal-600' },
                  { label: 'Saves', value: task.metrics.saves >= 1000 ? `${Math.round(task.metrics.saves / 1000)}K` : task.metrics.saves.toString(), color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-slate-700/60 p-3 text-center">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-200 dark:border-teal-800/40 p-4 text-center">
                <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">Engagement Rate</p>
                <p className="text-3xl font-bold text-teal-600">{task.metrics.engagementRate}%</p>
                <p className={`text-xs mt-1 ${task.metrics.brandConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {task.metrics.brandConfirmed ? '✓ Đã xác nhận bởi Brand' : '⏳ Chờ Brand xác nhận metrics'}
                </p>
              </div>
              {task.metrics.snapshots.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-700/80">
                        <tr className="border-b border-gray-200 dark:border-slate-600">
                          {['Thời điểm', 'Views', 'Likes', 'Comments', 'Shares', 'Saves'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {task.metrics.snapshots.map((snap, i) => (
                          <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{snap.time}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{snap.views.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{snap.likes.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{snap.comments.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{snap.shares.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{snap.saves.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showSubmitDraft} onClose={() => setShowSubmitDraft(false)} title="Gửi bản nháp nội dung" width="max-w-lg">
        <SubmitDraftForm task={task} onClose={() => setShowSubmitDraft(false)} />
      </Modal>
      <Modal isOpen={showSubmitLink} onClose={() => setShowSubmitLink(false)} title="Gửi link bài đăng" width="max-w-lg">
        <SubmitLinkForm task={task} onClose={() => setShowSubmitLink(false)} />
      </Modal>
      <Modal isOpen={showSubmitMetrics} onClose={() => setShowSubmitMetrics(false)} title="Cập nhật metrics" width="max-w-lg">
        <SubmitMetricsForm task={task} onClose={() => setShowSubmitMetrics(false)} />
      </Modal>
      <Modal isOpen={showPreviewDraft !== null} onClose={() => setShowPreviewDraft(null)} title={`Xem trước bản nháp v${showPreviewDraft !== null ? task.drafts[showPreviewDraft]?.version : ''}`} width="max-w-2xl">
        {showPreviewDraft !== null && task.drafts[showPreviewDraft] && (
          <div className="space-y-3">
            <img src={task.drafts[showPreviewDraft].image} alt="Preview" className="w-full rounded-xl" />
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{task.drafts[showPreviewDraft].caption}"</p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function StatCard({ label, value, suffix, accent }: { label: string; value: string; suffix?: string; accent?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-base font-bold ${accent === 'teal' ? 'text-teal-600' : 'text-gray-900 dark:text-white'}`}>{value}{suffix}</p>
    </div>
  );
}

function ActionCard({ icon, color, title, desc, btnLabel, onClick }: {
  icon: React.ReactNode; color: string; title: string; desc: string; btnLabel: string; onClick: () => void;
}) {
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-600',
    teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/40 text-teal-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40 text-blue-600',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 ${colors[color as keyof typeof colors]}`}>{icon}</div>
        <div>
          <p className={`text-sm font-semibold ${color === 'amber' ? 'text-amber-800 dark:text-amber-200' : color === 'teal' ? 'text-teal-800 dark:text-teal-200' : 'text-blue-800 dark:text-blue-200'}`}>{title}</p>
          <p className={`text-xs mt-0.5 ${color === 'amber' ? 'text-amber-600 dark:text-amber-400' : color === 'teal' ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'}`}>{desc}</p>
        </div>
      </div>
      <Button onClick={onClick} className={
        color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
          color === 'teal' ? 'bg-teal-600 hover:bg-teal-700' :
            'bg-blue-600 hover:bg-blue-700'
      }>
        <Upload className="w-4 h-4 mr-2" />{btnLabel}
      </Button>
    </div>
  );
}

// ─── SUBMIT DRAFT FORM ───────────────────────────────────────────────────

function SubmitDraftForm({ task, onClose }: { task: typeof kolTasks[0]; onClose: () => void }) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtag, setHashtag] = useState('#SunCareVN');
  const [previewUrl, setPreviewUrl] = useState('');
  const [captionPreview, setCaptionPreview] = useState('');

  const addFile = () => {
    const newFile = `content_draft_v${uploadedFiles.length + 1}.mp4`;
    setUploadedFiles([...uploadedFiles, newFile]);
    setPreviewUrl(`https://picsum.photos/seed/${Date.now()}/600/400`);
  };

  const removeFile = (i: number) => {
    setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i));
  };

  const goToPreview = () => {
    if (uploadedFiles.length === 0 || !caption.trim()) return;
    setCaptionPreview(caption);
    setStep('preview');
  };

  const handleSubmit = () => {
    setStep('done');
  };

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bản nháp đã được gửi!</h3>
        <p className="text-sm text-gray-500">Brand sẽ xem xét và phản hồi trong 24-48 giờ. Bạn sẽ nhận được thông báo khi có cập nhật mới.</p>
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Chiến dịch</span><span className="font-medium text-gray-900 dark:text-white">{task.campaignName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Sản phẩm</span><span className="font-medium text-gray-900 dark:text-white">{task.productName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">File đính kèm</span><span className="font-medium text-gray-900 dark:text-white">{uploadedFiles.length} file(s)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Caption</span><span className="font-medium text-teal-600 truncate max-w-[180px]">{caption}</span></div>
        </div>
        <Button onClick={onClose} className="w-full">Đóng</Button>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800/40 text-sm text-teal-700 dark:text-teal-300">
          Xem trước bản nháp trước khi gửi. Brand sẽ thấy chính xác nội dung bạn định đăng.
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-600 overflow-hidden">
          <img src={previewUrl} alt="Preview" className="w-full h-52 object-cover" />
          <div className="p-4 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Avatar initials="LB" size="sm" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentKOL.name}</p>
                <p className="text-xs text-gray-400">@{currentKOL.handle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2 whitespace-pre-wrap">{captionPreview}</p>
            <p className="text-xs text-gray-400">{hashtag}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">File đính kèm ({uploadedFiles.length})</p>
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <FileText className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{f}</span>
              <span className="text-xs text-gray-400">{(12 + i * 5).toFixed(1)} MB</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('upload')} className="flex-1">← Sửa lại</Button>
          <Button onClick={handleSubmit} className="flex-1"><Send className="w-4 h-4 mr-2" />Gửi bản nháp</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-300">
        Gửi bản nháp để Brand xem trước và phản hồi. Sau khi được duyệt, bạn sẽ nhận được thông báo để gửi link bài đăng.
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">File nội dung *</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-colors" onClick={addFile}>
          {uploadedFiles.length > 0 ? (
            <div className="space-y-3">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-center gap-2 text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-xl p-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">{f}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-red-400 hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <p className="text-xs text-gray-400">Nhấn để thêm file khác</p>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Kéo thả hoặc nhấn để tải lên video/hình ảnh</p>
              <p className="text-xs text-gray-400 mt-1">MP4, MOV, JPG tối đa 500MB</p>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Caption / Mô tả *</label>
        <textarea rows={4} value={caption} onChange={e => setCaption(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-teal-500 outline-none"
          placeholder="Viết caption bạn dự định đăng kèm nội dung..." />
        <p className="text-xs text-gray-400 mt-1">{caption.length}/2,200 ký tự</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hashtag gợi ý</label>
        <input type="text" value={hashtag} onChange={e => setHashtag(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Hủy</Button>
        <Button onClick={goToPreview} disabled={uploadedFiles.length === 0 || !caption.trim()} className="flex-1">Xem trước →</Button>
      </div>
    </div>
  );
}

// ─── SUBMIT LINK FORM ───────────────────────────────────────────────────

function SubmitLinkForm({ task, onClose }: { task: typeof kolTasks[0]; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'preview' | 'done'>('form');
  const [postUrl, setPostUrl] = useState('https://tiktok.com/@linhbeauty/video/7492837163');
  const [publishedAt, setPublishedAt] = useState('2026-06-02T15:30');
  const [screenshot, setScreenshot] = useState(false);
  const [captionPreview, setCaptionPreview] = useState('');
  const [previewImg, setPreviewImg] = useState('');

  const goToPreview = () => {
    if (!postUrl || !screenshot) return;
    setCaptionPreview(task.drafts[task.drafts.length - 1]?.caption || '');
    setPreviewImg(`https://picsum.photos/seed/${task.id}link/600/400`);
    setStep('preview');
  };

  const handleSubmit = () => { setStep('done'); };

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Link đã được gửi!</h3>
        <p className="text-sm text-gray-500">Brand đã nhận được link bài đăng. Metrics sẽ được theo dõi tự động. Bạn sẽ nhận được thanh toán sau khi hoàn tất.</p>
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Chiến dịch</span><span className="font-medium text-gray-900 dark:text-white">{task.campaignName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Link</span><span className="font-medium text-teal-600 truncate max-w-[180px]">{postUrl}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Thời gian đăng</span><span className="font-medium text-gray-900 dark:text-white">{publishedAt}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Ảnh chụp</span><span className="font-medium text-emerald-600">✓ Đã tải lên</span></div>
        </div>
        <Button onClick={onClose} className="w-full">Đóng</Button>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800/40 text-sm text-teal-700 dark:text-teal-300">
          Xem trước bài đăng đã xuất bản trước khi gửi cho Brand.
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-600 overflow-hidden">
          <img src={previewImg} alt="Post preview" className="w-full h-52 object-cover" />
          <div className="p-4 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Avatar initials="LB" size="sm" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentKOL.name}</p>
                <p className="text-xs text-gray-400">{publishedAt}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2 whitespace-pre-wrap">{captionPreview}</p>
            <div className="flex items-center gap-3 text-gray-400 text-xs mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />87,432</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />5,234</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />892</span>
              <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />1,243</span>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Link bài đăng</span><span className="text-teal-600 font-medium truncate max-w-[180px]">{postUrl}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Thời gian đăng</span><span className="text-gray-900 dark:text-white">{publishedAt}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Ảnh chụp</span><span className="text-emerald-600 font-medium">✓ Đã tải lên</span></div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('form')} className="flex-1">← Sửa lại</Button>
          <Button onClick={handleSubmit} className="flex-1"><Send className="w-4 h-4 mr-2" />Gửi cho Brand</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800/40 text-xs text-teal-700 dark:text-teal-300">
        Gửi link bài đăng đã xuất bản kèm ảnh chụp minh chứng. Brand sẽ xác nhận và bắt đầu theo dõi metrics.
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link bài đăng đã xuất bản *</label>
        <input type="url" value={postUrl} onChange={e => setPostUrl(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          placeholder="https://tiktok.com/@.../video/..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Thời gian đăng *</label>
        <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ảnh chụp bài đăng *</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-colors"
          onClick={() => setScreenshot(true)}>
          {screenshot ? (
            <div className="flex items-center justify-center gap-2 text-teal-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Đã tải lên ảnh chụp (screenshot_20260602.png)</span>
            </div>
          ) : (
            <div>
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Tải lên ảnh chụp bài đăng từ nền tảng</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG tối đa 10MB</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Hủy</Button>
        <Button onClick={goToPreview} disabled={!postUrl || !screenshot} className="flex-1">Xem trước →</Button>
      </div>
    </div>
  );
}

// ─── SUBMIT METRICS FORM ────────────────────────────────────────────────

function SubmitMetricsForm({ task, onClose }: { task: typeof kolTasks[0]; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'preview' | 'done'>('form');
  const [views, setViews] = useState(task.metrics.views > 0 ? task.metrics.views.toString() : '87432');
  const [likes, setLikes] = useState(task.metrics.likes > 0 ? task.metrics.likes.toString() : '5234');
  const [comments, setComments] = useState(task.metrics.comments > 0 ? task.metrics.comments.toString() : '892');
  const [shares, setShares] = useState(task.metrics.shares > 0 ? task.metrics.shares.toString() : '1243');
  const [saves, setSaves] = useState(task.metrics.saves > 0 ? task.metrics.saves.toString() : '2108');
  const [screenshot, setScreenshot] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('Final');

  const v = parseInt(views) || 0;
  const l = parseInt(likes) || 0;
  const co = parseInt(comments) || 0;
  const s = parseInt(shares) || 0;
  const sa = parseInt(saves) || 0;
  const er = v > 0 ? (((l + co + s + sa) / v) * 100).toFixed(2) : '0';

  const goToPreview = () => {
    if (!views || !likes || !comments || !screenshot) return;
    setStep('preview');
  };

  const handleSubmit = () => { setStep('done'); };

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Metrics đã được gửi!</h3>
        <p className="text-sm text-gray-500">Brand sẽ xác nhận số liệu. Thanh toán sẽ được xử lý sau khi metrics được duyệt. Thứ hạng của bạn sẽ được cập nhật.</p>
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Chiến dịch</span><span className="font-medium text-gray-900 dark:text-white">{task.campaignName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Views</span><span className="font-bold text-gray-900 dark:text-white">{v.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Engagement Rate</span><span className="font-bold text-blue-600">{er}%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Thời điểm</span><span className="font-medium text-gray-900 dark:text-white">{snapshotLabel}</span></div>
        </div>
        <Button onClick={onClose} className="w-full">Đóng</Button>
      </div>
    );
  }

  if (step === 'preview') {
    const targetViews = task.kpiTarget.views;
    const targetER = task.kpiTarget.engagementRate;
    const viewsPct = Math.min(Math.round((v / targetViews) * 100), 100);
    const erPct = Math.min(Math.round((parseFloat(er) / targetER) * 100), 100);

    return (
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-300">
          Xem trước metrics trước khi gửi. So sánh với KPI mà Brand đã đặt ra.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Views của bạn</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{v >= 1000 ? `${Math.round(v / 1000)}K` : v}</p>
            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
              <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${viewsPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{viewsPct}% target ({targetViews >= 1000 ? Math.round(targetViews / 1000) + 'K' : targetViews})</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Engagement Rate</p>
            <p className="text-2xl font-bold text-blue-600">{er}%</p>
            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${erPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{erPct}% target ({targetER}%)</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/80">
                <tr className="border-b border-gray-200 dark:border-slate-600">
                  {['Metric', 'Giá trị', 'KPI Target', 'Đạt'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Views', value: v, target: targetViews, color: 'text-gray-900' },
                  { label: 'Likes', value: l, target: '-', color: 'text-pink-600' },
                  { label: 'Comments', value: co, target: '-', color: 'text-blue-600' },
                  { label: 'Shares', value: s, target: '-', color: 'text-teal-600' },
                  { label: 'Saves', value: sa, target: '-', color: 'text-amber-600' },
                  { label: 'ER', value: `${er}%`, target: `${targetER}%`, color: 'text-blue-600', isString: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="px-4 py-2.5 text-gray-500">{row.label}</td>
                    <td className={`px-4 py-2.5 font-bold ${row.color}`}>{row.isString ? row.value : (row.value as number).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-gray-400">{row.target}</td>
                    <td className="px-4 py-2.5">
                      {row.isString ? (
                        <Badge label={parseFloat(er) >= targetER ? '✓ Đạt' : '⚠ Thấp'} colorClass={parseFloat(er) >= targetER ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'} />
                      ) : (
                        <Badge label={row.value === '-' ? '-' : (row.value as number) >= (row.target as number) ? '✓ Đạt' : '⚠ Thấp'}
                          colorClass={row.value === '-' || (row.value as number) >= (row.target as number) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
          <div className="w-32 h-32 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-1">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">screenshot_20260602.png — Đã tải lên</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('form')} className="flex-1">← Sửa lại</Button>
          <Button onClick={handleSubmit} className="flex-1"><Send className="w-4 h-4 mr-2" />Gửi metrics</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
        <span>Cập nhật metrics tại thời điểm hiện tại. Bạn có thể cập nhật nhiều lần (24h, 72h, 7 ngày, final).</span>
        <select value={snapshotLabel} onChange={e => setSnapshotLabel(e.target.value)}
          className="ml-2 px-2 py-1 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs">
          {['24h', '72h', '7 ngày', 'Final'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Views *', value: views, setter: setViews, placeholder: 'VD: 50000', icon: <Eye className="w-4 h-4 text-gray-400" /> },
          { label: 'Likes *', value: likes, setter: setLikes, placeholder: 'VD: 3000', icon: <Heart className="w-4 h-4 text-pink-400" /> },
          { label: 'Comments *', value: comments, setter: setComments, placeholder: 'VD: 400', icon: <MessageCircle className="w-4 h-4 text-blue-400" /> },
          { label: 'Shares', value: shares, setter: setShares, placeholder: 'VD: 200', icon: <Share2 className="w-4 h-4 text-teal-400" /> },
        ].map(f => (
          <div key={f.label} className="relative">
            <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
            <input type="number" value={f.value} onChange={e => f.setter(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder={f.placeholder} />
            <div className="absolute bottom-2.5 left-2.5">{f.icon}</div>
          </div>
        ))}
      </div>
      <div className="relative">
        <label className="block text-xs text-gray-500 mb-1">Saves</label>
        <input type="number" value={saves} onChange={e => setSaves(e.target.value)}
          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          placeholder="VD: 150" />
        <div className="absolute bottom-2.5 left-2.5"><Bookmark className="w-4 h-4 text-amber-400" /></div>
      </div>
      <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-center">
        <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">Engagement Rate tự động tính</p>
        <p className="text-3xl font-bold text-teal-600">{er}%</p>
        <p className="text-xs text-gray-400 mt-1">Target: {task.kpiTarget.engagementRate}%</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ảnh chụp minh chứng *</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-colors"
          onClick={() => setScreenshot(true)}>
          {screenshot ? (
            <div className="flex items-center justify-center gap-2 text-teal-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Đã tải lên ảnh chụp (screenshot_metrics.png)</span>
            </div>
          ) : (
            <div>
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Tải lên ảnh chụp màn hình từ nền tảng</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG tối đa 10MB</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Hủy</Button>
        <Button onClick={goToPreview} disabled={!views || !likes || !comments || !screenshot} className="flex-1">Xem trước →</Button>
      </div>
    </div>
  );
}

// ─── WALLET VIEW ────────────────────────────────────────────────────────

function WalletView() {
  const paid = kolPayments.filter(p => p.status === 'paid');
  const pending = kolPayments.filter(p => p.status === 'pending');
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ví & Thanh toán</h3>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 p-5">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Tổng đã kiếm được</p>
          <p className="text-2xl font-bold text-emerald-600">{(currentKOL.totalEarned / 1000000).toFixed(1)}M ₫</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 p-5">
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Đang chờ thanh toán</p>
          <p className="text-2xl font-bold text-amber-600">{(currentKOL.pendingPayment / 1000000).toFixed(1)}M ₫</p>
          <p className="text-xs text-gray-400 mt-1">{pending.length} khoản</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 rounded-2xl border border-teal-200/60 dark:border-teal-800/40 p-5">
          <p className="text-sm text-teal-600 dark:text-teal-400 mb-1">Đã thanh toán</p>
          <p className="text-2xl font-bold text-teal-600">{(paid.reduce((s, p) => s + p.paidAmount, 0) / 1000000).toFixed(1)}M ₫</p>
          <p className="text-xs text-gray-400 mt-1">{paid.length} khoản</p>
        </div>
      </div>

      {/* Payment table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Lịch sử thanh toán</h4>
          <Button size="sm" onClick={() => setShowWithdraw(true)}>
            <DollarSign className="w-4 h-4 mr-1.5" />Rút tiền
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                {['Chiến dịch', 'Số tiền', 'Đã nhận', 'Trạng thái', 'Ngày', 'Phương thức'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kolPayments.map(p => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/20">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.campaignName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{p.amount.toLocaleString()}₫</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{p.paidAmount.toLocaleString()}₫</td>
                  <td className="px-6 py-4">
                    <Badge label={paymentStatusLabels[p.status]} colorClass={
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    } />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.date || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5"><Wallet className="w-4 h-4" />Thông tin nhận tiền</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Ngân hàng</span><span className="font-medium text-gray-900 dark:text-white">{currentKOL.bankName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Số tài khoản</span><span className="font-medium text-gray-900 dark:text-white">{currentKOL.bankAccount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tên tài khoản</span><span className="font-medium text-gray-900 dark:text-white">{currentKOL.bankHolder}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">QR thanh toán</span>
            <Badge label={currentKOL.qrUploaded ? 'Đã tải' : 'Chưa tải'} colorClass={currentKOL.qrUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'} />
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Rút tiền" width="max-w-md">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-sm text-amber-700 dark:text-amber-300">
            Số dư khả dụng: <span className="font-bold">{(currentKOL.pendingPayment / 1000000).toFixed(1)}M ₫</span>. Yêu cầu rút tiền sẽ được xử lý trong 1-3 ngày làm việc.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Số tiền muốn rút (₫)</label>
            <input type="number" defaultValue={currentKOL.pendingPayment} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowWithdraw(false)}>Hủy</Button>
            <Button onClick={() => setShowWithdraw(false)}>
              <Send className="w-4 h-4 mr-2" />Gửi yêu cầu rút tiền
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

// ─── PROFILE VIEW ───────────────────────────────────────────────────────

function ProfileView({ onBack }: { onBack: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [qrUploaded, setQrUploaded] = useState(currentKOL.qrUploaded);
  const [profileData, setProfileData] = useState({
    name: currentKOL.name,
    bio: currentKOL.bio,
    contentCategory: currentKOL.contentCategory,
    platform: currentKOL.platform,
    followers: currentKOL.followersDisplay,
    email: currentKOL.email,
    tiktok: currentKOL.tiktok,
    instagram: currentKOL.instagram,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>← Quay lại</Button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hồ sơ</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar initials={currentKOL.avatar} size="lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profileData.name}</h3>
            <p className="text-sm text-gray-500">{currentKOL.handle} • {currentKOL.platform}</p>
            <div className="flex gap-2 mt-2">
              <Badge label={profileData.contentCategory} colorClass="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" />
              <Badge label={`#${currentKOL.currentRank} Top KOL`} colorClass="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Eye className="w-4 h-4" />, label: 'Followers', value: profileData.followers },
              { icon: <TrendingUp className="w-4 h-4" />, label: 'Engagement', value: `${currentKOL.engagementRate}%` },
              { icon: <DollarSign className="w-4 h-4" />, label: 'Đã kiếm được', value: `${(currentKOL.totalEarned / 1000000).toFixed(1)}M` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500">{item.icon}<span className="text-sm">{item.label}</span></div>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Thông tin cá nhân</h4>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <><X className="w-4 h-4 mr-1.5" />Hủy</> : <><Edit3 className="w-4 h-4 mr-1.5" />Chỉnh sửa</>}
            </Button>
          </div>

          {/* Bio */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Giới thiệu</h4>
            {isEditing ? (
              <textarea rows={3} value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none" />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">{profileData.bio}</p>
            )}
          </div>

          {/* Category & Platform */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Thông tin nền tảng</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Lĩnh vực nội dung</label>
                {isEditing ? (
                  <select value={profileData.contentCategory} onChange={e => setProfileData({ ...profileData, contentCategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
                    {['Chăm sóc da', 'Làm đẹp', 'Thể hình', 'Ẩm thực', 'Công nghệ', 'Du lịch'].map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profileData.contentCategory}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nền tảng chính</label>
                {isEditing ? (
                  <select value={profileData.platform} onChange={e => setProfileData({ ...profileData, platform: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
                    {['TikTok', 'Instagram', 'YouTube', 'Facebook'].map(p => <option key={p}>{p}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profileData.platform}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Liên kết mạng xã hội</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email liên hệ</label>
                {isEditing ? (
                  <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="email@example.com" />
                ) : (
                  <a href={`mailto:${profileData.email}`} className="text-sm text-teal-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />{profileData.email}
                  </a>
                )}
              </div>
              {[
                { label: 'TikTok', value: profileData.tiktok },
                { label: 'Instagram', value: profileData.instagram },
              ].map(link => (
                <div key={link.label}>
                  <label className="block text-xs text-gray-500 mb-1">{link.label}</label>
                  {isEditing ? (
                    <input type="url" value={link.value} onChange={e => setProfileData({ ...profileData, [link.label.toLowerCase()]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
                  ) : (
                    <a href={link.value} className="text-sm text-teal-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />{link.value}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* QR Payment */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5"><QrCode className="w-4 h-4" />Mã QR thanh toán</h4>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-colors"
              onClick={() => setQrUploaded(!qrUploaded)}>
              {qrUploaded ? (
                <div>
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <QrCode className="w-12 h-12 text-teal-500" />
                  </div>
                  <p className="text-sm text-teal-600 font-medium">QR đã được tải lên</p>
                  <p className="text-xs text-gray-400 mt-1">Nhấn để thay thế</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Tải lên mã QR thanh toán</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG tối đa 5MB</p>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(false)}>
                <Check className="w-4 h-4 mr-2" />Lưu thay đổi
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}