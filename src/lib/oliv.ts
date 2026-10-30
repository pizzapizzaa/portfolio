export interface OlivFact {
  text: string;
  href: string;
  source: string;
}

const contentSelector = [
  '.brief__tx-body p',
  '.brief__quote p:last-child',
  '.log__desc',
  '.log__resp li',
  '.skills__badge-text',
  '.mission__desc',
  '.case-field-value',
  '.case-field-list li',
].join(', ');

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function extractOlivFacts(html: string, pathname: string): OlivFact[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const pageTitle = doc.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() ?? 'Portfolio';
  const facts = new Map<string, OlivFact>();

  doc.querySelectorAll(`main :is(${contentSelector})`).forEach((el) => {
    const text = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    if (text.length < 60 || text.length > 900 || /[?[\]]|case study will be updated|check back soon/i.test(text)) return;
    const section = el.closest('section[id], #report');
    const heading = el.closest('.case-section, .log__card')?.querySelector('h2, h3')
      ?? section?.querySelector('h2');
    const context = heading?.textContent?.replace(/\s+/g, ' ').trim();
    facts.set(text, {
      text,
      href: `${pathname}${section?.id ? `#${section.id}` : ''}`,
      source: context ? `${pageTitle} / ${context}` : pageTitle,
    });
  });
  return [...facts.values()];
}

export function createOlivReader() {
  let pages: string[] = [];
  let lastPage = '';
  let lastText = '';
  const seen = new Map<string, Set<string>>();

  return async (): Promise<OlivFact> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const options = { cache: 'no-store', signal: controller.signal } as const;
      const index = await fetch('/oliv-pages.json', options);
      if (!index.ok) throw new Error(`Oliv page index returned ${index.status}`);
      const available: unknown = await index.json();
      if (!Array.isArray(available) || !available.length ||
        !available.every((path): path is string => typeof path === 'string' && /^\/(?:projects\/[a-z0-9-]+)?$/.test(path))) {
        throw new Error('Oliv page index is invalid');
      }

      pages = pages.filter((path) => available.includes(path));
      if (!pages.length) {
        pages = shuffle(available);
        if (pages.length > 1 && pages[0] === lastPage) pages.push(pages.shift()!);
      }
      const pathname = pages.shift()!;
      lastPage = pathname;
      const response = await fetch(pathname, options);
      if (!response.ok) throw new Error(`Oliv source ${pathname} returned ${response.status}`);
      const facts = extractOlivFacts(await response.text(), pathname);
      if (!facts.length) throw new Error(`Oliv found no published facts at ${pathname}`);
      const read = seen.get(pathname) ?? new Set<string>();
      let candidates = facts.filter((fact) => !read.has(fact.text) && fact.text !== lastText);
      if (!candidates.length) {
        read.clear();
        candidates = facts.filter((fact) => fact.text !== lastText);
      }
      const fact = shuffle(candidates.length ? candidates : facts)[0];
      read.add(fact.text);
      seen.set(pathname, read);
      lastText = fact.text;
      return fact;
    } finally {
      window.clearTimeout(timeout);
    }
  };
}
