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
    },
  },
  plugins: [],
}
