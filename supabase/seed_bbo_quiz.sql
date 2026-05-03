-- ============================================================
-- Seed: Boulder Box Saigon — 5 Quiz Questions
-- Run this in the Supabase SQL Editor AFTER schema_storyline.sql.
-- Safe to re-run: clears existing BBO quiz data first.
-- ============================================================

begin;

begin;

-- ── 1. Clear old BBO data (idempotent) ───────────────────────
delete from public.explorer_content_progress
  where project_slug = 'boulder-box-saigon';

delete from public.explorer_story es
  using public.story_fragments sf
  where es.story_fragment_id = sf.id
    and sf.project_slug = 'boulder-box-saigon';

delete from public.content_nodes
  where project_slug = 'boulder-box-saigon';

delete from public.story_fragments
  where project_slug = 'boulder-box-saigon';


-- ── 2. Story fragments (one per question) ────────────────────
insert into public.story_fragments
  (project_slug, sequence_order, title, body, fragment_type)
values
  (
    'boulder-box-saigon', 1,
    'The Pioneer Spirit',
    'In the 1980s, the first commercial indoor climbing gyms opened their doors and changed fitness culture forever. Like {{nickname}}, the pioneers saw potential where others saw an empty wall. Every great concept starts with someone who dares to go first.',
    'discovery'
  ),
  (
    'boulder-box-saigon', 2,
    'The Language of Holds',
    'The jug — named for its resemblance to a jug handle — is every new climber''s best friend. At Boulder Box Saigon, Olivia carefully designed routes that introduce climbers to every hold type, building real skills from day one. {{nickname}} is learning to read the wall.',
    'discovery'
  ),
  (
    'boulder-box-saigon', 3,
    'White Powder, Clean Grip',
    'Chalk has been a climber''s secret weapon since the 1950s. At Boulder Box, quality matters down to the smallest detail — even the chalk. {{nickname}} now understands why grip is everything, in climbing and in building a business from scratch.',
    'discovery'
  ),
  (
    'boulder-box-saigon', 4,
    'The Safety Foundation',
    'Sourcing crash pads in Vietnam was a genuine challenge — the climbing gear supply chain barely existed. Olivia solved it through persistence and resourcefulness. {{nickname}} has just uncovered one of Boulder Box''s founding stories.',
    'revelation'
  ),
  (
    'boulder-box-saigon', 5,
    'The Sloper Mentality',
    'A sloper rewards patience and body positioning over brute strength. It''s the same philosophy that built Boulder Box Saigon: success didn''t come from forcing things — it came from finding the right angle and committing fully. {{nickname}}, you''ve completed the Boulder Box field study. +250 EXP earned across 5 quests.',
    'epilogue'
  ),
  (
    'boulder-box-saigon', 6,
    'Signal Boost',
    'Every story worth telling deserves a wider audience. {{nickname}} just helped carry Boulder Box Saigon''s mission beyond this page. Sharing is how communities grow — in climbing and in product work. +50 EXP bonus awarded.',
    'discovery'
  );


-- ── 3. Content nodes (5 quiz questions) ──────────────────────
-- Uses a CTE to look up fragment IDs by sequence_order.
with frags as (
  select id, sequence_order
  from public.story_fragments
  where project_slug = 'boulder-box-saigon'
)
insert into public.content_nodes
  (project_slug, node_type, order_index, title, prompt, options, answer_hash, hint, exp_reward, story_fragment_id)
select
  'boulder-box-saigon',
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
    'Origins of Indoor Climbing',
    'In what decade was the first indoor climbing gym established?',
    '["1960s", "1980s", "1940s", "2000s"]',
    'aa05ccc345c07555b732179750a6112a6de18f772265cbf7131489a86177572a',
    'Think about when recreational fitness culture started taking off globally.'
  ),
  (
    2,
    'Know Your Holds',
    'Which type of hold is characterized by a large, easy-to-grab opening that allows your whole hand to wrap around it?',
    '["Pocket", "Jug", "Crimp", "Sloper"]',
    '44b2255326ec1b073f52f569db4aa7baae174433a60e9ddad28459d08b2904f1',
    'The name comes from something you''d find in a kitchen.'
  ),
  (
    3,
    'The Climber''s Chalk',
    'What is the primary purpose of climbing chalk (magnesium carbonate)?',
    '["To increase the weight of the climber", "To mark the route for other climbers", "To protect the rock from erosion", "To absorb moisture and improve friction"]',
    '8632d60607b9a600ea88afe0df50ce670cdad76e8ff6607b46a8be67e2a1e8cf',
    'Think about what happens to your hands when you''re exerting effort.'
  ),
  (
    4,
    'Bouldering Safety',
    'In bouldering, what is the name of the thick foam mat used to protect climbers during a fall?',
    '["Crash Pad", "Belay Plate", "Safety Net", "Bouldering Bed"]',
    '9349f4515485b780dadd9f0b36b1f82c62cd7093c9ac154589cab0a837acce72',
    'The name hints at what happens when you make contact with it.'
  ),
  (
    5,
    'Reading the Wall',
    'Which of these is a ''static'' climbing hold that requires you to press your hand against it using friction rather than gripping an edge?',
    '["Sidepull", "Pinch", "Sloper", "Undercling"]',
    '96446dd8464f3d8e4800a1cfae51b3478e5b60326a87680b376d1591626525c4',
    'Picture a rounded, smooth surface — no edge to grab, just surface contact.'
  )
) as q(order_index, title, prompt, options, answer_hash, hint);


-- ── 4. Share bonus node (puzzle — no options, awarded on social share) ──
-- Answer is the literal word "shared" (lowercased, trimmed).
-- The client calls submit_answer with hash("shared") when user clicks a share button.
insert into public.content_nodes
  (project_slug, node_type, order_index, title, prompt, options, answer_hash, hint, exp_reward, story_fragment_id)
values (
  'boulder-box-saigon',
  'puzzle',
  6,
  'Share & Inspire',
  'Share the Boulder Box Saigon project page on LinkedIn or another social channel to earn a bonus.',
  null,
  'a4d26868017c0ccffe2efe50944ef4211834660cca834c6e9f86dec6a88246fa',  -- sha256("shared")
  null,
  50,
  (select id from public.story_fragments
   where project_slug = 'boulder-box-saigon' and sequence_order = 6)
);

commit;
