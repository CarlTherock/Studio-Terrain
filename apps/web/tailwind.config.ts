import type { Config } from 'tailwindcss';
// Import the tokens module directly (not the package barrel) so Tailwind's
// standalone config loader never has to resolve the React/JSX component files.
import { tailwindThemeExtend } from '../../packages/ui/src/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: tailwindThemeExtend,
  },
  plugins: [],
} satisfies Config;
