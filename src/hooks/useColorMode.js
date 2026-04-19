import { useEffect, useState } from 'react';

export function useColorMode(initialMode = 'light') {
  const [colorMode, setColorMode] = useState(initialMode);
  const [systemColorMode, setSystemColorMode] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const resolvedColorMode = colorMode === 'system' ? systemColorMode : colorMode;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setSystemColorMode(event.matches ? 'dark' : 'light');
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = resolvedColorMode;
    root.style.colorScheme = resolvedColorMode;

    return () => {
      delete root.dataset.theme;
      root.style.colorScheme = '';
    };
  }, [resolvedColorMode]);

  return {
    colorMode,
    resolvedColorMode,
    setColorMode,
    systemColorMode,
  };
}
