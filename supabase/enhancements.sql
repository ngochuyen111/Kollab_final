-- Run once in Supabase SQL Editor. Re-runnable; does not delete business data.
begin;
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  event_key text not null,
  title text not null,
  body text not null,
  target_view text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (user_id, event_key)
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;

-- Insert-only public assets. Private banking/evidence files should use a private
-- bucket with Supabase Auth policies instead of this public marketing bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kollab-assets', 'kollab-assets', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.kollab_notify(p_user bigint, p_key text, p_title text, p_body text, p_view text)
returns void language sql security definer set search_path = public
as $$
  insert into public.notifications(user_id,event_key,title,body,target_view)
  select p_user,p_key,p_title,p_body,p_view where p_user is not null
  on conflict(user_id,event_key) do nothing;
$$;
revoke all on function public.kollab_notify(bigint,text,text,text,text) from public, anon, authenticated;

create or replace function public.kollab_workflow_notification()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  t public.campaign_tasks%rowtype;
  brand_user bigint;
  creator_user bigint;
  campaign_title text;
  creator_name text;
  admin_user record;
  ev text;
begin
  if tg_table_name = 'brands' then
    if tg_op = 'INSERT' then
      for admin_user in select id from public.users where role = 'ADMIN' and status = 'ACTIVE' loop
        perform public.kollab_notify(admin_user.id, 'brand:'||new.id, 'Brand mới được tạo', new.brand_name, 'brands');
      end loop;
    end if;
    return new;
  end if;
  if tg_table_name = 'campaign_tasks' then t := new;
  else select * into t from public.campaign_tasks where id = new.task_id;
  end if;
  select b.user_id,c.campaign_name into brand_user,campaign_title from public.campaigns c join public.brands b on b.id=c.brand_id where c.id=t.campaign_id;
  select k.user_id,u.full_name into creator_user,creator_name from public.kol_profiles k join public.users u on u.id=k.user_id where k.id=t.kol_profile_id;
  ev := tg_table_name || ':' || new.id;
  if tg_table_name = 'campaign_tasks' and tg_op = 'INSERT' then
    perform public.kollab_notify(creator_user, ev, 'Bạn có nhiệm vụ mới', campaign_title || ' · ' || new.content_type, 'tasks');
  elsif tg_table_name = 'draft_submissions' then
    if tg_op='UPDATE' and new.status is not distinct from old.status then return new; end if;
    if new.status='SUBMITTED' then
      perform public.kollab_notify(brand_user, ev||':submitted', 'Bản nháp chờ duyệt', creator_name || ' · ' || campaign_title, 'content');
    else
      perform public.kollab_notify(creator_user, ev||':'||new.status, case when new.status='APPROVED' then 'Draft được duyệt, bạn có thể đăng bài' else 'Brand yêu cầu sửa draft' end, campaign_title || ' · ' || coalesce(new.feedback,''), 'tasks');
    end if;
  elsif tg_table_name = 'published_posts' then
    if tg_op='INSERT' then perform public.kollab_notify(brand_user, ev, 'Creator đã gửi bài đăng', creator_name || ' · ' || campaign_title, 'outcomes'); end if;
  elsif tg_table_name = 'performance_metrics' then
    if tg_op='UPDATE' and new.status is not distinct from old.status then return new; end if;
    if new.status='SUBMITTED' then
      perform public.kollab_notify(brand_user, ev||':submitted', 'Metrics cần xác minh', creator_name || ' · ' || campaign_title || ' · ' || new.report_period, 'performance');
    else
      perform public.kollab_notify(creator_user, ev||':'||new.status, case when new.status='APPROVED' then 'Metrics đã được xác minh' else 'Metrics cần cập nhật' end, campaign_title || ' · ' || coalesce(new.feedback,''), 'tasks');
    end if;
  elsif tg_table_name = 'payments' then
    if tg_op='UPDATE' and new.status is not distinct from old.status and new.paid_amount is not distinct from old.paid_amount then return new; end if;
    perform public.kollab_notify(creator_user, ev||':'||new.status||':'||new.paid_amount, case when new.status='PAID' then 'Bạn đã được thanh toán' else 'Cập nhật thanh toán' end, campaign_title || ' · ' || new.status || ' · ' || new.amount || ' VND', 'payment');
    if tg_op='INSERT' then perform public.kollab_notify(brand_user, ev, 'Khoản thanh toán mới', creator_name || ' · ' || campaign_title, 'payment'); end if;
    if new.status='PAID' then
      for admin_user in select id from public.users where role='ADMIN' and status='ACTIVE' loop
        perform public.kollab_notify(admin_user.id, ev||':paid', 'Thanh toán hoàn tất', creator_name || ' · ' || campaign_title || ' · ' || new.amount || ' VND', 'payments');
      end loop;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.kollab_workflow_notification() from public, anon, authenticated;
