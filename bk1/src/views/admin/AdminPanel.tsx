import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Briefcase, CreditCard, Package, Users } from 'lucide-react';
import { KPIWidget, SectionHeader, tableStyles } from '../../components/SharedUI';
import { brandService, type BrandWithUser } from '../../services/brandService';
import { campaignService } from '../../services/campaignService';
import { kolService } from '../../services/kolService';
import { paymentService, type PaymentWithRelations } from '../../services/paymentService';
import { productService } from '../../services/productService';
import { formatCurrency, formatDate, getErrorMessage, paymentStatusLabels, statusBadgeClass } from '../../constants/domain';
import type { CampaignWithRelations, KolWithUser, Product } from '../../types/database';

interface Props { initialView?: string }

export function AdminDashboard({ initialView = 'dashboard' }: Props) {
  const [brands, setBrands] = useState<BrandWithUser[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
  const [creators, setCreators] = useState<KolWithUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [brandRows, campaignRows, creatorRows, productRows, paymentRows] = await Promise.all([
        brandService.getAll(), campaignService.getAll(), kolService.getAll(), productService.getAll(), paymentService.getAll(),
      ]);
      setBrands(brandRows); setCampaigns(campaignRows); setCreators(creatorRows); setProducts(productRows); setPayments(paymentRows);
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const paid = useMemo(() => payments.reduce((sum, p) => sum + p.paid_amount, 0), [payments]);
  if (loading) return <div className="skeleton h-96" />;
  if (error) return <div className="badge-danger p-4">{error}<button onClick={() => void load()} className="ml-3 underline">Tải lại</button></div>;

  if (initialView === 'brands') return <EntityTable title="Brands" headers={['Brand', 'Người phụ trách', 'Ngành', 'Website', 'Trạng thái']} rows={brands.map(b => [b.brand_name, b.users?.full_name ?? '—', b.industry ?? '—', b.website_url ?? '—', b.status])} />;
  if (initialView === 'campaigns') return <EntityTable title="Chiến dịch toàn hệ thống" headers={['Chiến dịch', 'Brand', 'Sản phẩm', 'Kết thúc', 'Trạng thái']} rows={campaigns.map(c => [c.campaign_name, c.brands?.brand_name ?? '—', c.products?.product_name ?? '—', formatDate(c.end_date), c.status])} />;
  if (initialView === 'creators') return <EntityTable title="KOL/KOC" headers={['Họ tên', 'Vai trò', 'Nền tảng', 'Followers', 'Chuyên mục']} rows={creators.map(k => [k.users?.full_name ?? '—', k.users?.role ?? '—', k.platform ?? '—', k.followers.toLocaleString(), k.content_category ?? '—'])} />;
  if (initialView === 'payments') return <EntityTable title="Thanh toán toàn hệ thống" headers={['KOL/KOC', 'Brand', 'Số tiền', 'Đã trả', 'Trạng thái']} rows={payments.map(p => [p.kol_profiles?.users?.full_name ?? '—', p.brands?.brand_name ?? '—', formatCurrency(p.amount), formatCurrency(p.paid_amount), paymentStatusLabels[p.status]])} />;

  return <div className="space-y-6"><SectionHeader title="Tổng quan hệ thống" subtitle="Dữ liệu quản trị trực tiếp từ Supabase" /><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"><KPIWidget role="admin" label="Brands" value={String(brands.length)} icon={<Briefcase className="w-4 h-4" />} /><KPIWidget role="admin" label="Sản phẩm" value={String(products.length)} icon={<Package className="w-4 h-4" />} /><KPIWidget role="admin" label="Chiến dịch" value={String(campaigns.length)} icon={<Activity className="w-4 h-4" />} /><KPIWidget role="admin" label="KOL/KOC" value={String(creators.length)} icon={<Users className="w-4 h-4" />} /><KPIWidget role="admin" label="Đã thanh toán" value={formatCurrency(paid)} icon={<CreditCard className="w-4 h-4" />} /></div><EntityTable title="Chiến dịch gần đây" headers={['Chiến dịch', 'Brand', 'Sản phẩm', 'Trạng thái']} rows={campaigns.slice(0, 8).map(c => [c.campaign_name, c.brands?.brand_name ?? '—', c.products?.product_name ?? '—', c.status])} /></div>;
}

function EntityTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return <div><SectionHeader title={title} subtitle={`${rows.length} bản ghi`} /><div className={`${tableStyles.wrapper} bg-white dark:bg-slate-800`}><table className="w-full"><thead className={tableStyles.thead}><tr>{headers.map(h => <th className={tableStyles.th} key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr className={tableStyles.tr} key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td className={tableStyles.td} key={`${cell}-${cellIndex}`}>{cellIndex === row.length - 1 && /^[A-Z_]+$/.test(cell) ? <span className={statusBadgeClass(cell)}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <div className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu</div>}</div></div>;
}
