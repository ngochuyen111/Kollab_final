import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Check, XCircle, DollarSign, Eye, Heart, MessageCircle, Package, Plus, Target, TrendingUp, Users, Award, QrCode } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { KPIWidget, Badge, Button, Modal } from '../../../components/SharedUI';
import { brands, campaigns, kols, kolRankings, payments, tasks, campaignStatusLabels, paymentStatusLabels, taskStatusLabels, taskStatusColors, type TaskStatus } from '../../../data/mockData';

const currentBrandId = 'b1';
const currentBrand = brands.find(b => b.id === currentBrandId) || brands[0];

export function BrandOverviewSection() {
  const [reviewModal, setReviewModal] = useState<typeof pendingReviews[0] | null>(null);
  const [qrModal, setQrModal] = useState<typeof pendingPayments[0] | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<Set<string>>(new Set());
  const [paidPayments, setPaidPayments] = useState<Set<string>>(new Set());

  const visibleReviews = pendingReviews.filter(t => !approvedReviews.has(t.id));
  const visiblePayments = pendingPayments.filter(p => !paidPayments.has(p.id));
  const brandCampaigns = campaigns.filter(c => c.brandId === currentBrandId);
  const brandTasks = tasks.filter(t => brandCampaigns.some(c => c.id === t.campaignId));
  const brandPayments = payments.filter(p => brandTasks.some(t => t.id === p.taskId));
  const brandKOLs = kols.filter(k => brandCampaigns.some(c => c.assignedKOLs.includes(k.id)));
  const completedTasks = brandTasks.filter(t => ['completed', 'payment_pending', 'paid'].includes(t.status)).length;
  const topKOL = kolRankings.find(r => brandTasks.some(t => t.kolId === r.kolId));
  const totalViews = brandCampaigns.reduce((s, c) => s + c.totalViews, 0);
  const totalEngagement = brandCampaigns.reduce((s, c) => s + Math.round(c.totalViews * (c.avgEngagementRate / 100)), 0);
  const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : '0.0';
  const conversionRate = (brandCampaigns.reduce((s, c) => s + (c.totalConversions || 0), 0) / Math.max(totalViews, 1) * 100).toFixed(1);
  const avgViews = brandCampaigns.length > 0 ? Math.round(totalViews / brandCampaigns.length) : 0;
  const campaignStatusData = [
    { name: 'Bản nháp', value: brandCampaigns.filter(c => c.status === 'draft').length, color: '#64748b' },
    { name: 'Đang chạy', value: brandCampaigns.filter(c => c.status === 'active').length, color: '#55B3D9' },
    { name: 'Tracking', value: brandCampaigns.filter(c => c.status === 'tracking').length, color: '#73C6D9' },
    { name: 'Hoàn thành', value: brandCampaigns.filter(c => c.status === 'completed').length, color: '#88E8F2' },
    { name: 'Đã hủy', value: brandCampaigns.filter(c => c.status === 'cancelled').length, color: '#94a3b8' },
  ];
  const trendData = brandCampaigns.slice(0, 6).map((c, index) => ({
    name: c.name.split(' ').slice(0, 2).join(' '),
    views: Math.round(c.totalViews * (0.78 + index * 0.05)),
    conversions: Math.round((c.totalConversions || 0) * (0.8 + index * 0.04)),
  }));
  const recentTasks = brandTasks.slice(0, 5);
  const pendingReviews = brandTasks.filter(t => t.status === 'draft_submitted' || t.status === 'revision_required').slice(0, 5);
  const pendingPayments = brandPayments.filter(p => p.status === 'pending' || p.status === 'partial_paid' || p.status === 'hold').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        <KPIWidget label="Total Views" value={totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : `${Math.round(totalViews / 1000)}K`} icon={<Eye className="w-5 h-5" />} />
        <KPIWidget label="Average Views" value={avgViews >= 1000 ? `${Math.round(avgViews / 1000)}K` : avgViews.toString()} icon={<TrendingUp className="w-5 h-5" />} accent="from-blue-500/10 to-blue-600/5" />
        <KPIWidget label="Total Engagement" value={`${Math.round(totalEngagement / 1000)}K`} icon={<Heart className="w-5 h-5" />} accent="from-pink-500/10 to-pink-600/5" />
        <KPIWidget label="Engagement Rate" value={`${engagementRate}%`} icon={<MessageCircle className="w-5 h-5" />} accent="from-teal-500/10 to-teal-600/5" />
        <KPIWidget label="Conversion Rate" value={`${conversionRate}%`} icon={<Target className="w-5 h-5" />} accent="from-emerald-500/10 to-emerald-600/5" />
        <KPIWidget label="Assigned KOL/KOC" value={brandKOLs.length.toString()} icon={<Users className="w-5 h-5" />} accent="from-violet-500/10 to-violet-600/5" />
        <KPIWidget label="Task Progress" value={`${completedTasks}/${brandTasks.length}`} icon={<CheckCircle2 className="w-5 h-5" />} accent="from-amber-500/10 to-amber-600/5" />
        <KPIWidget label="Top KOL" value={topKOL?.kolName || '-'} icon={<Award className="w-5 h-5" />} accent="from-cyan-500/10 to-cyan-600/5" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Campaign Status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={campaignStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {campaignStatusData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Campaign Performance Trend</h3>
            <span className="text-xs text-slate-500">Views & Conversions</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#55B3D9" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="conversions" stroke="#88E8F2" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Campaigns</h3>
            <Badge label={`${brandCampaigns.length} total`} colorClass="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" />
          </div>
          <div className="space-y-3">{brandCampaigns.slice(0, 5).map(c => <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 px-4 py-3"><div><p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p><p className="text-xs text-slate-500">{c.productName}</p></div><Badge label={campaignStatusLabels[c.status]} colorClass={c.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'} /></div>)}</div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Creator Activities</h3>
          <div className="space-y-3">{recentTasks.map(t => <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 px-4 py-3"><div><p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p><p className="text-xs text-slate-500">{t.campaignName}</p></div><Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} /></div>)}</div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Pending Reviews</h3>
          <div className="space-y-3">{visibleReviews.length > 0 ? visibleReviews.map(t => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p>
                <p className="text-xs text-slate-500">{t.campaignName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
                <Button size="sm" variant="secondary" onClick={() => setReviewModal(t)} className="!px-2.5 !py-1">
                  <Check className="w-3 h-3 mr-1" />Duyệt
                </Button>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">Không có bài chờ duyệt.</p>}</div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Pending Payments</h3>
          <div className="space-y-3">{visiblePayments.length > 0 ? visiblePayments.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{p.kolName}</p>
                <p className="text-xs text-slate-500">{p.campaignName} — {p.totalAmount.toLocaleString()} VND</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={paymentStatusLabels[p.status]} colorClass={p.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : p.status === 'hold' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'} />
                <Button size="sm" variant="secondary" onClick={() => setQrModal(p)} className="!px-2.5 !py-1">
                  <QrCode className="w-3 h-3 mr-1" />QR
                </Button>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">Không có thanh toán chờ.</p>}</div>
        </div>
      </div>

      {/* Demo: Review Approval Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Phê duyệt nội dung" width="max-w-md">
        {reviewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-700/40 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{reviewModal.kolName.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{reviewModal.kolName}</p>
                <p className="text-xs text-slate-500">{reviewModal.campaignName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Nền tảng</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.kolPlatform}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Nhiệm vụ</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.productName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Yêu cầu</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.contentRequirements?.slice(0, 50)}...</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">KPI Views</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.kpiTarget?.views.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">KPI Engagement</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.kpiTarget?.engagementRate}%</span></div>
            </div>
            <div className="p-3 bg-purple-50/80 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs text-purple-700 dark:text-purple-300">
              Demo: Nhấn "Phê duyệt" để xác nhận nội dung và cho phép KOL đăng bài.
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setReviewModal(null)}><XCircle className="w-4 h-4 mr-2" />Từ chối</Button>
              <Button className="flex-1" onClick={() => { setApprovedReviews(prev => new Set([...prev, reviewModal.id])); setReviewModal(null); }}>
                <Check className="w-4 h-4 mr-2" />Phê duyệt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Demo: QR Payment Modal */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title="QR Thanh toán" width="max-w-sm">
        {qrModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-700/40 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{qrModal.kolName.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{qrModal.kolName}</p>
                <p className="text-xs text-slate-500">{qrModal.kolPlatform}</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="p-3 bg-white rounded-2xl border-4 border-slate-900 dark:border-white shadow-lg">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <rect width="180" height="180" fill="white" />
                  <rect x="10" y="10" width="40" height="40" fill="black" />
                  <rect x="130" y="10" width="40" height="40" fill="black" />
                  <rect x="10" y="130" width="40" height="40" fill="black" />
                  <rect x="20" y="20" width="20" height="20" fill="white" />
                  <rect x="140" y="20" width="20" height="20" fill="white" />
                  <rect x="20" y="140" width="20" height="20" fill="white" />
                  <rect x="30" y="30" width="20" height="20" fill="black" />
                  <rect x="150" y="30" width="20" height="20" fill="black" />
                  <rect x="30" y="150" width="20" height="20" fill="black" />
                  {[0,1,2,3,4,5,6].flatMap(i =>
                    [0,1,2,3,4,5,6].map(j =>
                      (i + j) % 2 === 0 && i > 1 && i < 5 && j > 1 && j < 5 ? null :
                      (i >= 6 || j >= 6) ? null :
                      <rect key={`${i}-${j}`} x={60 + i * 10} y={60 + j * 10} width="10" height="10" fill={(i * 7 + j * 13) % 2 === 0 ? 'black' : 'white'} />
                    )
                  )}
                  {[0,1,2,3,4].flatMap(i =>
                    [0,1,2,3,4].map(j =>
                      <rect key={`r2-${i}-${j}`} x={60 + i * 10} y={60 + j * 10} width="10" height="10" fill={(i + j) % 3 === 0 ? 'black' : 'white'} />
                    )
                  )}
                  <rect x="60" y="60" width="50" height="50" fill="white" />
                  {[[70,70],[70,80],[70,90],[80,70],[80,80],[80,90],[90,70],[90,80],[90,90]].map(([rx,ry], idx) =>
                    <rect key={idx} x={rx} y={ry} width="10" height="10" fill="black" />
                  )}
                  <rect x="60" y="60" width="50" height="50" fill="none" stroke="black" strokeWidth="5" />
                  <rect x="65" y="65" width="40" height="40" fill="black" />
                  <rect x="70" y="70" width="30" height="30" fill="white" />
                  <rect x="75" y="75" width="20" height="20" fill="black" />
                </svg>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xs text-slate-500">Số tiền thanh toán</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{qrModal.totalAmount.toLocaleString()} VND</p>
              <p className="text-xs text-slate-500">{qrModal.invoiceNumber || `INV-PENDING-${qrModal.id}`}</p>
            </div>
            <div className="p-3 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-300">
              ⚠️ Đây là QR thanh toán demo ảo. Không quét thực.
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setQrModal(null)}>Đóng</Button>
              <Button className="flex-1" onClick={() => { setPaidPayments(prev => new Set([...prev, qrModal.id])); setQrModal(null); }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />Xác nhận thanh toán
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
