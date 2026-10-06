import type { CampaignWithRelations, PerformanceMetric, TaskWithRelations } from '../types/database';

export const compactNumber = (value: number) => { const scale = Math.abs(value) >= 1e9 ? 1e9 : Math.abs(value) >= 1e6 ? 1e6 : Math.abs(value) >= 1e3 ? 1e3 : 1; return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value / scale) + ({ 1: '', 1000: 'K', 1000000: 'M', 1000000000: 'B' }[scale] ?? ''); };
export const amount = (value: unknown): number => Number(value) || 0;
export const interactionCount = (metric: PerformanceMetric) => amount(metric.likes) + amount(metric.comments) + amount(metric.shares) + amount(metric.saves);
export const completeStatuses = new Set(['COMPLETED', 'METRICS_APPROVED', 'PAYMENT_PENDING', 'PAID']);
export function latestMetric(task: TaskWithRelations, verifiedOnly = true): PerformanceMetric | undefined {
  return [...(task.performance_metrics ?? [])]
    .filter(m => verifiedOnly ? m.status === 'APPROVED' : m.status !== 'REJECTED')
    .sort((a, b) => Date.parse(b.submitted_at) - Date.parse(a.submitted_at) || b.id - a.id)[0];
}
export function taskOutcome(task: TaskWithRelations, verifiedOnly = true) {
  const metric = latestMetric(task, verifiedOnly);
  return { task, metric, views: amount(metric?.views), engagement: metric ? interactionCount(metric) : 0,
    paid: (task.payments ?? []).reduce((sum, p) => sum + amount(p.paid_amount), 0) };
}
export function campaignOutcome(campaign: CampaignWithRelations, allTasks: TaskWithRelations[], verifiedOnly = true) {
  const tasks = allTasks.filter(t => t.campaign_id === campaign.id);
  const active = tasks.filter(t => t.status !== 'CANCELLED').map(t => taskOutcome(t, verifiedOnly));
  const views = active.reduce((sum, t) => sum + t.views, 0);
  const engagement = active.reduce((sum, t) => sum + t.engagement, 0);
  const paid = tasks.reduce((sum, t) => sum + (t.payments ?? []).reduce((s, p) => s + amount(p.paid_amount), 0), 0);
  const committed = active.reduce((sum, t) => sum + amount(t.task.payment_amount), 0);
  const hasMetrics = active.some(t => t.metric);
  return { campaign, tasks, rows: active, views, engagement, paid, committed, hasMetrics,
    er: views > 0 ? engagement / views * 100 : 0,
    outstanding: active.reduce((sum, row) => sum + Math.max(0, amount(row.task.payment_amount) - row.paid), 0),
    completed: active.filter(t => completeStatuses.has(t.task.status)).length,
    published: active.filter(t => (t.task.published_posts?.length ?? 0) > 0).length,
    targetProgress: campaign.target_views > 0 ? views / campaign.target_views * 100 : null,
    cpv: views > 0 && paid > 0 ? paid / views : null,
    cpe: engagement > 0 && paid > 0 ? paid / engagement : null,
  };
}
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (value: string | number) => {
    const text = String(value);
    const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const blob = new Blob(['\uFEFF' + rows.map(r => r.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
