import { supabase } from '../lib/supabase';
import type { CreateInput, DraftStatus, DraftSubmission, UpdateInput } from '../types/database';
import { insertWithSafeId } from './safeInsert';

export interface DraftWithTask extends DraftSubmission {
  campaign_tasks: {
    id: number; campaign_id: number; kol_profile_id: number;
    campaigns: { campaign_name: string; brand_id: number } | null;
    kol_profiles: { users: { full_name: string; avatar_url: string | null } | null } | null;
  } | null;
}
const selectTask = '*, campaign_tasks(id, campaign_id, kol_profile_id, campaigns(campaign_name, brand_id), kol_profiles(users(full_name, avatar_url)))';

export const draftService = {
  async getAll(): Promise<DraftWithTask[]> {
    const { data, error } = await supabase.from('draft_submissions').select(selectTask).order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DraftWithTask[];
  },
  async getById(id: number): Promise<DraftWithTask> {
    const { data, error } = await supabase.from('draft_submissions').select(selectTask).eq('id', id).single();
    if (error) throw error;
    return data as DraftWithTask;
  },
  async create(input: CreateInput<DraftSubmission>): Promise<DraftSubmission> {
    const data = await insertWithSafeId<DraftSubmission>('draft_submissions', input);
    const taskUpdate = await supabase.from('campaign_tasks').update({ status: 'DRAFT_SUBMITTED' }).eq('id', input.task_id);
    if (taskUpdate.error) throw taskUpdate.error;
    return data;
  },
  submitDraft(input: Omit<CreateInput<DraftSubmission>, 'status' | 'feedback' | 'submitted_at' | 'reviewed_at' | 'reviewed_by'>) {
    return this.create({ ...input, status: 'SUBMITTED', feedback: null, submitted_at: new Date().toISOString(), reviewed_at: null, reviewed_by: null });
  },
  async update(id: number, input: UpdateInput<DraftSubmission>): Promise<DraftSubmission> {
    const { data, error } = await supabase.from('draft_submissions').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as DraftSubmission;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('draft_submissions').delete().eq('id', id);
    if (error) throw error;
  },
  async getDraftByTask(taskId: number): Promise<DraftSubmission[]> {
    const { data, error } = await supabase.from('draft_submissions').select('*').eq('task_id', taskId).order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DraftSubmission[];
  },
  async getSubmittedByBrand(brandId: number): Promise<DraftWithTask[]> {
    const rows = await this.getAll();
    return rows.filter(row => row.status === 'SUBMITTED' && row.campaign_tasks?.campaigns?.brand_id === brandId);
  },
  async reviewDraft(id: number, status: Exclude<DraftStatus, 'SUBMITTED'>, feedback: string, reviewerId: number): Promise<DraftSubmission> {
    const draft = await this.update(id, { status, feedback, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() });
    const taskStatus = status === 'APPROVED' ? 'APPROVED_TO_PUBLISH' : 'REVISION_REQUIRED';
    const { error } = await supabase.from('campaign_tasks').update({ status: taskStatus }).eq('id', draft.task_id);
    if (error) throw error;
    return draft;
  },
};
