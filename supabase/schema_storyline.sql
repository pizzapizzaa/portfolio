-- ============================================================
-- Explorer Mode — Storyline Schema  (run AFTER schema.sql)
-- Dashboard → SQL Editor → New Query → paste → Run
--
-- This adds quizzes/puzzles per project, story fragments that
-- unlock on completion, and per-explorer progress tracking.
-- ============================================================


-- ── Story fragments ───────────────────────────────────────────
-- The narrative text that unlocks when an explorer completes
-- a quiz or puzzle.  Body supports {{nickname}} placeholder.
--
-- project_slug: ties a fragment to a specific project page.
--   Use NULL for global fragments (unlocked across projects).
--
-- fragment_type: controls how the UI renders the story card.
--   intro        — sets the scene before the challenge
--   discovery    — revealed immediately after a correct answer
--   revelation   — deeper lore unlocked after multiple completions
--   epilogue     — final fragment when all nodes in a project are done

create table if not exists public.story_fragments (
  id             uuid    primary key default gen_random_uuid(),
  project_slug   text,           -- null = global
  sequence_order integer not null default 0,
  title          text    not null,
  body           text    not null,
  fragment_type  text    not null
                         check (fragment_type in ('intro','discovery','revelation','epilogue')),
  created_at     timestamptz not null default now()
);

create index if not exists story_fragments_project_idx
  on public.story_fragments (project_slug, sequence_order);


-- ── Content nodes (quizzes + puzzles per project) ─────────────
-- Each row is one question or puzzle attached to a project page.
--
-- node_type:
--   quiz    — multiple-choice question; options is a jsonb array
--             of strings e.g. ["Option A","Option B","Option C"]
--   puzzle  — open-ended or code challenge; options is null
--
-- answer_hash:
--   SHA-256 hex of the correct answer, lower-cased + trimmed.
--   For quiz:   hash(options[correct_index].toLowerCase().trim())
--   For puzzle: hash(expectedAnswer.toLowerCase().trim())
--   Pre-compute this before inserting (use a helper below).
--
-- story_fragment_id:
--   The story fragment that unlocks when this node is completed.
--   NULL = completion only awards EXP, no story text.

