const toMilliseconds = (seconds) => `${Math.round(seconds * 1000)}ms`;
const toBezier = (points) => `cubic-bezier(${points.join(', ')})`;

export const motionTokens = {
  ease: {
    ios: [0.22, 0.61, 0.36, 1],
    softExit: [0.32, 0.72, 0, 1],
    linear: [0, 0, 1, 1],
  },
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.24,
    screen: 0.32,
    image: 0.28,
  },
  spring: {
    screen: { type: 'spring', stiffness: 420, damping: 40, mass: 0.92 },
    tab: { type: 'spring', stiffness: 520, damping: 44, mass: 0.9 },
    sheet: { type: 'spring', stiffness: 500, damping: 42, mass: 0.9 },
    modal: { type: 'spring', stiffness: 560, damping: 40, mass: 0.86 },
    tap: { type: 'spring', stiffness: 720, damping: 38, mass: 0.4 },
    toast: { type: 'spring', stiffness: 620, damping: 42, mass: 0.8 },
  },
  scale: {
    iconTap: 0.96,
    buttonTap: 0.986,
    rowTap: 0.992,
    cardTap: 0.988,
    modalEnter: 0.96,
    toastEnter: 0.985,
    backgroundShift: 0.992,
  },
  offset: {
    pushEnter: 40,
    pushExit: 18,
    popEnter: 18,
    tabLift: 10,
    sheetLift: 20,
    modalLift: 14,
    toastLift: 12,
    loginLift: 10,
  },
  radius: {
    thumbnail: 6,
  },
  reduced: {
    duration: 0.08,
  },
};

export const motionDurationsMs = {
  instant: Math.round(motionTokens.duration.instant * 1000),
  fast: Math.round(motionTokens.duration.fast * 1000),
  normal: Math.round(motionTokens.duration.normal * 1000),
  screen: Math.round(motionTokens.duration.screen * 1000),
  image: Math.round(motionTokens.duration.image * 1000),
};

export function getMotionCssVariables(reducedMotion = false) {
  const fastDuration = reducedMotion ? motionTokens.reduced.duration : motionTokens.duration.fast;
  const normalDuration = reducedMotion ? motionTokens.reduced.duration : motionTokens.duration.normal;
  const screenDuration = reducedMotion ? motionTokens.reduced.duration : motionTokens.duration.screen;
  const imageDuration = reducedMotion ? motionTokens.reduced.duration : motionTokens.duration.image;

  return {
    '--motion-duration-fast': toMilliseconds(fastDuration),
    '--motion-duration-normal': toMilliseconds(normalDuration),
    '--motion-duration-screen': toMilliseconds(screenDuration),
    '--motion-duration-image': toMilliseconds(imageDuration),
    '--motion-ease-standard': toBezier(motionTokens.ease.ios),
    '--motion-ease-soft-exit': toBezier(motionTokens.ease.softExit),
    '--motion-press-scale-button': String(motionTokens.scale.buttonTap),
    '--motion-press-scale-row': String(motionTokens.scale.rowTap),
    '--motion-thumbnail-radius': `${motionTokens.radius.thumbnail}px`,
  };
}

export function getPressMotion(kind = 'button', options = {}) {
  const { enabled = true, whileTap = {} } = options;

  if (!enabled) {
    return {};
  }

  let scale = motionTokens.scale.buttonTap;

  if (kind === 'icon') {
    scale = motionTokens.scale.iconTap;
  } else if (kind === 'row') {
    scale = motionTokens.scale.rowTap;
  } else if (kind === 'card') {
    scale = motionTokens.scale.cardTap;
  }

  return {
    whileTap: {
      scale,
      ...whileTap,
    },
    transition: motionTokens.spring.tap,
  };
}

