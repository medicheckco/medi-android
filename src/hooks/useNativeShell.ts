import { useEffect } from 'react';

const getPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }

  if (/android/.test(userAgent)) {
    return 'android';
  }

  return 'web';
};

export function useNativeShell() {
  useEffect(() => {
    const root = document.documentElement;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const platform = getPlatform();
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isMobileShell = isStandalone || (isTouchDevice && platform !== 'web');

    const setAppHeight = () => {
      root.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    root.dataset.platform = platform;
    root.dataset.mobileShell = String(isMobileShell);
    setAppHeight();

    window.addEventListener('resize', setAppHeight);

    return () => {
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);
}
