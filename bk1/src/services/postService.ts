import { supabase } from '../lib/supabase';
import type { CreateInput, PublishedPost, UpdateInput } from '../types/database';

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
    const { data, error } = await supabase.from('published_posts').insert(input).select().single();
    if (error) throw error;
    const taskUpdate = await supabase.from('campaign_tasks').update({ status: 'PUBLISHED' }).eq('id', input.task_id);
    if (taskUpdate.error) throw taskUpdate.error;
    return data as PublishedPost;
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