drop trigger if exists kollab_task_notify on public.campaign_tasks;
create trigger kollab_task_notify after insert on public.campaign_tasks for each row execute function public.kollab_workflow_notification();
drop trigger if exists kollab_draft_notify on public.draft_submissions;
create trigger kollab_draft_notify after insert or update on public.draft_submissions for each row execute function public.kollab_workflow_notification();
drop trigger if exists kollab_post_notify on public.published_posts;
create trigger kollab_post_notify after insert on public.published_posts for each row execute function public.kollab_workflow_notification();
drop trigger if exists kollab_metric_notify on public.performance_metrics;
create trigger kollab_metric_notify after insert or update on public.performance_metrics for each row execute function public.kollab_workflow_notification();
drop trigger if exists kollab_payment_notify on public.payments;
create trigger kollab_payment_notify after insert or update on public.payments for each row execute function public.kollab_workflow_notification();
drop trigger if exists kollab_brand_notify on public.brands;
create trigger kollab_brand_notify after insert on public.brands for each row execute function public.kollab_workflow_notification();

-- Transactional provisioning keeps users + brands together. Invoker uses the
-- existing project policies. The legacy localStorage model checks role for demo;
-- production MUST validate auth.uid() and enforce role policies in the database.
create or replace function public.create_brand_account(p_admin_id bigint, p_full_name text, p_email text, p_password text, p_brand_name text, p_industry text default null, p_description text default null, p_website text default null, p_logo text default null)
returns bigint language plpgsql security invoker set search_path=public
as $$
declare new_user bigint; new_brand bigint;
begin
  if not exists(select 1 from public.users where id=p_admin_id and role='ADMIN' and status='ACTIVE') then raise exception 'Chỉ Admin được tạo tài khoản Brand'; end if;
  if length(trim(p_full_name))=0 or length(trim(p_brand_name))=0 or length(trim(p_email))=0 or length(p_password)<6 then raise exception 'Thông tin tài khoản không hợp lệ'; end if;
  insert into public.users(full_name,email,password_hash,role,avatar_url,status)
  values(trim(p_full_name),lower(trim(p_email)),p_password,'BRAND',p_logo,'ACTIVE') returning id into new_user;
  insert into public.brands(user_id,brand_name,industry,description,website_url,logo_url,status)
  values(new_user,trim(p_brand_name),p_industry,p_description,p_website,p_logo,'ACTIVE') returning id into new_brand;
  return new_brand;
end;
$$;
revoke all on function public.create_brand_account(bigint,text,text,text,text,text,text,text,text) from public;
grant execute on function public.create_brand_account(bigint,text,text,text,text,text,text,text,text) to anon,authenticated;
-- Fix sequences after explicit numeric seeds without lowering existing values.
do $$
declare tab text; seq text; max_id bigint; last_id bigint;
begin
  foreach tab in array array['users','brands','products','campaigns','kol_profiles','campaign_tasks','draft_submissions','published_posts','performance_metrics','payments'] loop
    seq := pg_get_serial_sequence('public.'||tab,'id');
    if seq is not null then
      execute format('select coalesce(max(id),0) from public.%I',tab) into max_id;
      execute format('select last_value from %s',seq) into last_id;
      perform setval(seq,greatest(max_id,last_id,1),true);
    end if;
  end loop;
end $$;
-- Refresh PostgREST after adding tables and RPCs.
notify pgrst, 'reload schema';
commit;
