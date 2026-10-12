-- Run in the SQL editor of your own Supabase project.
-- Independent website support only: live chat, complaints, filed case reports,
-- automated triage replies, and visitor contact capture. Not law-enforcement records.
-- Safe to re-run: it upgrades an existing installation in place.
begin;

create table if not exists public.support_operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Duty agent',
  created_at timestamptz not null default now()
);

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  visitor_name text not null check (char_length(btrim(visitor_name)) between 1 and 60),
  kind text not null default 'chat' check (kind in ('chat', 'complaint', 'report')),
  subject text not null check (char_length(btrim(subject)) between 3 and 120),
  category text not null check (char_length(btrim(category)) between 1 and 120),
  status text not null default 'bot_intake'
    check (status in ('bot_intake', 'awaiting_agent', 'in_progress', 'resolved')),
  intent text not null default '',
  urgent boolean not null default false,
  handoff_requested_at timestamptz,
  bot_completed_at timestamptz,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visitor_read_at timestamptz,
  operator_read_at timestamptz,
  contact_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  contact_location text not null default '',
  contact_preference text not null default 'any'
    check (contact_preference in ('any', 'email', 'phone', 'sms')),
  loss_amount text not null default '',
  transaction_ref text not null default '',
  contact_saved_at timestamptz
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('visitor', 'operator', 'bot')),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Upgrades for installations created before contact capture existed.
alter table public.support_threads add column if not exists kind text not null default 'chat';
alter table public.support_threads add column if not exists intent text not null default '';
alter table public.support_threads add column if not exists urgent boolean not null default false;
alter table public.support_threads add column if not exists handoff_requested_at timestamptz;
alter table public.support_threads add column if not exists bot_completed_at timestamptz;
alter table public.support_threads add column if not exists contact_name text not null default '';
alter table public.support_threads add column if not exists contact_email text not null default '';
alter table public.support_threads add column if not exists contact_phone text not null default '';
alter table public.support_threads add column if not exists contact_location text not null default '';
alter table public.support_threads add column if not exists contact_preference text not null default 'any';
alter table public.support_threads add column if not exists loss_amount text not null default '';
alter table public.support_threads add column if not exists transaction_ref text not null default '';
alter table public.support_threads add column if not exists contact_saved_at timestamptz;
alter table public.support_threads drop constraint if exists support_threads_kind_check;
alter table public.support_threads add constraint support_threads_kind_check check (kind in ('chat', 'complaint', 'report'));
alter table public.support_threads drop constraint if exists support_threads_status_check;
alter table public.support_threads add constraint support_threads_status_check
  check (status in ('bot_intake', 'awaiting_agent', 'in_progress', 'resolved'));
alter table public.support_threads drop constraint if exists support_threads_contact_preference_check;
alter table public.support_threads add constraint support_threads_contact_preference_check
  check (contact_preference in ('any', 'email', 'phone', 'sms'));
update public.support_threads set status = 'bot_intake' where status = 'new';
alter table public.support_messages drop constraint if exists support_messages_sender_check;
alter table public.support_messages add constraint support_messages_sender_check
  check (sender in ('visitor', 'operator', 'bot'));

create index if not exists support_threads_visitor_idx on public.support_threads(visitor_id, created_at);
create index if not exists support_threads_queue_idx on public.support_threads(status, urgent desc, updated_at desc);
create index if not exists support_messages_thread_idx on public.support_messages(thread_id, created_at);
create index if not exists support_messages_sender_idx on public.support_messages(sender_id, created_at);

alter table public.support_operators enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

-- Approval comes from this server-managed table, never from client-editable metadata.
create or replace function public.support_is_operator()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and exists (select 1 from public.support_operators where user_id = auth.uid());
$$;

revoke all on function public.support_is_operator() from public, anon;
grant execute on function public.support_is_operator() to authenticated;

drop policy if exists "Operators read own membership" on public.support_operators;
create policy "Operators read own membership" on public.support_operators for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Owners and operators read threads" on public.support_threads;
create policy "Owners and operators read threads" on public.support_threads for select to authenticated
  using (visitor_id = (select auth.uid()) or (select public.support_is_operator()));

drop policy if exists "Owners and operators read messages" on public.support_messages;
create policy "Owners and operators read messages" on public.support_messages for select to authenticated
  using (exists (
    select 1 from public.support_threads t where t.id = thread_id
      and (t.visitor_id = (select auth.uid()) or (select public.support_is_operator()))
  ));

