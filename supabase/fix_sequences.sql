-- Run once in Supabase SQL Editor after importing/seed data with explicit IDs.
-- It aligns every integer sequence with the current largest primary key.

begin;

-- Remove the two inactive diagnostic rows created while reproducing the 409.
delete from public.campaigns
where id = 11 and campaign_name = '__DIAGNOSTIC_ROW_CAN_DELETE__';

delete from public.products
where id = 11 and product_name = '__DIAGNOSTIC_ROW_CAN_DELETE__';

select setval(pg_get_serial_sequence('public.users', 'id'), coalesce(max(id), 1), max(id) is not null) from public.users;
select setval(pg_get_serial_sequence('public.brands', 'id'), coalesce(max(id), 1), max(id) is not null) from public.brands;
select setval(pg_get_serial_sequence('public.products', 'id'), coalesce(max(id), 1), max(id) is not null) from public.products;
select setval(pg_get_serial_sequence('public.kol_profiles', 'id'), coalesce(max(id), 1), max(id) is not null) from public.kol_profiles;
select setval(pg_get_serial_sequence('public.campaigns', 'id'), coalesce(max(id), 1), max(id) is not null) from public.campaigns;
select setval(pg_get_serial_sequence('public.campaign_tasks', 'id'), coalesce(max(id), 1), max(id) is not null) from public.campaign_tasks;
select setval(pg_get_serial_sequence('public.draft_submissions', 'id'), coalesce(max(id), 1), max(id) is not null) from public.draft_submissions;
select setval(pg_get_serial_sequence('public.published_posts', 'id'), coalesce(max(id), 1), max(id) is not null) from public.published_posts;
select setval(pg_get_serial_sequence('public.performance_metrics', 'id'), coalesce(max(id), 1), max(id) is not null) from public.performance_metrics;
select setval(pg_get_serial_sequence('public.payments', 'id'), coalesce(max(id), 1), max(id) is not null) from public.payments;

commit;
