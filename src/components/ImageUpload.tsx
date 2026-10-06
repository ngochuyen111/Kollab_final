import { useId, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { getErrorMessage } from '../constants/domain';
export function ImageUpload({ label, value, onChange, folder, onBusyChange }: {
  label: string; value: string; onChange: (url: string) => void;
  folder: 'avatars' | 'products' | 'brand-logos'; onBusyChange: (busy: boolean) => void;
}) {
  const id = useId(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const upload = async (file?: File) => {
    if (!file) return;
    try { setBusy(true); onBusyChange(true); setError(''); onChange(await storageService.uploadImage(file, folder)); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); onBusyChange(false); }
  };
  return <div><label className="input-label" htmlFor={id}>{label}</label><div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">{value ? <img className="w-16 h-16 object-cover rounded-xl shrink-0" src={value} alt={label} /> : <div className="w-16 h-16 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center"><ImagePlus className="text-teal-600 w-6 h-6" /></div>}<div className="min-w-0 flex-1 basis-48"><input id={id} disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:px-3 file:py-2 file:font-semibold" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /><p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP · tối đa 5 MB</p>{busy && <p className="text-sm text-teal-600 flex items-center gap-2 mt-2"><Loader2 className="w-4 h-4 animate-spin" />Đang upload…</p>}</div></div>{error && <p role="alert" className="text-red-500 text-sm mt-2">{error}</p>}<details className="mt-2"><summary className="text-xs cursor-pointer text-slate-500">Hoặc sử dụng URL ảnh</summary><input aria-label={`${label} URL`} type="url" disabled={busy} className="input-base mt-2" value={value} onChange={e => onChange(e.target.value)} /></details></div>;
}
