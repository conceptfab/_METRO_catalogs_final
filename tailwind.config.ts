import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        border: 'rgb(from var(--border) r g b / <alpha-value>)',
        input: 'rgb(from var(--input) r g b / <alpha-value>)',
        ring: 'rgb(from var(--ring) r g b / <alpha-value>)',
        background: 'rgb(from var(--background) r g b / <alpha-value>)',
        foreground: 'rgb(from var(--foreground) r g b / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(from var(--primary) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--primary-foreground) r g b / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(from var(--secondary) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--secondary-foreground) r g b / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(from var(--destructive) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--destructive-foreground) r g b / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(from var(--muted) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--muted-foreground) r g b / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(from var(--accent) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--accent-foreground) r g b / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(from var(--popover) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--popover-foreground) r g b / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(from var(--card) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--card-foreground) r g b / <alpha-value>)',
        },
        surface: 'rgb(from var(--surface) r g b / <alpha-value>)',
        'surface-elevated': 'rgb(from var(--surface-elevated) r g b / <alpha-value>)',
        'on-dark': 'rgb(from var(--on-dark) r g b / <alpha-value>)',
        'on-dark-muted': 'rgb(from var(--on-dark-muted) r g b / <alpha-value>)',
        'on-dark-subtle': 'rgb(from var(--on-dark-subtle) r g b / <alpha-value>)',
        warm: {
          light: 'rgb(from var(--warm-light) r g b / <alpha-value>)',
        },
        catalog: {
          footer: 'rgb(from var(--catalog-footer-background) r g b / <alpha-value>)',
        },
        product: {
          header: 'rgb(from var(--product-table-header) r g b / <alpha-value>)',
          muted: 'rgb(from var(--product-table-muted) r g b / <alpha-value>)',
          text: 'rgb(from var(--product-table-text) r g b / <alpha-value>)',
        },
        success: 'rgb(from var(--success) r g b / <alpha-value>)',
        info: 'rgb(from var(--info) r g b / <alpha-value>)',
        warning: {
          DEFAULT: 'rgb(from var(--warning) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--warning-foreground) r g b / <alpha-value>)',
        },
        chart: {
          '1': 'rgb(from var(--chart-1) r g b / <alpha-value>)',
          '2': 'rgb(from var(--chart-2) r g b / <alpha-value>)',
          '3': 'rgb(from var(--chart-3) r g b / <alpha-value>)',
          '4': 'rgb(from var(--chart-4) r g b / <alpha-value>)',
          '5': 'rgb(from var(--chart-5) r g b / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'rgb(from var(--sidebar-background) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--sidebar-foreground) r g b / <alpha-value>)',
          primary: 'rgb(from var(--sidebar-primary) r g b / <alpha-value>)',
          'primary-foreground': 'rgb(from var(--sidebar-primary-foreground) r g b / <alpha-value>)',
          accent: 'rgb(from var(--sidebar-accent) r g b / <alpha-value>)',
          'accent-foreground': 'rgb(from var(--sidebar-accent-foreground) r g b / <alpha-value>)',
          border: 'rgb(from var(--sidebar-border) r g b / <alpha-value>)',
          ring: 'rgb(from var(--sidebar-ring) r g b / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'token-sm': 'var(--shadow-sm)',
        'token-md': 'var(--shadow-md)',
        'token-lg': 'var(--shadow-lg)',
        'token-xl': 'var(--shadow-xl)',
      },
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
