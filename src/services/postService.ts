import { supabase } from '../lib/supabase';
import type { CreateInput, PublishedPost, UpdateInput } from '../types/database';
import { insertWithSafeId } from './safeInsert';

export const postService = {
  async getAll(): Promise<PublishedPost[]> {
    const { data, error } = await supabase.from('published_posts').select('*').order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PublishedPost[];
  },
  async getById(id: number): Promise<PublishedPost> {
    const { data, error } = await supabase.from('published_posts').select('*').eq('id', id).single();
    if (error) throw error;
    return data as PublishedPost;
  },
  async create(input: CreateInput<PublishedPost>): Promise<PublishedPost> {
    const existing = await supabase.from('published_posts').select('id').eq('task_id', input.task_id).maybeSingle();
    if (existing.error) throw existing.error;
    const data = existing.data
      ? await this.update(Number(existing.data.id), input)
      : await insertWithSafeId<PublishedPost>('published_posts', input);
    const taskUpdate = await supabase.from('campaign_tasks').update({ status: 'PUBLISHED' }).eq('id', input.task_id);
    if (taskUpdate.error) throw taskUpdate.error;
    return data;
  },
  async update(id: number, input: UpdateInput<PublishedPost>): Promise<PublishedPost> {
    const { data, error } = await supabase.from('published_posts').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as PublishedPost;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('published_posts').delete().eq('id', id);
    if (error) throw error;
  },
  async getByTask(taskId: number): Promise<PublishedPost[]> {
    const { data, error } = await supabase.from('published_posts').select('*').eq('task_id', taskId).order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PublishedPost[];
  },
};
