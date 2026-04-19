import { useEffect, useRef, useState } from 'react';

export function useLoginViewport({ enabled }) {
  const [focusedField, setFocusedField] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [viewportTop, setViewportTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const blurTimeoutRef = useRef(null);
  const viewportBaseHeightRef = useRef(0);

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
      setKeyboardOpen(false);
      setViewportTop(0);
      setViewportHeight(0);
      viewportBaseHeightRef.current = 0;
      return undefined;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      return undefined;
    }

    const updateKeyboardState = () => {
      if (focusedField === '') {
        viewportBaseHeightRef.current = Math.max(viewportBaseHeightRef.current, viewport.height);
        setKeyboardOpen(false);
        setViewportTop(0);
        setViewportHeight(0);
        return;
      }

      const viewportBaseHeight = viewportBaseHeightRef.current || viewport.height;
      const isKeyboardVisible = viewportBaseHeight - viewport.height > 80;

      setKeyboardOpen(isKeyboardVisible);
      setViewportTop(isKeyboardVisible ? viewport.offsetTop : 0);
      setViewportHeight(isKeyboardVisible ? viewport.height : 0);
    };

    updateKeyboardState();

    viewport.addEventListener('resize', updateKeyboardState);
    viewport.addEventListener('scroll', updateKeyboardState);

    return () => {
      viewport.removeEventListener('resize', updateKeyboardState);
      viewport.removeEventListener('scroll', updateKeyboardState);
    };
  }, [enabled, focusedField]);

  const handleFieldFocus = (field) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setFocusedField(field);
  };

  const handleFieldBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setFocusedField('');
      blurTimeoutRef.current = null;
    }, 80);
  };

  return {
    focusedField,
    handleFieldBlur,
    handleFieldFocus,
    keyboardOpen,
    viewportHeight,
    viewportTop,
  };
}
