/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000',
        secondary: '#000000',
        background: '#FFFFFF',
        text: '#000000',
        accent: '#FF0000',
        error: '#FF0000',
        success: '#000000',
        // Existing colors
        'var-background': "var(--background)",
        'var-foreground': "var(--foreground)",
      },
      boxShadow: {
        card: '0 8px 30px rgba(0, 0, 0, 0.08)',
        button: '0 4px 15px rgba(255, 0, 0, 0.3)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      },
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      transitionDuration: {
        'fast': '0.2s',
        'normal': '0.3s',
      },
    },
  },
  plugins: [],
};
