import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

import { useLoginViewport } from '../../src/features/auth/useLoginViewport.js';
import { useReducedMotionSafe } from '../../src/hooks/useReducedMotionSafe.js';
import { getMotionCssVariables } from '../../src/motion.js';
import { RnwAuthScreen } from './auth/RnwAuthScreen.jsx';
import { preloadRnwAppBootstrap } from './app/useRnwAppBootstrap.js';
import AnimatedScreen from './dom/AnimatedScreenDom.jsx';

const RnwMainAppShell = lazy(() => import('./app/RnwMainAppShell.jsx'));

function preloadRnwMainAppShell() {
  return import('./app/RnwMainAppShell.jsx');
}

export function RnwApp() {
  const reducedMotion = useReducedMotionSafe();
  const [route, setRoute] = useState('login');
  const [routeTransition, setRouteTransition] = useState('none');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const loginViewport = useLoginViewport({ enabled: route === 'login' });
  const isFilled = username.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    let timeoutId = null;
    let idleCallbackId = null;

    const warmLoginSuccessPath = () => {
      preloadRnwMainAppShell();
      preloadRnwAppBootstrap();
    };

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(warmLoginSuccessPath, {
        timeout: 900,
      });
    } else {
      timeoutId = window.setTimeout(warmLoginSuccessPath, 240);
    }

    return () => {
      if (idleCallbackId !== null && typeof window !== 'undefined') {
        window.cancelIdleCallback?.(idleCallbackId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isFilled) {
      return;
    }

    preloadRnwMainAppShell();
    preloadRnwAppBootstrap();
  }, [isFilled]);

  useEffect(() => {
    if (route === 'app') {
      setHasEnteredApp(true);
    }
  }, [route]);

  const handleEnterMainScreen = useCallback(() => {
    preloadRnwMainAppShell();
    preloadRnwAppBootstrap();
    setRouteTransition('loginToMain');
    setRoute('app');
  }, []);

  const handleLogout = useCallback(() => {
    setPassword('');
    setUsername('');
    setRouteTransition('logout');
    setRoute('login');
  }, []);

  return (
    <div className="screen-stack" style={getMotionCssVariables(reducedMotion)}>
      <AnimatedScreen
        screenKey="login"
        currentScreen={route}
        navDir={routeTransition}
        reducedMotion={reducedMotion}
      >
        <RnwAuthScreen
          focusedField={loginViewport.focusedField}
          isFilled={isFilled}
          onFieldBlur={loginViewport.handleFieldBlur}
          onFieldFocus={loginViewport.handleFieldFocus}
          onPasswordChange={setPassword}
          onSubmit={handleEnterMainScreen}
          onUsernameChange={setUsername}
          password={password}
          username={username}
        />
      </AnimatedScreen>

      <AnimatedScreen
        screenKey="app"
        currentScreen={route}
        navDir={routeTransition}
        reducedMotion={reducedMotion}
      >
        {hasEnteredApp ? (
          <Suspense fallback={null}>
            <RnwMainAppShell
              isActive={route === 'app'}
              onLogout={handleLogout}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        ) : null}
      </AnimatedScreen>
    </div>
  );
}
