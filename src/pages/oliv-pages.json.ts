import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const pages = Object.keys(import.meta.glob('./**/*.astro'))
    .filter((path) => path === './index.astro' || (
      path.startsWith('./projects/') && path !== './projects/index.astro'
    ))
    .map((path) => path === './index.astro' ? '/' : path.slice(1, -6))
    .sort();

  return new Response(JSON.stringify(pages), {
    headers: { 'Content-Type': 'application/json' },
  });
};
