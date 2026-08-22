-- Postgres-atomic rate limiter for /api/chat.
--
-- Not run by any migration tooling (this repo has no supabase/migrations
-- folder) — this is checked in purely as version-controlled documentation.
-- Apply it once, top to bottom, in the Supabase SQL editor.
--
-- See backend/src/lib/chatRateLimit.ts and backend/src/lib/supabaseClient.ts
-- (supabaseAsUser) for the backend side that calls this.

-- 0. (informational) inspect current constraints before changing anything
select conname, contype, conrelid::regclass, confrelid::regclass
from pg_constraint
where conrelid = 'public.rate_limits'::regclass;

-- 1. Ensure id is PK + FK to auth.users(id) — required for step 4's
--    ON CONFLICT (id) to work at all. Idempotent.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.rate_limits'::regclass and contype = 'p'
  ) then
    alter table public.rate_limits add primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.rate_limits'::regclass
      and contype = 'f' and confrelid = 'auth.users'::regclass
  ) then
    alter table public.rate_limits
      add constraint rate_limits_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;
end $$;

-- 2. Rename + add the window column (run once — rename will error if
--    re-run a second time, that's expected/harmless).
alter table public.rate_limits rename column quota to request_count;
alter table public.rate_limits alter column request_count set default 0;
alter table public.rate_limits
  add column if not exists window_start timestamptz not null default now();

-- 3. RLS: each row only visible/writable by its own owner.
alter table public.rate_limits enable row level security;

drop policy if exists rate_limits_self_access on public.rate_limits;
create policy rate_limits_self_access on public.rate_limits
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Atomic check-and-increment. A single INSERT ... ON CONFLICT DO UPDATE
--    takes a row lock on the conflicting row for the duration of the
--    upsert, so concurrent calls for the same id serialize against each
--    other — this is what makes it immune to the read-then-write race a
--    separate SELECT + UPDATE would have.
create or replace function public.check_and_increment_rate_limit(
  p_quota integer default 5
)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_new_count integer;
begin
  insert into public.rate_limits as rl (id, request_count, window_start)
  values (auth.uid(), 1, now())
  on conflict (id) do update
    set request_count = case
          when now() - rl.window_start > interval '1 hour' then 1
          else rl.request_count + 1
        end,
        window_start = case
          when now() - rl.window_start > interval '1 hour' then now()
          else rl.window_start
        end
  returning request_count into v_new_count;

  return v_new_count <= p_quota;
end;
$$;

-- 5. Grants, authenticated only. NOTE: security invoker does NOT let the
--    caller skip table grants — RLS applies on top of (not instead of)
--    these, so both are required or every call fails with permission
--    denied even though the function compiles fine.
revoke all on public.rate_limits from public, anon;
grant select, insert, update on public.rate_limits to authenticated;

revoke all on function public.check_and_increment_rate_limit(integer) from public, anon;
grant execute on function public.check_and_increment_rate_limit(integer) to authenticated;
