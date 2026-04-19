import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

import { AuthScreen } from '../features/auth/AuthScreen.jsx';
import { useLoginViewport } from '../features/auth/useLoginViewport.js';
import { useReducedMotionSafe } from '../hooks/useReducedMotionSafe.js';
import { useRouteNavigation } from '../hooks/useRouteNavigation.js';
import AnimatedScreen from '../components/layout/AnimatedScreen.jsx';
import { getMotionCssVariables } from '../motion.js';
import { preloadAppBootstrap } from './useAppBootstrap.js';

const MainAppShell = lazy(() => import('./MainAppShell.jsx'));

function preloadMainAppShell() {
  return import('./MainAppShell.jsx');
}

export function AppShell() {
  const reducedMotion = useReducedMotionSafe();
  const authNavigation = useRouteNavigation('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const loginViewport = useLoginViewport({ enabled: authNavigation.screen === 'login' });
  const isFilled = username.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    let timeoutId = null;
    let idleCallbackId = null;

    const warmLoginSuccessPath = () => {
      preloadMainAppShell();
      preloadAppBootstrap();
    };

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(warmLoginSuccessPath, { timeout: 900 });
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

    preloadMainAppShell();
    preloadAppBootstrap();
  }, [isFilled]);

  useEffect(() => {
    if (authNavigation.screen === 'app') {
      setHasEnteredApp(true);
    }
  }, [authNavigation.screen]);

  const handleEnterMainScreen = useCallback(() => {
    preloadMainAppShell();
    preloadAppBootstrap();
    authNavigation.navigate('app', 'loginToMain');
  }, [authNavigation]);

  const handleLogout = useCallback(() => {
    setPassword('');
    setUsername('');
    authNavigation.navigate('login', 'logout');
  }, [authNavigation]);

  return (
    <div className="screen-stack" style={getMotionCssVariables(reducedMotion)}>
      <AnimatedScreen
        screenKey="login"
        currentScreen={authNavigation.screen}
        navDir={authNavigation.transition}
        reducedMotion={reducedMotion}
      >
        <AuthScreen
          focusedField={loginViewport.focusedField}
          isFilled={isFilled}
          keyboardOpen={loginViewport.keyboardOpen}
          onFieldBlur={loginViewport.handleFieldBlur}
          onFieldFocus={loginViewport.handleFieldFocus}
          onPasswordChange={setPassword}
          onSubmit={handleEnterMainScreen}
          onUsernameChange={setUsername}
          password={password}
          username={username}
          viewportHeight={loginViewport.viewportHeight}
          viewportTop={loginViewport.viewportTop}
        />
      </AnimatedScreen>

      <AnimatedScreen
        screenKey="app"
        currentScreen={authNavigation.screen}
        navDir={authNavigation.transition}
        reducedMotion={reducedMotion}
      >
        {hasEnteredApp ? (
          <Suspense fallback={null}>
            <MainAppShell
              isActive={authNavigation.screen === 'app'}
              onLogout={handleLogout}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        ) : null}
      </AnimatedScreen>
    </div>
  );
}