const SCREEN_STATES = {
  none: {
    enter: { x: 0, y: 0, opacity: 1, scale: 1 },
    exit: { x: 0, y: 0, opacity: 1, scale: 1 },
  },
  push: {
    enter: { x: 32, y: 0, opacity: 1, scale: 1 },
    exit: { x: -12, y: 0, opacity: 0.96, scale: 0.996 },
  },
  pop: {
    enter: { x: -12, y: 0, opacity: 0.96, scale: 0.996 },
    exit: { x: 32, y: 0, opacity: 1, scale: 1 },
  },
  tab: {
    enter: { x: 0, y: 0, opacity: 0, scale: 0.998 },
    exit: { x: 0, y: 0, opacity: 0, scale: 1.002 },
  },
  tabBack: {
    enter: { x: 0, y: 0, opacity: 0, scale: 0.998 },
    exit: { x: 0, y: 0, opacity: 0, scale: 0.998 },
  },
  sheet: {
    enter: { x: 0, y: motionTokens.offset.sheetLift, opacity: 0, scale: 1 },
    exit: { x: 0, y: -4, opacity: 0, scale: 0.998 },
  },
  sheetBack: {
    enter: { x: 0, y: 2, opacity: 0, scale: 0.998 },
    exit: { x: 0, y: motionTokens.offset.sheetLift, opacity: 0, scale: 0.998 },
  },
  loginToMain: {
    enter: { x: 0, y: motionTokens.offset.loginLift, opacity: 0, scale: 0.982 },
    exit: { x: 0, y: 0, opacity: 0, scale: 1.01 },
  },
  logout: {
    enter: { x: 0, y: 0, opacity: 0, scale: 1.01 },
    exit: { x: 0, y: motionTokens.offset.loginLift, opacity: 0, scale: 0.985 },
  },
};

export const hiddenScreenState = { opacity: 0, x: 0, y: 0, scale: 1 };
export const visibleScreenState = { opacity: 1, x: 0, y: 0, scale: 1 };

export function getScreenMotionState(direction, phase, reducedMotion = false) {
  if (reducedMotion) {
    if (phase === 'enter') {
      return { ...visibleScreenState, opacity: 0 };
    }

    if (phase === 'exit') {
      return { ...visibleScreenState, opacity: 0 };
    }

    return hiddenScreenState;
  }

  return SCREEN_STATES[direction]?.[phase] ?? (phase === 'enter' ? visibleScreenState : hiddenScreenState);
}

export function getScreenTransition(direction, reducedMotion = false) {
  if (direction === 'none') {
    return { duration: 0, ease: motionTokens.ease.linear };
  }

  if (reducedMotion) {
    return { duration: motionTokens.reduced.duration, ease: motionTokens.ease.linear };
  }

  if (direction === 'push' || direction === 'pop') {
    return {
      duration: motionTokens.duration.screen,
      ease: motionTokens.ease.ios,
    };
  }

  if (direction === 'tab' || direction === 'tabBack') {
    return motionTokens.spring.tab;
  }

  if (direction === 'sheet' || direction === 'sheetBack') {
    return motionTokens.spring.sheet;
  }

  if (direction === 'loginToMain' || direction === 'logout') {
    return { duration: motionTokens.duration.normal, ease: motionTokens.ease.ios };
  }

  return { duration: motionTokens.duration.fast, ease: motionTokens.ease.ios };
}

export function getScreenZIndex(direction, entering) {
  if (direction === 'none') {
    return entering ? 3 : 1;
  }

  if (entering) {
    if (direction === 'push' || direction === 'tab' || direction === 'sheet' || direction === 'loginToMain') {
      return 3;
    }

    return 1;
  }

  if (direction === 'pop' || direction === 'tabBack' || direction === 'sheetBack' || direction === 'logout') {
    return 3;
  }

  return 1;
}

export function getModalBackdropMotion(reducedMotion = false) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: reducedMotion ? motionTokens.reduced.duration : motionTokens.duration.fast,
      ease: motionTokens.ease.ios,
    },
  };
}

export function getModalCardMotion(reducedMotion = false) {
  return {
    initial: reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: motionTokens.offset.modalLift, scale: motionTokens.scale.modalEnter },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: motionTokens.offset.modalLift * 0.72, scale: motionTokens.scale.toastEnter },
    transition: reducedMotion
      ? { duration: motionTokens.reduced.duration, ease: motionTokens.ease.linear }
      : motionTokens.spring.modal,
  };
}

export function getToastMotion(reducedMotion = false) {
  return {
    initial: reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: motionTokens.offset.toastLift, scale: motionTokens.scale.toastEnter },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: motionTokens.offset.toastLift, scale: motionTokens.scale.toastEnter },
    transition: reducedMotion
      ? { duration: motionTokens.reduced.duration, ease: motionTokens.ease.linear }
      : motionTokens.spring.toast,
  };
}
