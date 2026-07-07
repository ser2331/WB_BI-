import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

function getIsMobile(): boolean {
  return typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
