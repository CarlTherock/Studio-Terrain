import type { ButtonHTMLAttributes } from 'react';

/** Microsoft's four-color logo mark, per the Microsoft identity platform branding guidelines. */
function MicrosoftLogoMark() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export interface MicrosoftSignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * "Sign in with Microsoft" button, styled per Microsoft's own branding
 * guidelines (white background, neutral border, the official four-color
 * logo mark) rather than StudioTerrain's own accent colors — this button
 * represents Microsoft's identity, not the app's.
 */
export function MicrosoftSignInButton({ label = 'Se connecter avec Microsoft', className = '', ...rest }: MicrosoftSignInButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-3 rounded-[2px] border border-[#8C8C8C] bg-white px-4 h-[41px] text-[15px] font-medium text-[#5E5E5E] transition-colors duration-base hover:bg-[#F3F2F1] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      <MicrosoftLogoMark />
      {label}
    </button>
  );
}
