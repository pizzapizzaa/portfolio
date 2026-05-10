-- ============================================================
-- Seed: Verity Nature MRV — 5 Quiz Questions
-- Run this in the Supabase SQL Editor AFTER schema_storyline.sql.
-- Safe to re-run: clears existing Verity Nature MRV quiz data first.
-- ============================================================

begin;

-- ── 1. Clear old Verity Nature MRV data (idempotent) ─────────
delete from public.explorer_content_progress
  where project_slug = 'verity-nature-mrv';

delete from public.explorer_story es
  using public.story_fragments sf
  where es.story_fragment_id = sf.id
    and sf.project_slug = 'verity-nature-mrv';

delete from public.content_nodes
  where project_slug = 'verity-nature-mrv';

delete from public.story_fragments
  where project_slug = 'verity-nature-mrv';

-- ── 2. Story fragments (one per question) ────────────────────
insert into public.story_fragments
  (project_slug, sequence_order, title, body, fragment_type)
values
  (
    'verity-nature-mrv', 1,
    'E of ESG',
    'Nature conservation sits squarely in the Environmental pillar. {{nickname}} just confirmed the foundation of ESG thinking in the MRV space.',
    'discovery'
  ),
  (
    'verity-nature-mrv', 2,
    'Debt for Nature',
    'A debt-for-nature swap turns financial pressure into conservation momentum. {{nickname}} unlocked how policy and ecology meet in practice.',
    'discovery'
  ),
  (
    'verity-nature-mrv', 3,
    'Signal vs Noise',
    'Greenwashing erodes trust by overstating sustainability claims. {{nickname}} now knows the term MRV teams are trained to spot.',
    'discovery'
  ),
  (
    'verity-nature-mrv', 4,
    'Nature Disclosures',
    'The TNFD framework helps organizations map nature-related risks and opportunities. {{nickname}} is tracking the right disclosure system.',
    'revelation'
  ),
  (
    'verity-nature-mrv', 5,
    'Net Gain',
    'Biodiversity Net Gain means development leaves ecosystems stronger than before. {{nickname}} completed the Verity Nature MRV field study. +250 EXP earned across 5 quests.',
    'epilogue'
  ),
  (
    'verity-nature-mrv', 6,
    'Signal Boost',
    'Every restoration story deserves a wider audience. {{nickname}} just helped carry Verity Nature''s mission beyond this page. +50 EXP bonus awarded.',
    'discovery'
  );

-- ── 3. Content nodes (5 quiz questions) ──────────────────────
with frags as (
  select id, sequence_order
  from public.story_fragments
  where project_slug = 'verity-nature-mrv'
)
insert into public.content_nodes
  (project_slug, node_type, order_index, title, prompt, options, answer_hash, hint, exp_reward, story_fragment_id)
select
  'verity-nature-mrv',
  'quiz',
  q.order_index,
  q.title,
  q.prompt,
  q.options::jsonb,
  q.answer_hash,
  q.hint,
  50,
  (select id from frags where sequence_order = q.order_index)
from (values
  (
    1,
    'ESG Pillars',
    'Under which of the three pillars of ESG does nature conservation and biodiversity protection primarily fall?',
    '["Social", "Environmental", "Economic", "Governance"]',
    '4cb948126bc7cece459ef8c18b1268d9782c36974a96bc457f7aad4f7372fb4a',
    'Think nature and climate impact.'
  ),
  (
    2,
    'Debt for Nature',
    'What is the primary goal of a debt-for-nature swap in environmental conservation?',
    '["To forgive a developing nation''s foreign debt in exchange for local conservation commitments", "To allow companies to pay fines instead of reducing their carbon emissions", "To buy land from indigenous populations to build commercial reserves", "To trade carbon credits on an open stock exchange"]',
    '1f835184216fde6ce2ca42727e4a08524ecd004c01ed07e59c7469a1fceb2257',
    'It trades debt relief for protection on the ground.'
  ),
  (
    3,
    'ESG Claims',
    'Which term describes the practice of making misleading claims about environmental benefits to appear more ESG-friendly than it is?',
    '["Greenwashing", "Eco-branding", "Biophilic design", "Carbon offsetting"]',
    '6f783c3671202e4826b8de77ba5a8115f3e691854a28fe182230872f76399d31',
    'It is about deceptive sustainability marketing.'
  ),
  (
    4,
    'Nature Disclosures',
    'Which international framework was established to help businesses and financial institutions assess, report, and act on nature-related dependencies, impacts, risks, and opportunities?',
    '["TCFD (Task Force on Climate-related Financial Disclosures)", "The Paris Agreement", "TNFD (Task Force on Nature-related Financial Disclosures)", "The Kyoto Protocol"]',
    '0d13e40b0a89f179139d5cb4694dd076cb4c8076c2fb6fcd7ce1f96fe3c7a093',
    'Look for the task force with nature in the name.'
  ),
  (
    5,
    'Biodiversity Net Gain',
    'What is meant by the term Biodiversity Net Gain (BNG) in sustainable land development?',
    '["Replacing natural forests with synthetic, easy-to-manage green spaces", "Maximizing the financial profits of a green energy project", "Ensuring that a development project leaves the natural environment in a measurably better state than it was before", "Counting the total number of trees cut down during a project"]',
    '5910d3ad7d0ca7b1935fa8174d31d18a0970a7db1ba4e10a5fa2bbc66f3fd2dd',
    'The outcome is a measurable improvement over baseline.'
  )
) as q(order_index, title, prompt, options, answer_hash, hint);

-- ── 4. Share bonus node (puzzle — no options, awarded on social share) ──
insert into public.content_nodes
  (project_slug, node_type, order_index, title, prompt, options, answer_hash, hint, exp_reward, story_fragment_id)
values (
  'verity-nature-mrv',
  'puzzle',
  6,
  'Share the Mission',
  'Share the Verity Nature MRV project page on LinkedIn or another social channel to earn a bonus.',
  null,
  'a4d26868017c0ccffe2efe50944ef4211834660cca834c6e9f86dec6a88246fa',  -- sha256("shared")
  null,
  50,
  (select id from public.story_fragments
   where project_slug = 'verity-nature-mrv' and sequence_order = 6)
);

commit;
