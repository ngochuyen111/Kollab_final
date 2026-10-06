import { Filter, Search, RotateCcw } from 'lucide-react';
export type FilterValues = { query: string; status: string; campaign: string; creator: string; product: string; days: string };
import { emptyFilters } from '../constants/filters';
export type FilterOption = { value: string; label: string };
export function FilterBar({ value, onChange, statuses, campaigns, creators, products, showTime = false, count }: {
  value: FilterValues; onChange: (value: FilterValues) => void; statuses?: FilterOption[];
  campaigns?: FilterOption[]; creators?: FilterOption[]; products?: FilterOption[]; showTime?: boolean; count?: number;
}) {
  const select = (key: keyof FilterValues, label: string, options?: FilterOption[]) => options && <select key={key} aria-label={label} className="input-base min-w-48 flex-1" value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value })}><option value="">{label}</option>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  return <div className="card-base p-4 mb-6 flex flex-wrap items-center gap-3"><Filter className="w-4 h-4 text-teal-600 shrink-0" /><div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input aria-label="Tìm kiếm" className="input-base pl-9" placeholder="Tìm kiếm…" value={value.query} onChange={e => onChange({ ...value, query: e.target.value })} /></div>{select('status', 'Tất cả trạng thái', statuses)}{select('campaign', 'Tất cả chiến dịch', campaigns)}{select('creator', 'Tất cả KOL/KOC', creators)}{select('product', 'Tất cả sản phẩm', products)}{showTime && select('days', 'Tất cả thời gian', [{ value: '30', label: '30 ngày gần nhất' }, { value: '90', label: '90 ngày gần nhất' }])}<button type="button" className="btn-ghost" onClick={() => onChange({ ...emptyFilters })} title="Xóa bộ lọc"><RotateCcw className="w-4 h-4" /></button>{count !== undefined && <span className="text-xs text-slate-400">{count} kết quả</span>}</div>;
}
