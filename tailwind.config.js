/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#ffb800',    // Yellow/gold
        brown: '#47351f',      // Brown
        cyan: '#4ffff6',       // Cyan/aqua
      },
      fontFamily: {
        heading: ['"Albert Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      screens: {
        'desktop': '1200px',
        'tablet': '810px',
        'mobile': '375px',
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
      },
      backdropBlur: {
        'xs': '2px',
        '40': '40px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'framer': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}

