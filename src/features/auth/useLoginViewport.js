import { useCallback, useEffect, useRef, useState } from 'react';

const KEYBOARD_INSET_VAR = '--keyboard-inset';

function writeKeyboardInset(inset) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.style.setProperty(KEYBOARD_INSET_VAR, `${inset}px`);
}

export function useLoginViewport({ enabled }) {
  const [focusedField, setFocusedField] = useState('');
  const blurTimeoutRef = useRef(null);
  const lastInsetRef = useRef(0);

  useEffect(
    () => () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled) {
      setFocusedField('');
      writeKeyboardInset(0);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return undefined;
    }

    let baseline = window.innerHeight;
    let rafId = null;
    let pending = 0;

    const apply = () => {
      rafId = null;
      writeKeyboardInset(pending);
      if (pending > 0) {
        lastInsetRef.current = pending;
      }
    };

    const update = () => {
      if (window.innerHeight > baseline) {
        baseline = window.innerHeight;
      }

      const inset = Math.max(
        0,
        baseline - viewport.height - viewport.offsetTop,
      );

      if (inset === pending && rafId !== null) {
        return;
      }

      pending = inset;

      if (rafId === null) {
        rafId = window.requestAnimationFrame(apply);
      }
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      writeKeyboardInset(0);
    };
  }, [enabled]);

  const handleFieldFocus = useCallback((field) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setFocusedField(field);

    if (lastInsetRef.current > 0) {
      writeKeyboardInset(lastInsetRef.current);
    }
  }, []);

  const handleFieldBlur = useCallback(() => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setFocusedField('');
      writeKeyboardInset(0);
      blurTimeoutRef.current = null;
    }, 80);
  }, []);

  return {
    focusedField,
    handleFieldBlur,
    handleFieldFocus,
  };
}
