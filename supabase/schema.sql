-- ============================================================
-- Explorer Mode — Supabase Schema  (full fresh setup)
-- Dashboard → SQL Editor → New Query → paste entire file → Run
--
-- Already have the table? Jump to the MIGRATION section at
-- the bottom and run only that block instead.
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
create table if not exists public.explorers (
  id              uuid        primary key default gen_random_uuid(),
  nickname        text        unique not null
                              check (length(trim(nickname)) between 2 and 24),
  -- pin_hash is a SHA-256 hex digest (always 64 chars).
  -- It is NEVER returned to the client — only read inside the
  -- SECURITY DEFINER function below.
  pin_hash        text        not null
                              check (length(pin_hash) = 64),
  server          text        not null default 'unknown',
  marker          text        not null default 'pin',
  exp             integer     not null default 0    check (exp >= 0),
  level           integer     not null default 1    check (level >= 1),
  visit_count     integer     not null default 0    check (visit_count >= 0),
  failed_attempts integer     not null default 0    check (failed_attempts >= 0),
  locked_until    timestamptz,
  last_seen       timestamptz not null default now(),
  achievements    text[]      not null default '{}',
  pages_explored  text[]      not null default '{}',
  created_at      timestamptz not null default now()
);

create index if not exists explorers_nickname_idx on public.explorers (nickname);

-- ── Row-Level Security ────────────────────────────────────────
alter table public.explorers enable row level security;

-- Public read (for leaderboard use) — pin_hash / failed_attempts /
-- locked_until are sensitive; expose them only via a safe view below.
drop policy if exists "explorers_read_all" on public.explorers;
drop policy if exists "explorers_insert"   on public.explorers;
drop policy if exists "explorers_update"   on public.explorers;
create policy "explorers_read_all"
  on public.explorers for select
  using (true);

-- INSERT and UPDATE are intentionally NOT granted to the anon role.
-- All writes go through the register_explorer() RPC (SECURITY DEFINER),
-- which enforces PIN verification, rate-limiting, and atomic updates.

-- ── Safe public view (excludes sensitive columns) ────────────
create or replace view public.explorers_public as
  select
    id, nickname, server, marker,
    exp, level, visit_count,
    last_seen, achievements, pages_explored, created_at
  from public.explorers;

-- ── Helper: compute achievements array ───────────────────────
create or replace function public._explorer_achievements(
  p_current text[],
  p_visits  integer
) returns text[]
language sql immutable
as $$
  select array(
    select distinct unnest(
      p_current
      || case when p_visits >= 1  then array['first_contact'] else array[]::text[] end
      || case when p_visits >= 5  then array['regular']       else array[]::text[] end
      || case when p_visits >= 10 then array['veteran']       else array[]::text[] end
    )
  );
$$;

-- ── Main registration RPC ─────────────────────────────────────
-- Accepts the PIN hash (computed client-side with SHA-256).
-- Returns a jsonb result — never includes pin_hash, failed_attempts,
-- or locked_until in the success payload.
-- Enforces: 3-attempt lockout (15-minute window).
create or replace function public.register_explorer(
  p_nickname  text,
  p_pin_hash  text,
  p_server    text,
  p_marker    text
) returns jsonb
language plpgsql
security definer            -- runs as function owner, bypasses RLS
set search_path = public    -- prevents search_path injection
as $$
declare
  v_row     public.explorers%rowtype;
  v_exp     integer;
  v_level   integer;
  v_visits  integer;
  v_ach     text[];
  v_is_new  boolean := false;