-- Direct writes are forbidden; the validated functions below are the only path in.
revoke all on public.support_operators, public.support_threads, public.support_messages from anon, authenticated;
grant select on public.support_operators, public.support_threads, public.support_messages to authenticated;

create or replace function public.support_start_thread(
  p_id uuid, p_message_id uuid, p_kind text, p_subject text, p_category text,
  p_visitor_name text, p_body text, p_intent text, p_urgent boolean, p_consent boolean
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  created timestamptz := clock_timestamp();
  existing public.support_threads%rowtype;
begin
  if actor is null then raise exception 'A visitor session is required.'; end if;
  if p_consent is distinct from true then raise exception 'Please certify the submission agreement.'; end if;
  if p_kind is null or p_kind not in ('chat', 'complaint', 'report') then raise exception 'Invalid request type.'; end if;
  if p_subject is null or char_length(btrim(p_subject)) not between 3 and 120 then raise exception 'The subject must be between 3 and 120 characters.'; end if;
  if p_visitor_name is null or char_length(btrim(p_visitor_name)) not between 1 and 60 then raise exception 'Use a display name of 1 to 60 characters.'; end if;
  if p_category is null or char_length(btrim(p_category)) not between 1 and 120 then raise exception 'Invalid category.'; end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 2000 then raise exception 'Write a message of 1 to 2000 characters.'; end if;
  if p_kind = 'complaint' and char_length(btrim(p_body)) < 20 then raise exception 'Please describe your complaint in at least 20 characters.'; end if;
  if coalesce(char_length(btrim(p_intent)), 0) > 120 then raise exception 'Invalid intent label.'; end if;

  perform pg_advisory_xact_lock(hashtextextended('support-create:' || actor::text, 0));
  select * into existing from public.support_threads where id = p_id;
  if found then
    if existing.visitor_id = actor and existing.kind = p_kind
      and existing.subject = btrim(p_subject) and existing.visitor_name = btrim(p_visitor_name)
      and existing.category = btrim(p_category) and exists (
        select 1 from public.support_messages where id = p_message_id and thread_id = p_id
          and sender_id = actor and body = btrim(p_body)
      ) then return p_id;
    end if;
    raise exception 'This request was already saved. Check My requests before starting another.';
  end if;

  if (select count(*) from public.support_threads where visitor_id = actor and created_at > now() - interval '1 hour') >= 12 then
    raise exception 'You have opened several requests recently. Continue an existing conversation or try again later.';
  end if;

  insert into public.support_threads
    (id, visitor_id, visitor_name, kind, subject, category, status, intent, urgent,
     consent_at, created_at, updated_at, visitor_read_at)
  values
    (p_id, actor, btrim(p_visitor_name), p_kind, btrim(p_subject), btrim(p_category), 'bot_intake',
     coalesce(btrim(p_intent), ''), coalesce(p_urgent, false), created, created, created, created);

  insert into public.support_messages (id, thread_id, sender_id, sender, body, created_at)
  values (p_message_id, p_id, actor, 'visitor', btrim(p_body), created);
  return p_id;
end;
$$;

create or replace function public.support_send_message(p_id uuid, p_thread_id uuid, p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  is_operator boolean := public.support_is_operator();
  target public.support_threads%rowtype;
  existing public.support_messages%rowtype;
  sent timestamptz;
begin
  if actor is null then raise exception 'A support session is required.'; end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 2000 then raise exception 'Write a message of 1 to 2000 characters.'; end if;
  perform pg_advisory_xact_lock(hashtextextended('support-message:' || actor::text, 0));

  select * into target from public.support_threads where id = p_thread_id for update;
  if not found or (target.visitor_id <> actor and not is_operator) then raise exception 'This conversation is unavailable.'; end if;

  select * into existing from public.support_messages where id = p_id;
  if found then
    if existing.thread_id = p_thread_id and existing.sender_id = actor and existing.body = btrim(p_body) then return p_id; end if;
    raise exception 'This message has already been saved. Reload the conversation before retrying.';
  end if;
  if target.status = 'resolved' then raise exception 'This request is resolved. Reopen it in the duty inbox or start a new request.'; end if;
  if (select count(*) from public.support_messages where sender_id = actor and created_at > now() - interval '1 minute') >= 60 then
    raise exception 'Please wait a moment before sending more messages.';
  end if;

  sent := clock_timestamp();
  insert into public.support_messages (id, thread_id, sender_id, sender, body, created_at)
  values (p_id, p_thread_id, actor, case when is_operator then 'operator' else 'visitor' end, btrim(p_body), sent);

  update public.support_threads set updated_at = sent,
    status = case when is_operator and status in ('bot_intake', 'awaiting_agent') then 'in_progress' else status end
  where id = p_thread_id;
  return p_id;
end;
$$;

-- Automated triage replies are generated in the visitor's own browser, so they are
-- written by the thread owner and attributed to sender 'bot'.
create or replace function public.support_bot_reply(
  p_id uuid, p_thread_id uuid, p_body text,
  p_contact_name text, p_contact_email text, p_contact_phone text, p_contact_location text,
  p_contact_preference text, p_loss_amount text, p_transaction_ref text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  target public.support_threads%rowtype;
  existing public.support_messages%rowtype;
  sent timestamptz := clock_timestamp();
begin
  if actor is null then raise exception 'A support session is required.'; end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 2000 then raise exception 'Invalid assistant message.'; end if;
  perform pg_advisory_xact_lock(hashtextextended('support-bot:' || actor::text, 0));

  select * into target from public.support_threads where id = p_thread_id for update;
  if not found or target.visitor_id <> actor then raise exception 'This conversation is unavailable.'; end if;
  if target.status in ('in_progress', 'resolved') then
    raise exception 'A duty agent has taken over this conversation.';
  end if;

  select * into existing from public.support_messages where id = p_id;
  if found then return p_id; end if;
  if (select count(*) from public.support_messages where sender_id = actor and sender = 'bot' and created_at > now() - interval '1 minute') >= 40 then
    raise exception 'Too many automated replies. Please wait a moment.';
  end if;

  insert into public.support_messages (id, thread_id, sender_id, sender, body, created_at)
  values (p_id, p_thread_id, actor, 'bot', btrim(p_body), sent);

  update public.support_threads set
    contact_name = coalesce(nullif(btrim(p_contact_name), ''), contact_name),
    contact_email = coalesce(nullif(btrim(p_contact_email), ''), contact_email),
    contact_phone = coalesce(nullif(btrim(p_contact_phone), ''), contact_phone),
    contact_location = coalesce(nullif(btrim(p_contact_location), ''), contact_location),
    contact_preference = case
      when p_contact_preference in ('email', 'phone', 'sms', 'any') then p_contact_preference
      else contact_preference end,
    loss_amount = coalesce(nullif(btrim(p_loss_amount), ''), loss_amount),
    transaction_ref = coalesce(nullif(btrim(p_transaction_ref), ''), transaction_ref),
    contact_saved_at = case when coalesce(p_contact_email, p_contact_phone, p_contact_name) is not null
      then sent else contact_saved_at end,
    updated_at = sent
  where id = p_thread_id;
  return p_id;
end;
$$;

create or replace function public.support_save_contact(
  p_thread_id uuid, p_contact_name text, p_contact_email text, p_contact_phone text,
  p_contact_location text, p_contact_preference text, p_loss_amount text, p_transaction_ref text
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  is_operator boolean := public.support_is_operator();
  target public.support_threads%rowtype;
  saved timestamptz := clock_timestamp();
begin
  if actor is null then raise exception 'A support session is required.'; end if;
  select * into target from public.support_threads where id = p_thread_id for update;
  if not found or (target.visitor_id <> actor and not is_operator) then raise exception 'This request is unavailable.'; end if;

  if coalesce(char_length(btrim(p_contact_name)), 0) > 90 then raise exception 'Keep the name under 90 characters.'; end if;
  if coalesce(char_length(btrim(p_contact_email)), 0) > 160 then raise exception 'That email address is too long.'; end if;
  if coalesce(char_length(btrim(p_contact_email)), 0) > 0 and btrim(p_contact_email) !~* '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then
    raise exception 'Enter a valid email address so we can reach you about this report.';
  end if;
  if coalesce(char_length(btrim(p_contact_phone)), 0) > 40 then raise exception 'That phone number is too long.'; end if;
  if coalesce(char_length(btrim(p_contact_location)), 0) > 120 then raise exception 'Keep the location under 120 characters.'; end if;
  if coalesce(char_length(btrim(p_loss_amount)), 0) > 60 then raise exception 'Keep the loss amount under 60 characters.'; end if;
  if coalesce(char_length(btrim(p_transaction_ref)), 0) > 200 then raise exception 'Keep the reference under 200 characters.'; end if;
  if p_contact_preference is not null and p_contact_preference not in ('any', 'email', 'phone', 'sms') then
    raise exception 'Choose how you would prefer to be contacted.';
  end if;

  update public.support_threads set
    contact_name = coalesce(nullif(btrim(p_contact_name), ''), contact_name),
    contact_email = coalesce(nullif(btrim(p_contact_email), ''), contact_email),
    contact_phone = coalesce(nullif(btrim(p_contact_phone), ''), contact_phone),
    contact_location = coalesce(nullif(btrim(p_contact_location), ''), contact_location),
    contact_preference = coalesce(nullif(p_contact_preference, ''), contact_preference),
    loss_amount = coalesce(nullif(btrim(p_loss_amount), ''), loss_amount),
    transaction_ref = coalesce(nullif(btrim(p_transaction_ref), ''), transaction_ref),
    contact_saved_at = saved,
    updated_at = saved
  where id = p_thread_id;
end;
$$;

create or replace function public.support_request_handoff(
  p_thread_id uuid, p_status text, p_urgent boolean, p_intent text
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  target public.support_threads%rowtype;
  at timestamptz := clock_timestamp();
begin
  if actor is null then raise exception 'A support session is required.'; end if;
  select * into target from public.support_threads where id = p_thread_id for update;
  if not found or (target.visitor_id <> actor and not public.support_is_operator()) then
    raise exception 'This conversation is unavailable.';
  end if;
  if target.status = 'resolved' then raise exception 'This request is resolved.'; end if;
  if coalesce(char_length(btrim(p_intent)), 0) > 120 then raise exception 'Invalid intent label.'; end if;

  update public.support_threads set
    status = case when p_status in ('bot_intake', 'awaiting_agent', 'in_progress', 'resolved')
      then p_status else 'awaiting_agent' end,
    urgent = urgent or coalesce(p_urgent, false),
    intent = case when coalesce(btrim(p_intent), '') <> '' then btrim(p_intent) else intent end,
    handoff_requested_at = coalesce(handoff_requested_at, at),
    updated_at = at
  where id = p_thread_id;
end;
$$;

create or replace function public.support_set_status(p_thread_id uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.support_is_operator() then raise exception 'Only approved duty agents can change a request status.'; end if;
  if p_status is null or p_status not in ('bot_intake', 'awaiting_agent', 'in_progress', 'resolved') then
    raise exception 'Invalid request status.';
  end if;
  update public.support_threads set status = p_status, updated_at = clock_timestamp() where id = p_thread_id;
  if not found then raise exception 'This request is unavailable.'; end if;
end;
$$;

create or replace function public.support_mark_read(p_thread_id uuid, p_until timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  cutoff timestamptz := least(p_until, clock_timestamp());
begin
  if actor is null then raise exception 'A support session is required.'; end if;
  if p_until is null then return; end if;
  if public.support_is_operator() then
    update public.support_threads set operator_read_at = greatest(operator_read_at, cutoff) where id = p_thread_id;
  else
    update public.support_threads set visitor_read_at = greatest(visitor_read_at, cutoff) where id = p_thread_id and visitor_id = actor;
  end if;
  if not found then raise exception 'This request is unavailable.'; end if;
end;
$$;

revoke all on function public.support_start_thread(uuid, uuid, text, text, text, text, text, text, boolean, boolean) from public, anon;
revoke all on function public.support_send_message(uuid, uuid, text) from public, anon;
revoke all on function public.support_bot_reply(uuid, uuid, text, text, text, text, text, text, text, text) from public, anon;
revoke all on function public.support_save_contact(uuid, text, text, text, text, text, text, text) from public, anon;
revoke all on function public.support_request_handoff(uuid, text, boolean, text) from public, anon;
revoke all on function public.support_set_status(uuid, text) from public, anon;
revoke all on function public.support_mark_read(uuid, timestamptz) from public, anon;

grant execute on function public.support_start_thread(uuid, uuid, text, text, text, text, text, text, boolean, boolean) to authenticated;
grant execute on function public.support_send_message(uuid, uuid, text) to authenticated;
grant execute on function public.support_bot_reply(uuid, uuid, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.support_save_contact(uuid, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.support_request_handoff(uuid, text, boolean, text) to authenticated;
grant execute on function public.support_set_status(uuid, text) to authenticated;
grant execute on function public.support_mark_read(uuid, timestamptz) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_threads') then
    alter publication supabase_realtime add table public.support_threads;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_messages') then
    alter publication supabase_realtime add table public.support_messages;
  end if;
end;
$$;

commit;

-- Approve your own operator account (replace the email, then run once):
-- insert into public.support_operators (user_id, display_name)
-- select id, 'Duty agent' from auth.users
-- where lower(email) = lower('owner@your-website.com') and is_anonymous is false
-- on conflict (user_id) do nothing;
