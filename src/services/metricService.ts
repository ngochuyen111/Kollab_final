import { supabase } from '../lib/supabase';
import type { CreateInput, MetricStatus, PerformanceMetric, UpdateInput } from '../types/database';
import { insertWithSafeId } from './safeInsert';

export interface MetricWithTask extends PerformanceMetric {
  campaign_tasks: {
    id: number; payment_amount: number; kol_profile_id: number;
    campaigns: { campaign_name: string; brand_id: number } | null;
    kol_profiles: { users: { full_name: string; avatar_url: string | null } | null } | null;
  } | null;
}
type MetricCreateInput = Omit<CreateInput<PerformanceMetric>, 'engagement' | 'engagement_rate'>;
const selectTask = '*, campaign_tasks(id, payment_amount, kol_profile_id, campaigns(campaign_name, brand_id), kol_profiles(users(full_name, avatar_url)))';

export const metricService = {
  async getAll(): Promise<MetricWithTask[]> {
    const { data, error } = await supabase.from('performance_metrics').select(selectTask).order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as MetricWithTask[];
  },
  async getById(id: number): Promise<MetricWithTask> {
    const { data, error } = await supabase.from('performance_metrics').select(selectTask).eq('id', id).single();
    if (error) throw error;
    return data as MetricWithTask;
  },
  async create(input: MetricCreateInput): Promise<PerformanceMetric> {
    const data = await insertWithSafeId<PerformanceMetric>('performance_metrics', input);
    const taskUpdate = await supabase.from('campaign_tasks').update({ status: 'METRICS_SUBMITTED' }).eq('id', input.task_id);
    if (taskUpdate.error) throw taskUpdate.error;
    return data;
  },
  submitMetric(input: Omit<MetricCreateInput, 'status' | 'feedback' | 'submitted_at' | 'reviewed_at' | 'reviewed_by'>) {
    return this.create({ ...input, status: 'SUBMITTED', feedback: null, submitted_at: new Date().toISOString(), reviewed_at: null, reviewed_by: null });
  },
  async update(id: number, input: UpdateInput<PerformanceMetric>): Promise<PerformanceMetric> {
    const { data, error } = await supabase.from('performance_metrics').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as PerformanceMetric;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('performance_metrics').delete().eq('id', id);
    if (error) throw error;
  },
  async getMetricsByTask(taskId: number): Promise<PerformanceMetric[]> {
    const { data, error } = await supabase.from('performance_metrics').select('*').eq('task_id', taskId).order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PerformanceMetric[];
  },
  async getByBrand(brandId: number): Promise<MetricWithTask[]> {
    const rows = await this.getAll();
    return rows.filter(row => row.campaign_tasks?.campaigns?.brand_id === brandId);
  },
  async review(id: number, status: Exclude<MetricStatus, 'SUBMITTED'>, feedback: string, reviewerId: number): Promise<PerformanceMetric> {
    const metric = await this.update(id, { status, feedback, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() });
    const task = await supabase.from('campaign_tasks').select('id, kol_profile_id, payment_amount, campaigns(brand_id)').eq('id', metric.task_id).single();
    if (task.error) throw task.error;
    if (status === 'REJECTED') {
      const rejected = await supabase.from('campaign_tasks').update({ status: 'TRACKING' }).eq('id', metric.task_id);
      if (rejected.error) throw rejected.error;
      return metric;
    }
    const completed = await supabase.from('campaign_tasks').update({ status: 'COMPLETED' }).eq('id', metric.task_id);
    if (completed.error) throw completed.error;
    const campaign = task.data.campaigns as unknown as { brand_id: number } | null;
    const existing = await supabase.from('payments').select('id').eq('task_id', metric.task_id).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data && campaign) {
      await insertWithSafeId('payments', {
        task_id: metric.task_id, brand_id: campaign.brand_id, kol_profile_id: task.data.kol_profile_id,
        amount: Number(task.data.payment_amount ?? 0), paid_amount: 0, status: 'PENDING',
        payment_note: 'Metrics đã được Brand xác minh',
      });
    }
    return metric;
  },
};
