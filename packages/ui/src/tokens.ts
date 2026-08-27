/**
 * Design tokens shared by every StudioTerrain surface. Consumed by
 * apps/web/tailwind.config.ts via `theme.extend`. Two shades per accent:
 * "-fill" for icons/backgrounds, "-text" for text-on-ivory (WCAG AA).
 */
export const colors = {
  ivory: '#FBF9F4',
  anthracite: '#2B2E33',
  terracotta: {
    fill: '#C1613D',
    text: '#8A4429',
  },
  sage: {
    fill: '#8FA687',
    text: '#4E5E48',
  },
  petrol: {
    fill: '#1F5B6B',
    text: '#164A57',
  },
  danger: {
    fill: '#B3261E',
    text: '#8C1D17',
  },
} as const;

export const radius = {
  card: '1rem',
  control: '0.75rem',
} as const;

export const motionDurationMs = {
  fast: 150,
  base: 200,
  slow: 250,
} as const;

export const touchTarget = {
  minPx: 44,
} as const;

export const tailwindThemeExtend = {
  colors: {
    ivory: colors.ivory,
    anthracite: colors.anthracite,
    terracotta: { DEFAULT: colors.terracotta.fill, text: colors.terracotta.text },
    sage: { DEFAULT: colors.sage.fill, text: colors.sage.text },
    petrol: { DEFAULT: colors.petrol.fill, text: colors.petrol.text },
    danger: { DEFAULT: colors.danger.fill, text: colors.danger.text },
  },
  borderRadius: {
    card: radius.card,
    control: radius.control,
  },
  transitionDuration: {
    fast: `${motionDurationMs.fast}ms`,
    base: `${motionDurationMs.base}ms`,
    slow: `${motionDurationMs.slow}ms`,
  },
};
