export const MOBILE = '768px';

export const media = {
  mobile: `@media (max-width: ${MOBILE})`,
  desktop: `@media (min-width: 769px)`,
} as const;
