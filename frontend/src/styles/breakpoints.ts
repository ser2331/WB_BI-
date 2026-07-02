export const MOBILE = '768px';
export const SMALL_MOBILE = '480px';

export const media = {
  mobile: `@media (max-width: ${MOBILE})`,
  smallMobile: `@media (max-width: ${SMALL_MOBILE})`,
  desktop: `@media (min-width: 769px)`,
} as const;