create table if not exists public.content_nodes (
  id                uuid    primary key default gen_random_uuid(),
  project_slug      text    not null,
  node_type         text    not null check (node_type in ('quiz', 'puzzle')),
  order_index       integer not null default 0,
  title             text    not null,
  prompt            text    not null,
  options           jsonb,          -- quiz: string[]; puzzle: null
  answer_hash       text    not null check (length(answer_hash) = 64),
  hint              text,
  exp_reward        integer not null default 25 check (exp_reward >= 0),
  story_fragment_id uuid    references public.story_fragments(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists content_nodes_project_idx
  on public.content_nodes (project_slug, order_index);


-- ── Explorer content progress ─────────────────────────────────
-- One row per (explorer, node) once the explorer answers correctly.
-- project_slug is denormalised here for fast per-project queries.

create table if not exists public.explorer_content_progress (
  id              uuid    primary key default gen_random_uuid(),
  explorer_id     uuid    not null references public.explorers(id) on delete cascade,
  content_node_id uuid    not null references public.content_nodes(id) on delete cascade,
  project_slug    text    not null,
  attempts        integer not null default 1 check (attempts >= 1),
  -- NULL = wrong answer recorded; non-null = correctly completed
  completed_at    timestamptz,
  unique (explorer_id, content_node_id)
);

create index if not exists explorer_progress_explorer_idx
  on public.explorer_content_progress (explorer_id);
create index if not exists explorer_progress_project_idx
  on public.explorer_content_progress (explorer_id, project_slug);


-- ── Explorer story log ────────────────────────────────────────
-- Tracks which story fragments each explorer has unlocked.

create table if not exists public.explorer_story (
  id                uuid    primary key default gen_random_uuid(),
  explorer_id       uuid    not null references public.explorers(id) on delete cascade,
  story_fragment_id uuid    not null references public.story_fragments(id) on delete cascade,
  unlocked_at       timestamptz not null default now(),
  unique (explorer_id, story_fragment_id)
);

create index if not exists explorer_story_explorer_idx
  on public.explorer_story (explorer_id);


-- ── RLS ───────────────────────────────────────────────────────
alter table public.story_fragments           enable row level security;
alter table public.content_nodes             enable row level security;
alter table public.explorer_content_progress enable row level security;
alter table public.explorer_story            enable row level security;

-- Anyone can read content (questions shown on project pages)
drop policy if exists "story_fragments_read"           on public.story_fragments;
drop policy if exists "content_nodes_read"             on public.content_nodes;
drop policy if exists "explorer_progress_read"         on public.explorer_content_progress;
drop policy if exists "explorer_story_read"            on public.explorer_story;

create policy "story_fragments_read"   on public.story_fragments           for select using (true);
create policy "content_nodes_read"     on public.content_nodes             for select using (true);
create policy "explorer_progress_read" on public.explorer_content_progress for select using (true);
create policy "explorer_story_read"    on public.explorer_story            for select using (true);

-- No direct INSERT/UPDATE/DELETE for anon — all writes go through RPCs below.


-- ============================================================
-- RPC: submit_answer
-- Called when an explorer submits a quiz/puzzle answer.
--
-- p_nickname    — explorer's nickname
-- p_node_id     — content_nodes.id of the question
-- p_answer_hash — SHA-256 hex of answer (same algo as hashPin)
--
-- Returns jsonb:
--   { ok, correct, already_completed, exp_earned, new_exp,
--     new_level, story_fragment }
--
-- story_fragment (when a new one unlocks):
--   { id, title, body (with {{nickname}} replaced), type }
-- ============================================================

create or replace function public.submit_answer(
  p_nickname    text,
  p_node_id     uuid,
  p_answer_hash text,
  p_pin_hash    text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_explorer public.explorers%rowtype;
  v_node     public.content_nodes%rowtype;
  v_already  boolean;
  v_new_exp  integer;
  v_new_lvl  integer;
  v_frag     public.story_fragments%rowtype;
  v_is_new_frag boolean := false;
begin
  -- Validate inputs
  if length(p_answer_hash) <> 64 or length(p_pin_hash) <> 64 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_input');
  end if;

  -- Lock explorer row
  select * into v_explorer
  from public.explorers
  where nickname = trim(p_nickname)
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'explorer_not_found');
  end if;

  -- Require proof of explorer identity for EXP/story writes
  if v_explorer.pin_hash <> p_pin_hash then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  -- Fetch node (no lock needed — content is immutable)
  select * into v_node from public.content_nodes where id = p_node_id;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'node_not_found');
  end if;

  -- Already completed?
  select exists(
    select 1 from public.explorer_content_progress
    where explorer_id = v_explorer.id and content_node_id = p_node_id
  ) into v_already;

  if v_already then
    return jsonb_build_object('ok', true, 'correct', true, 'already_completed', true);
  end if;

  -- Wrong answer — just tell the client
  if v_node.answer_hash <> p_answer_hash then
    -- Increment attempts (insert or update a lightweight row)
    insert into public.explorer_content_progress
      (explorer_id, content_node_id, project_slug, attempts, completed_at)
    values
      (v_explorer.id, p_node_id, v_node.project_slug, 1, null)
    on conflict (explorer_id, content_node_id)
    do update set attempts = explorer_content_progress.attempts + 1;

    return jsonb_build_object('ok', true, 'correct', false);
  end if;

  -- ── Correct answer ────────────────────────────────────────

  -- Record completion (upsert — might already exist with attempts > 0)
  insert into public.explorer_content_progress
    (explorer_id, content_node_id, project_slug, attempts, completed_at)
  values
    (v_explorer.id, p_node_id, v_node.project_slug, 1, now())
  on conflict (explorer_id, content_node_id)
  do update set
    attempts     = explorer_content_progress.attempts + 1,
    completed_at = now();

  -- Award EXP
  v_new_exp := v_explorer.exp + v_node.exp_reward;
  v_new_lvl := floor(v_new_exp / 100)::integer + 1;

  update public.explorers
  set exp   = v_new_exp,
      level = v_new_lvl
  where id = v_explorer.id;

  -- Unlock story fragment (if linked and not already unlocked)
  if v_node.story_fragment_id is not null then
    insert into public.explorer_story (explorer_id, story_fragment_id)
    values (v_explorer.id, v_node.story_fragment_id)
    on conflict do nothing;

    if found then
      v_is_new_frag := true;
    end if;

    select * into v_frag
    from public.story_fragments
    where id = v_node.story_fragment_id;
  end if;

  return jsonb_build_object(
    'ok',               true,
    'correct',          true,
    'already_completed',false,
    'exp_earned',       v_node.exp_reward,
    'new_exp',          v_new_exp,
    'new_level',        v_new_lvl,
    'story_fragment',   case
      when v_frag.id is not null then jsonb_build_object(
        'id',    v_frag.id,
        'title', v_frag.title,
        'body',  replace(v_frag.body, '{{nickname}}', v_explorer.nickname),
        'type',  v_frag.fragment_type,
        'is_new',v_is_new_frag
      )
      else null
    end
  );
end;
$$;


-- ============================================================
-- RPC: get_project_content
-- Returns all nodes for a project, with completion flags
-- for the given explorer (if provided).
--
-- answer_hash is NEVER returned — only prompts, options, hints.
-- ============================================================

create or replace function public.get_project_content(
  p_project_slug text,
  p_nickname     text default null,
  p_pin_hash     text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_explorer_id uuid;
begin
  if p_nickname is not null and p_pin_hash is not null and length(p_pin_hash) = 64 then
    select id into v_explorer_id
    from public.explorers
    where nickname = trim(p_nickname)
      and pin_hash = p_pin_hash;
  end if;

  return jsonb_build_object(
    'ok', true,
    'nodes', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id',          cn.id,
          'type',        cn.node_type,
          'order',       cn.order_index,
          'title',       cn.title,
          'prompt',      cn.prompt,
          'options',     cn.options,
          'hint',        cn.hint,
          'exp_reward',  cn.exp_reward,
          'completed',   case
            when v_explorer_id is not null then exists(
              select 1 from public.explorer_content_progress ecp
              where ecp.explorer_id = v_explorer_id
                and ecp.content_node_id = cn.id
                and ecp.completed_at is not null
            )
            else false
          end,
          'attempts', case
            when v_explorer_id is not null then (
              select coalesce(ecp.attempts, 0)
              from public.explorer_content_progress ecp
              where ecp.explorer_id = v_explorer_id
                and ecp.content_node_id = cn.id
            )
            else 0
          end
        ) order by cn.order_index
      ), '[]'::jsonb)
      from public.content_nodes cn
      where cn.project_slug = p_project_slug
    )
  );
