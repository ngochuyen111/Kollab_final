-- OPTIONAL: ONLY for the current classroom demo with users-table/localStorage login.
-- localStorage is not a server-verified identity. These policies do NOT provide
-- production tenant isolation. Do not use this file on a public production app.
-- Supabase Auth + auth.uid()-based policies are required for secure public access.
begin;
revoke update on public.notifications from anon, authenticated;
grant select, update (read_at) on public.notifications to anon, authenticated;
drop policy if exists kollab_demo_notifications_read on public.notifications;
create policy kollab_demo_notifications_read on public.notifications for select to anon, authenticated using (true);
drop policy if exists kollab_demo_notifications_update on public.notifications;
create policy kollab_demo_notifications_update on public.notifications for update to anon, authenticated using (true) with check (true);
-- Only permit fresh uploads to this bucket's three marketing-image folders.
-- Public read is supplied by the public bucket; no update/delete/list policy.
drop policy if exists kollab_demo_asset_insert on storage.objects;
create policy kollab_demo_asset_insert on storage.objects for insert to anon, authenticated
with check (bucket_id='kollab-assets' and (storage.foldername(name))[1] in ('avatars','products','brand-logos'));
commit;
