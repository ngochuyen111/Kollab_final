import type { DraftSubmission, Payment, PerformanceMetric, PublishedPost, TaskWithRelations } from '../types/database';

// PostgREST embeds a UNIQUE foreign key as an object, otherwise as an array.
type Relation<T> = T | T[] | null | undefined;
export type TaskRelationPayload = Omit<TaskWithRelations, 'draft_submissions' | 'published_posts' | 'performance_metrics' | 'payments'> & {
  draft_submissions?: Relation<DraftSubmission>;
  published_posts?: Relation<PublishedPost>;
  performance_metrics?: Relation<PerformanceMetric>;
  payments?: Relation<Payment>;
};
export function relationRows<T>(value: Relation<T>): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
export function normalizeTaskRelations(task: TaskRelationPayload): TaskWithRelations {
  return {
    ...task,
    draft_submissions: relationRows(task.draft_submissions),
    published_posts: relationRows(task.published_posts),
    performance_metrics: relationRows(task.performance_metrics),
    payments: relationRows(task.payments),
  };
}