end;
$$;


-- ============================================================
-- RPC: get_explorer_storyline
-- Returns the full personalised storyline for an explorer —
-- all unlocked fragments ordered narratively, plus a summary
-- of completed nodes per project.
-- ============================================================

create or replace function public.get_explorer_storyline(
  p_nickname text,
  p_pin_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_explorer public.explorers%rowtype;
begin
  if length(p_pin_hash) <> 64 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_input');
  end if;

  select * into v_explorer
  from public.explorers
  where nickname = trim(p_nickname)
    and pin_hash = p_pin_hash;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  return jsonb_build_object(
    'ok', true,
    -- Story fragments in narrative order ({{nickname}} replaced)
    'fragments', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id',           sf.id,
          'project_slug', sf.project_slug,
          'title',        sf.title,
          'body',         replace(sf.body, '{{nickname}}', v_explorer.nickname),
          'type',         sf.fragment_type,
          'order',        sf.sequence_order,
          'unlocked_at',  es.unlocked_at
        ) order by sf.sequence_order, es.unlocked_at
      ), '[]'::jsonb)
      from public.explorer_story es
      join public.story_fragments sf on sf.id = es.story_fragment_id
      where es.explorer_id = v_explorer.id
    ),
    -- Per-project completion summary
    'project_progress', (
      select coalesce(jsonb_object_agg(
        ecp.project_slug,
        jsonb_build_object(
          'completed', count(*) filter (where ecp.completed_at is not null),
          'total',     (select count(*) from public.content_nodes cn2
                        where cn2.project_slug = ecp.project_slug)
        )
      ), '{}'::jsonb)
      from public.explorer_content_progress ecp
      where ecp.explorer_id = v_explorer.id
      group by ecp.project_slug
    )
  );
end;
$$;


-- ============================================================
-- ROLE GRANTS  (run after every fresh schema_storyline apply)
-- ============================================================
-- story_fragments and content_nodes are public content — anon
-- may read them (questions/prompts are shown on project pages).
-- answer_hash is present in content_nodes but SHA-256 is
-- pre-image resistant; keep the column restricted to prevent
-- trivial enumeration of hash-to-answer mappings.
-- explorer_content_progress and explorer_story are personal
-- data; restrict to authenticated RPCs only — direct table
-- reads are left open only because the current auth model
-- uses anon-role with nickname-based identity (no JWT sub).
-- ============================================================
-- If you upgraded from older signatures, remove legacy overloads:
-- drop function if exists public.submit_answer(text, uuid, text);
-- drop function if exists public.get_project_content(text, text);
-- drop function if exists public.get_explorer_storyline(text);

grant select on public.story_fragments to anon, authenticated;

-- Omit answer_hash from direct public reads
grant select (
  id, project_slug, node_type, order_index,
  title, prompt, options, hint, exp_reward,
  story_fragment_id, created_at
) on public.content_nodes to anon, authenticated;

-- Progress tables: anon-readable per RLS policy (true),
-- but no direct write access — all writes via RPCs.
grant select on public.explorer_content_progress to anon, authenticated;
grant select on public.explorer_story            to anon, authenticated;

-- RPC access
grant execute on function public.submit_answer(text, uuid, text, text)
  to anon, authenticated;
grant execute on function public.get_project_content(text, text, text)
  to anon, authenticated;
grant execute on function public.get_explorer_storyline(text, text)
  to anon, authenticated;

-- ============================================================
-- HELPER (run locally, not in Supabase)
-- To pre-compute an answer_hash before inserting a content node:
--
--   node.js:
--     const { createHash } = require('crypto');
--     const hash = createHash('sha256')
--       .update(answer.toLowerCase().trim())
--       .digest('hex');
--
--   browser console:
--     const enc = new TextEncoder();
--     const buf = await crypto.subtle.digest('SHA-256', enc.encode(answer.toLowerCase().trim()));
--     const hash = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
--
-- Valid project slugs (from src/pages/projects/):
--   boulder-box-saigon | e-america | gold-tracker
--   mbfs-au | mbfs-sea | semble
--   verity-digital-mrv | verity-nature
-- ============================================================
