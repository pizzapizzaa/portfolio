// Lightweight Astro-friendly appear animator
// Finds elements injected from the Framer export that have
// `data-framer-appear-id` and applies a simple fade/slide-in
// using the Web Animations API. This intentionally avoids
// the Framer runtime and provides a minimal, replaceable behavior.

function animateElement(el) {
  try {
    const computed = getComputedStyle(el);
    const toOpacity = parseFloat(computed.opacity) || 1;
    const from = { opacity: 0, transform: 'translateY(20px)' };
    const to = { opacity: toOpacity, transform: 'none' };
    const opts = { duration: 800, easing: 'cubic-bezier(.44,0,.56,1)', fill: 'forwards' };
    el.animate([from, to], opts);
  } catch (e) {
    // fallback: just set visible
    el.style.opacity = '';
  }
}

function init() {
  if (!('IntersectionObserver' in window)) {
    // If no IO, animate all immediately
    document.querySelectorAll('[data-framer-appear-id]').forEach(animateElement);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateElement(entry.target);
        obs.unobserve(entry.target);
      }
    }
  }, { threshold: 0.05 });

  document.querySelectorAll('[data-framer-appear-id]').forEach((el) => {
    // If element already visible, animate immediately
    if (el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0) {
      animateElement(el);
    } else {
      io.observe(el);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default { init };
