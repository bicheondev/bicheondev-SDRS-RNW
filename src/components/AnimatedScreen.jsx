import { useAnimate } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';

import {
  getScreenMotionState,
  getScreenTransition,
  getScreenZIndex,
  hiddenScreenState,
  visibleScreenState,
} from '../motion';

export default function AnimatedScreen({ children, currentScreen, navDir, reducedMotion = false, screenKey }) {
  const [scope, animate] = useAnimate();
  const isActive = currentScreen === screenKey;
  const previousActiveRef = useRef(null);

  useLayoutEffect(() => {
    const element = scope.current;
    let cancelled = false;

    if (!element) {
      return undefined;
    }

    if (previousActiveRef.current === null) {
      previousActiveRef.current = isActive;
      element.style.visibility = isActive ? 'visible' : 'hidden';
      element.style.zIndex = isActive ? '1' : '0';

      if (!isActive) {
        animate(element, hiddenScreenState, { duration: 0 });
      } else {
        animate(element, visibleScreenState, { duration: 0 });
      }

      return undefined;
    }

    if (previousActiveRef.current === isActive) {
      return undefined;
    }

    previousActiveRef.current = isActive;
    element.style.willChange = 'transform, opacity';

    if (reducedMotion) {
      if (isActive) {
        element.style.visibility = 'visible';
        element.style.zIndex = '1';
      }

      animate(element, isActive ? visibleScreenState : hiddenScreenState, getScreenTransition(navDir, true)).then(() => {
        if (cancelled || !element) {
          return;
        }

        if (isActive) {
          element.style.zIndex = '1';
          element.style.willChange = '';
          return;
        }

        element.style.visibility = 'hidden';
        element.style.zIndex = '0';
        element.style.willChange = '';
      });

      return () => {
        cancelled = true;
      };
    }

    if (isActive) {
      element.style.visibility = 'visible';
      element.style.zIndex = String(getScreenZIndex(navDir, true));

      animate(element, getScreenMotionState(navDir, 'enter', reducedMotion), { duration: 0 }).then(() => {
        if (cancelled || !element) {
          return;
        }

        animate(element, visibleScreenState, getScreenTransition(navDir, reducedMotion)).then(() => {
          if (!cancelled && element) {
            element.style.zIndex = '1';
            element.style.willChange = '';
          }
        });
      });
    } else {
      element.style.zIndex = String(getScreenZIndex(navDir, false));

      animate(element, getScreenMotionState(navDir, 'exit', reducedMotion), getScreenTransition(navDir, reducedMotion)).then(() => {
        if (!cancelled && element) {
          animate(element, hiddenScreenState, { duration: 0 });
          element.style.visibility = 'hidden';
          element.style.zIndex = '0';
          element.style.willChange = '';
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [animate, isActive, navDir, reducedMotion, scope]);

  return (
    <div
      className="animated-screen"
      ref={scope}
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: isActive ? 'auto' : 'none' }}
      aria-hidden={!isActive}
      inert={isActive ? undefined : ''}
    >
      {children}
    </div>
  );
}
