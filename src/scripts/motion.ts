// Site-wide motion: Lenis smooth scroll + GSAP ScrollTrigger, driven by data attributes.
//   [data-reveal]            fade/slide in when scrolled into view (stagger siblings via data-reveal-group)
//   [data-decode]            text scrambles then resolves (headlines, labels)
//   [data-count="13"]        number counts up; optional data-suffix / data-prefix
//   [data-draw]              element scaleY 0→1 tied to scroll (timeline lines)
//   a[data-warp]             starfield warp + sound before navigating
// Everything degrades to static content under prefers-reduced-motion.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { play } from './sound';

gsap.registerPlugin(ScrollTrigger);

export const EASE_OUT = 'expo.out';
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

declare global {
  interface Window { __lenis?: Lenis; }
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ';

export function decode(el: HTMLElement, duration = 0.9) {
  const final = el.dataset.decodeText ?? el.textContent ?? '';
  el.dataset.decodeText = final;
  if (reducedMotion) { el.textContent = final; return; }
  // Wait for webfonts so word widths are measured in the final font
  (document.fonts?.ready ?? Promise.resolve()).then(() => runDecode(el, final, duration));
}

// Each word is locked to its final width, so scrambled glyphs (which have different
// widths) can never change where a multi-line heading wraps.
function runDecode(el: HTMLElement, final: string, duration: number) {
  const parts = final.split(/(\s+)/);
  el.textContent = '';
  const words: { span: HTMLSpanElement; text: string; start: number }[] = [];
  let offset = 0;
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) { el.append(part); offset += part.length; continue; }
    const span = document.createElement('span');
    span.textContent = part;
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'nowrap';
    el.append(span);
    words.push({ span, text: part, start: offset });
    offset += part.length;
  }
  for (const w of words) w.span.style.width = `${w.span.getBoundingClientRect().width}px`;

  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate() {
      const reveal = Math.floor(state.p * final.length);
      for (const w of words) {
        let out = '';
        for (let i = 0; i < w.text.length; i++) {
          out += w.start + i < reveal ? w.text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        w.span.textContent = out;
      }
    },
    onComplete() { el.textContent = final; },
  });
}

// Lenis already honours html { scroll-padding-top } (global.css), so no extra offset here.
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

function initLenis() {
  if (reducedMotion) return;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initAnchors() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    scrollToTarget(el);
    history.pushState(null, '', url.hash);
  });

  // Arriving on /#section from another page: let Lenis do the final positioning
  if (location.hash) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) requestAnimationFrame(() => window.__lenis?.scrollTo(el, { immediate: true }));
  }
}

function initWarpLinks() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a[data-warp]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank') return;
    e.preventDefault();
    warpTo(a.href);
  });
}

export function warpTo(href: string) {
  play('warp');
  if (reducedMotion) { location.href = href; return; }
  window.dispatchEvent(new CustomEvent('space:warp', { detail: { duration: 900 } }));
  document.documentElement.classList.add('is-warping');
  setTimeout(() => { location.href = href; }, 520);
}

function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (reducedMotion) return;
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: EASE_OUT,
      stagger: 0.08,
      overwrite: true,
    }),
  });
}

function initDecodes() {
  gsap.utils.toArray<HTMLElement>('[data-decode]').forEach((el) => {
    if (reducedMotion) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => decode(el, Number(el.dataset.decode) || 0.9),
    });
  });
}

function initCounters() {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    const pad = Number(el.dataset.pad ?? 0);
    const fmt = (n: number) => prefix + String(Math.round(n)).padStart(pad, '0') + suffix;
    if (reducedMotion) { el.textContent = fmt(end); return; }
    const state = { n: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(state, {
        n: end,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = fmt(state.n); },
      }),
    });
  });
}

function initDraws() {
  gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
    if (reducedMotion) return;
    const trigger = el.closest<HTMLElement>('[data-draw-scope]') ?? el.parentElement!;
    gsap.fromTo(el, { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      transformOrigin: 'top center',
      scrollTrigger: { trigger, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
    });
  });
}

let started = false;
export function startMotion() {
  if (started) return;
  started = true;
  initLenis();
  initAnchors();
  initWarpLinks();
  initReveals();
  initDecodes();
  initCounters();
  initDraws();
  document.documentElement.classList.add('motion-ready');
  // Fonts/images change layout heights after load
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