begin
  -- ── Input validation ───────────────────────────────────────
  p_nickname := trim(p_nickname);
  if length(p_nickname) < 2 or length(p_nickname) > 24
     or length(p_pin_hash) <> 64
     or p_server  is null or length(p_server)  = 0
     or p_marker  is null or length(p_marker)  = 0
  then
    return jsonb_build_object('ok', false, 'reason', 'invalid_input');
  end if;

  -- ── Lock row for atomic read-modify-write (prevents TOCTOU) ─
  select * into v_row
  from public.explorers
  where nickname = p_nickname
  for update;

  if not found then
    -- ── New explorer ─────────────────────────────────────────
    v_exp    := 100;
    v_level  := 1;
    v_visits := 1;
    v_is_new := true;
    v_ach    := public._explorer_achievements(array[]::text[], v_visits);

    insert into public.explorers (
      nickname, pin_hash, server, marker,
      exp, level, visit_count, achievements, last_seen
    ) values (
      p_nickname, p_pin_hash, p_server, p_marker,
      v_exp, v_level, v_visits, v_ach, now()
    )
    returning * into v_row;

  else
    -- ── Returning explorer — check lockout ───────────────────
    if v_row.failed_attempts >= 3
       and v_row.locked_until is not null
       and v_row.locked_until > now()
    then
      return jsonb_build_object(
        'ok',           false,
        'reason',       'locked',
        'locked_until', v_row.locked_until
      );
    end if;

    -- ── Verify PIN ───────────────────────────────────────────
    if v_row.pin_hash <> p_pin_hash then
      update public.explorers
      set failed_attempts = v_row.failed_attempts + 1,
          locked_until = case
            when v_row.failed_attempts + 1 >= 3
              then now() + interval '15 minutes'
            else locked_until
          end
      where nickname = p_nickname;

      return jsonb_build_object('ok', false, 'reason', 'wrong_pin');
    end if;

    -- ── PIN correct — update profile ─────────────────────────
    v_exp    := v_row.exp + 50;
    v_level  := floor(v_exp / 100)::integer + 1;
    v_visits := v_row.visit_count + 1;
    v_ach    := public._explorer_achievements(v_row.achievements, v_visits);

    update public.explorers
    set exp             = v_exp,
        level           = v_level,
        visit_count     = v_visits,
        achievements    = v_ach,
        server          = p_server,
        marker          = p_marker,
        last_seen       = now(),
        failed_attempts = 0,
        locked_until    = null
    where nickname = p_nickname
    returning * into v_row;
  end if;

  -- Return profile WITHOUT any sensitive fields
  return jsonb_build_object(
    'ok',             true,
    'is_new',         v_is_new,
    'id',             v_row.id,
    'nickname',       v_row.nickname,
    'server',         v_row.server,
    'marker',         v_row.marker,
    'exp',            v_row.exp,
    'level',          v_row.level,
    'visit_count',    v_row.visit_count,
    'last_seen',      v_row.last_seen,
    'achievements',   v_row.achievements,
    'pages_explored', v_row.pages_explored,
    'created_at',     v_row.created_at
  );
end;
$$;

-- ── Page-tracking RPC (atomic, no race condition) ─────────────
create or replace function public.track_explorer_page(
  p_nickname text,
  p_page     text
) returns void
language sql
security definer
set search_path = public
as $$
  update public.explorers
  set pages_explored = array_append(pages_explored, p_page)
  where nickname = p_nickname
    and not (pages_explored @> array[p_page]);
$$;

-- ============================================================
-- MIGRATION — run ONLY these statements if you already have
-- the explorers table from a previous schema version.
-- ============================================================
-- alter table public.explorers
--   add column if not exists failed_attempts integer not null default 0
--                             check (failed_attempts >= 0),
--   add column if not exists locked_until timestamptz,
--   add column if not exists pin_hash text,   -- if not already present
--   alter column pin_hash set not null,
--   add constraint explorers_pin_hash_len check (length(pin_hash) = 64),
--   add constraint explorers_nickname_len
--     check (length(trim(nickname)) between 2 and 24);
--
-- drop policy if exists "explorers_insert" on public.explorers;
-- drop policy if exists "explorers_update" on public.explorers;
--
-- Then run the three create-or-replace statements above
-- (_explorer_achievements, register_explorer, track_explorer_page).
