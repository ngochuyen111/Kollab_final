import { supabase } from '../lib/supabase';

interface DbError {
  code?: string;
  message?: string;
}

const isPrimaryKeyConflict = (error: DbError | null) =>
  error?.code === '23505' && Boolean(error.message?.includes('_pkey'));

/**
 * The demo database was seeded with explicit integer IDs, so some PostgreSQL
 * sequences are behind the current MAX(id). Supplying MAX(id) + 1 prevents the
 * sequence from reusing an existing primary key. A short retry also handles
 * two browser clients creating rows at nearly the same time.
 */
export async function insertWithSafeId<T>(table: string, input: Record<string, unknown>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const latest = await supabase.from(table).select('id').order('id', { ascending: false }).limit(1).maybeSingle();
    if (latest.error) throw latest.error;
    const nextId = Number(latest.data?.id ?? 0) + 1;
    const result = await supabase.from(table).insert({ ...input, id: nextId }).select().single();
    if (!result.error) return result.data as T;
    if (!isPrimaryKeyConflict(result.error)) throw result.error;
  }
  throw new Error(`Không thể tạo ID mới cho bảng ${table}. Vui lòng thử lại.`);
}
