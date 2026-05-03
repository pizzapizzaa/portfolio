import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.PUBLIC_SUPABASE_URL  ?? '';
const supabaseKey  = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Supabase client — null when env vars are missing (dev fallback).
 * The landing page gracefully falls back to localStorage-only mode.
 */
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// ── Explorer profile types ──────────────────────────────────
// pin_hash is intentionally absent — it is never returned to the client.
// All PIN verification happens inside the register_explorer() RPC.

export interface Explorer {
  id:             string;
  nickname:       string;
  server:         string;
  marker:         string;
  exp:            number;
  level:          number;
  visit_count:    number;
  last_seen:      string;
  achievements:   string[];
  pages_explored: string[];
  created_at:     string;
}

export type RegisterResult =
  | { ok: true;  explorer: Explorer; isNew: boolean }
  | { ok: false; reason: 'wrong_pin' | 'locked' | 'invalid_input' | 'db_error'; lockedUntil?: string };

// ── Level helpers ───────────────────────────────────────────

/** EXP thresholds: 100 EXP per level (level = floor(exp/100)+1) */
export function calcLevel(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

/** Progress within the current level (0–1) */
export function expProgress(exp: number): number {
  const level = calcLevel(exp);
  const base  = (level - 1) * 100;
  return (exp - base) / 100;
}

export const RANK_TITLES = ['CADET', 'SCOUT', 'NAVIGATOR', 'PATHFINDER', 'EXPLORER', 'CAPTAIN', 'COMMANDER'] as const;

export function rankTitle(level: number): string {
  return RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)];
}

// ── Achievement definitions (client-side labels/icons only) ─

export interface Achievement {
  id:    string;
  label: string;
  icon:  string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_contact', label: 'First Contact',    icon: '📡' },
  { id: 'regular',       label: 'Regular',          icon: '🔁' },
  { id: 'veteran',       label: 'Veteran Explorer', icon: '🏅' },
];

// ── PIN helper ──────────────────────────────────────────────

/**
 * SHA-256 of "nickname_lower:pin" — sent to the server RPC.
 * The raw PIN never leaves the browser; the hash is only used
 * to verify identity server-side.
 */
export async function hashPin(nickname: string, pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${nickname.toLowerCase()}:${pin}`);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Database helpers ────────────────────────────────────────

/** Lightweight nickname existence check for the "welcome back" UI hint. */
export async function checkNicknameExists(nickname: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from('explorers')
    .select('nickname')
    .eq('nickname', nickname)
    .maybeSingle();
  return !!data;
}

/**
 * Register or log in an explorer via the server-side RPC.
 *
 * Security properties enforced by the Postgres function:
 *  - PIN comparison is done entirely server-side (hash never returned to client)
 *  - Row is locked with FOR UPDATE before read → no TOCTOU race
 *  - Failed attempts tracked; account locked for 15 min after 3 failures
 *  - Direct INSERT/UPDATE RLS policies are revoked; only the RPC may write
 */
export async function registerExplorer(
  nickname: string,
  server:   string,
  marker:   string,
  pin:      string,
): Promise<RegisterResult> {
  if (!supabase) return { ok: false, reason: 'db_error' };

  const pinHash = await hashPin(nickname, pin);

  const { data, error } = await supabase.rpc('register_explorer', {
    p_nickname: nickname,
    p_pin_hash: pinHash,
    p_server:   server,
    p_marker:   marker,
  });

  if (error) {
    console.error('[Explorer] RPC error', error);
    return { ok: false, reason: 'db_error' };
  }

  const res = data as Record<string, unknown>;

  if (!res.ok) {
    return {
      ok:          false,
      reason:      (res.reason as 'wrong_pin' | 'locked' | 'invalid_input' | 'db_error') ?? 'db_error',
      lockedUntil: res.locked_until as string | undefined,
    };
  }

  const explorer: Explorer = {
    id:             res.id             as string,
    nickname:       res.nickname       as string,
    server:         res.server         as string,
    marker:         res.marker         as string,
    exp:            res.exp            as number,
    level:          res.level          as number,
    visit_count:    res.visit_count    as number,
    last_seen:      res.last_seen      as string,
    achievements:   res.achievements   as string[],
    pages_explored: res.pages_explored as string[],
    created_at:     res.created_at     as string,
  };

  return { ok: true, explorer, isNew: !!res.is_new };
}

/**
 * Atomically append a page slug to the explorer's pages_explored array.
 * Uses an RPC to avoid the read-modify-write race of the previous approach.
 */
export async function trackPage(nickname: string, pageSlug: string): Promise<void> {
  if (!supabase || !nickname) return;

  await supabase.rpc('track_explorer_page', {
    p_nickname: nickname,
    p_page:     pageSlug,
  });
}

