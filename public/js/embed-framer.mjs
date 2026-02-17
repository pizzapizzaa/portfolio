// Fetch and inject exported Framer HTML (from public/assets)
const EXPORT_HTML = '/assets/Olivia%20Nguyen%27s%20Portfolio.html';
const ASSETS_DIR_NAME = "Olivia Nguyen's Portfolio_files";
const ENCODED_DIR = encodeURIComponent(ASSETS_DIR_NAME);

function resolveAssetSrc(src) {
  if (!src) return src;
  let s = src.replace(/^\.\//, '');
  // If the path begins with the assets dir, strip that prefix
  if (s.startsWith(ASSETS_DIR_NAME + '/')) {
    s = s.slice((ASSETS_DIR_NAME + '/').length);
  }
  return '/assets/' + ENCODED_DIR + '/' + s;
}

async function mountExport() {
  const res = await fetch(EXPORT_HTML, { cache: 'no-cache' });
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  // Move head children (styles, links, meta) into document.head
  Array.from(doc.head.children).forEach((node) => {
    // Keep title from host page
    if (node.tagName === 'TITLE') return;

    // Remove Framer runtime/modulepreload and editor assets
    if (node.tagName === 'LINK') {
      const rel = node.getAttribute('rel') || '';
      const href = node.getAttribute('href') || '';
      // skip Framer modulepreload links
      if (rel === 'modulepreload' && /framerusercontent|framer\.com/i.test(href)) return;
      document.head.appendChild(node.cloneNode(true));
      return;
    }

    if (node.tagName === 'SCRIPT') {
      const src = node.getAttribute('src') || '';
      const type = node.getAttribute('type') || '';
      const dataBundle = node.hasAttribute('data-framer-bundle');
      // Skip Framer runtime and editor scripts
      if (/framerusercontent|framer\.com|events\.framer\.com/i.test(src) || dataBundle || type === 'framer/appear') {
        return;
      }

      const s = document.createElement('script');
      if (node.src) {
        s.src = resolveAssetSrc(node.getAttribute('src'));
        s.async = node.async;
      } else {
        // Skip inline Framer-specific scripts referencing "framer" or "animator"
        const text = node.textContent || '';
        if (/\bframer\b|\banimator\b|__framer__|data-framer-/i.test(text)) return;
        s.textContent = text;
      }
      document.head.appendChild(s);
    } else {
      document.head.appendChild(node.cloneNode(true));
    }
  });

  // Container where the exported body will be injected
  const container = document.getElementById('framer-root') || document.body;

  // Move body children into container; strip Framer runtime and editor UI
  Array.from(doc.body.children).forEach((node) => {
    // remove editor bar iframe/container that Framer includes
    if (node.id === '__framer__editorbar-container' || node.id === '__framer__editorbar' || node.id === '__framer-editorbar-container' || node.id === '__framer-editorbar') return;

    if (node.tagName === 'SCRIPT') {
      const src = node.getAttribute('src') || '';
      const type = node.getAttribute('type') || '';
      const text = node.textContent || '';

      // Skip Framer runtime scripts and appear/type scripts
      if (/framerusercontent|framer\.com|events\.framer\.com|script_main|shared-lib|motion|framer-appearance|__framer__|data-framer-/i.test(src + text) || type === 'framer/appear') {
        return;
      }

      const s = document.createElement('script');
      if (node.src) {
        s.src = resolveAssetSrc(node.getAttribute('src'));
        s.async = node.async;
      } else {
        s.textContent = text;
      }
      container.appendChild(s);
    } else {
      container.appendChild(node.cloneNode(true));
    }
  });

  // Load a small Astro-friendly appear/animation helper after injecting
  const astroScript = document.createElement('script');
  astroScript.type = 'module';
  astroScript.src = '/js/astro-appear.mjs';
  astroScript.async = true;
  document.body.appendChild(astroScript);
}

mountExport().catch((err) => {
  console.error('Failed to mount Framer export', err);
});
