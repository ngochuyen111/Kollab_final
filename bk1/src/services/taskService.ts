import { supabase } from '../lib/supabase';
import type { CampaignTask, CreateInput, TaskStatus, TaskWithRelations, UpdateInput } from '../types/database';

const selectRelations = `
  *, campaigns(*, products(id, product_name, image_url, price), brands(id, brand_name, logo_url)),
  kol_profiles(*, users(id, full_name, email, avatar_url, role)),
  draft_submissions(*), published_posts(*), performance_metrics(*), payments(*)
`;

export const taskService = {
  async getAll(): Promise<TaskWithRelations[]> {
    const { data, error } = await supabase.from('campaign_tasks').select(selectRelations).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TaskWithRelations[];
  },
  async getById(id: number): Promise<TaskWithRelations> {
    const { data, error } = await supabase.from('campaign_tasks').select(selectRelations).eq('id', id).single();
    if (error) throw error;
    return data as TaskWithRelations;
  },
  async create(input: CreateInput<CampaignTask>): Promise<CampaignTask> {
    const { data, error } = await supabase.from('campaign_tasks').insert(input).select().single();
    if (error) throw error;
    return data as CampaignTask;
  },
  createTask(input: CreateInput<CampaignTask>) { return this.create({ ...input, status: 'ASSIGNED' }); },
  async update(id: number, input: UpdateInput<CampaignTask>): Promise<CampaignTask> {
    const { data, error } = await supabase.from('campaign_tasks').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as CampaignTask;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('campaign_tasks').delete().eq('id', id);
    if (error) throw error;
  },
  async getTasksByCampaign(campaignId: number): Promise<TaskWithRelations[]> {
    const { data, error } = await supabase.from('campaign_tasks').select(selectRelations).eq('campaign_id', campaignId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TaskWithRelations[];
  },
  async getTasksByKol(kolProfileId: number): Promise<TaskWithRelations[]> {
    const { data, error } = await supabase.from('campaign_tasks').select(selectRelations).eq('kol_profile_id', kolProfileId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TaskWithRelations[];
  },
  getTasksByKOL(kolProfileId: number) { return this.getTasksByKol(kolProfileId); },
  updateTaskStatus(taskId: number, status: TaskStatus) { return this.update(taskId, { status }); },
};
