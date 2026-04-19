import { lazy, Suspense, useEffect, useReducer, useState } from 'react';

import { AuthScreen } from '../features/auth/AuthScreen.jsx';
import { useLoginViewport } from '../features/auth/useLoginViewport.js';
import { DatabasePage } from '../features/database/DatabasePage.jsx';
import { useDatabaseFilters } from '../features/database/useDatabaseFilters.js';
import { useShipEditor } from '../features/manage/useShipEditor.js';
import { useColorMode } from '../hooks/useColorMode.js';
import { useReducedMotionSafe } from '../hooks/useReducedMotionSafe.js';
import { useRouteNavigation } from '../hooks/useRouteNavigation.js';
import { useStackNavigation } from '../hooks/useStackNavigation.js';
import AnimatedScreen from '../components/layout/AnimatedScreen.jsx';
import BottomTab from '../components/layout/BottomTab.jsx';
import { getMotionCssVariables } from '../motion.js';
import { appReducer, initialAppState } from './appReducer.js';
import { useAppBootstrap } from './useAppBootstrap.js';

const ManageHomePage = lazy(() =>
  import('../features/manage/ManageHomePage.jsx').then((module) => ({
    default: module.ManageHomePage,
  })),
);
const ManageShipEditPage = lazy(() =>
  import('../features/manage/ManageShipEditPage.jsx').then((module) => ({
    default: module.ManageShipEditPage,
  })),
);
const MenuPage = lazy(() =>
  import('../features/menu/MenuPage.jsx').then((module) => ({
    default: module.MenuPage,
  })),
);
const MenuModePage = lazy(() =>
  import('../features/menu/MenuModePage.jsx').then((module) => ({
    default: module.MenuModePage,
  })),
);
const MenuInfoPage = lazy(() =>
  import('../features/menu/MenuInfoPage.jsx').then((module) => ({
    default: module.MenuInfoPage,
  })),
);
const ImageZoomModal = lazy(() => import('../components/ImageZoomModal.jsx'));

export function AppShell() {
  const reducedMotion = useReducedMotionSafe();
  const [appState, dispatch] = useReducer(appReducer, initialAppState);
  const [hasVisitedManage, setHasVisitedManage] = useState(false);
  const [hasVisitedMenu, setHasVisitedMenu] = useState(false);
  const authNavigation = useRouteNavigation('login');
  const manageNavigation = useStackNavigation('manageHome');
  const menuNavigation = useStackNavigation('menu');
  const { colorMode, setColorMode } = useColorMode('light');
  const loginViewport = useLoginViewport({ enabled: authNavigation.screen === 'login' });
  const { databaseState, setDatabaseState } = useAppBootstrap();
  const databasePage = useDatabaseFilters({
    activeTab: appState.activeTab,
    authScreen: authNavigation.screen,
    shipRecords: databaseState.shipRecords,
  });
  const shipEditor = useShipEditor({
    databaseState,
    onShipsChanged: () => databasePage.setHarborFilter('전체 항포구'),
    setDatabaseState,
  });

  const isFilled = appState.username.trim() !== '' && appState.password.trim() !== '';

  useEffect(() => {
    if (authNavigation.screen !== 'app') {
      return undefined;
    }

    let timeoutId = null;
    let idleCallbackId = null;

    const warmSecondaryModules = () => {
      import('../features/manage/ManageHomePage.jsx');
      import('../features/manage/ManageShipEditPage.jsx');
      import('../features/menu/MenuPage.jsx');
      import('../features/menu/MenuModePage.jsx');
      import('../features/menu/MenuInfoPage.jsx');
      import('../components/ImageZoomModal.jsx');
    };

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(warmSecondaryModules, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(warmSecondaryModules, 240);
    }

    return () => {
      if (idleCallbackId !== null && typeof window !== 'undefined') {
        window.cancelIdleCallback?.(idleCallbackId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [authNavigation.screen]);

  useEffect(() => {
    if (appState.activeTab === 'manage') {
      setHasVisitedManage(true);
    }

    if (appState.activeTab === 'menu') {
      setHasVisitedMenu(true);
    }
  }, [appState.activeTab]);

  const navigateTab = (nextTab) => {
    dispatch({ type: 'navigate-tab', nextTab });
  };

  const showDatabaseHome = () => {
    databasePage.resetDatabasePage();
    navigateTab('db');
  };

  const openManage = () => {
    databasePage.resetDatabasePage();
    shipEditor.resetSession();
    manageNavigation.reset('manageHome');
    navigateTab('manage');
  };

  const openMenu = () => {
    databasePage.resetDatabasePage();
    menuNavigation.reset('menu');
    navigateTab('menu');
  };

  const openImageZoom = (vessel, collection = [vessel], sourceThumbnail = null) => {
    const vessels =
      Array.isArray(collection) && collection.length > 0 ? collection.slice() : [vessel];
    const startIndex = Math.max(
      0,
      vessels.findIndex((entry) => entry.id === vessel.id),
    );
    const sourceThumbToken =
      sourceThumbnail instanceof HTMLElement
        ? `zoom-thumb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        : null;
    const sourceRect =
      sourceThumbnail instanceof HTMLElement
        ? sourceThumbnail.getBoundingClientRect()
        : null;

    if (sourceThumbnail instanceof HTMLElement && sourceThumbToken) {
      sourceThumbnail.dataset.zoomThumbSource = sourceThumbToken;
    }

    dispatch({
      type: 'open-zoom',
      session: {
        vessels,
        startIndex,
        openedAt: Date.now(),
        sourceThumbToken,
        sourceRect: sourceRect
          ? {
              top: sourceRect.top,
              left: sourceRect.left,
              width: sourceRect.width,
              height: sourceRect.height,
            }
          : null,
      },
    });
  };

  const enterMainScreen = () => {
    databasePage.resetDatabasePage();
    dispatch({ type: 'reset-shell' });
    manageNavigation.reset('manageHome');
    menuNavigation.reset('menu');
    authNavigation.navigate('app', 'loginToMain');
  };

  const handleBottomTabDbClick = () => {
    if (appState.activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') {
      shipEditor.setPendingShipImport(null);
    }

    if (appState.activeTab === 'db' && databasePage.databaseView === 'search') {
      databasePage.closeSearch();
      return;
    }

    showDatabaseHome();
  };

  const handleBottomTabManageClick = appState.activeTab === 'manage' ? undefined : openManage;

  const handleBottomTabMenuClick = () => {
    if (appState.activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') {
      shipEditor.setPendingShipImport(null);
    }

    if (appState.activeTab === 'menu') {
      return;
    }

    openMenu();
  };

  const showBottomTab =
    appState.activeTab === 'db' ||
    (appState.activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') ||
    (appState.activeTab === 'menu' && menuNavigation.currentScreen === 'menu');
  const bottomTabCompact = appState.activeTab === 'manage' ? false : databasePage.compact;

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
          onPasswordChange={(value) =>
            dispatch({ type: 'set-login-field', field: 'password', value })
          }
          onSubmit={enterMainScreen}
          onUsernameChange={(value) =>
            dispatch({ type: 'set-login-field', field: 'username', value })
          }
          password={appState.password}
          username={appState.username}
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
        <div className="tab-stack">
          <AnimatedScreen
            fillMode="absolute"
            screenKey="db"
            currentScreen={appState.activeTab}
            navDir={appState.tabTransition}
            reducedMotion={reducedMotion}
          >
            <DatabasePage
              compact={databasePage.compact}
              databaseView={databasePage.databaseView}
              displayVessels={databasePage.displayVessels}
              filterSheet={databasePage.filterSheet}
              filteredDisplayVessels={databasePage.filteredDisplayVessels}
              harborFilter={databasePage.harborFilter}
              harborOptions={databasePage.harborOptions}
              mainContentRef={databasePage.mainContentRef}
              onFilterClose={databasePage.closeFilter}
              onFilterHarborSelect={databasePage.setHarborFilter}
              onFilterOpen={databasePage.openFilter}
              onFilterSearchOpen={databasePage.handleFilterSearchOpen}
              onFilterVesselTypeSelect={databasePage.setVesselTypeFilter}
              onImageClick={openImageZoom}
              onMainScroll={databasePage.handleMainScroll}
              onManageOpen={openManage}
              onMenuOpen={openMenu}
              onSearchClear={() => databasePage.setSearchQuery('')}
              onSearchClose={databasePage.closeSearch}
              onSearchOpen={databasePage.openSearch}
              onSearchQueryChange={databasePage.setSearchQuery}
              onToggleCompact={databasePage.handleCompactChange}
              searchedDisplayVessels={databasePage.searchedDisplayVessels}
              searchQuery={databasePage.searchQuery}
              topBarHidden={databasePage.topBarHidden}
              vesselTypeFilter={databasePage.vesselTypeFilter}
            />
          </AnimatedScreen>

          <AnimatedScreen
            fillMode="absolute"
            screenKey="manage"
            currentScreen={appState.activeTab}
            navDir={appState.tabTransition}
            reducedMotion={reducedMotion}
          >
            {hasVisitedManage ? (
              <Suspense fallback={null}>
                <div className="tab-stack">
                  <AnimatedScreen
                    fillMode="absolute"
                    screenKey="manageHome"
                    currentScreen={manageNavigation.currentScreen}
                    navDir={manageNavigation.transition}
                    reducedMotion={reducedMotion}
                  >
                    <ManageHomePage
                      importAlert={shipEditor.manageImportAlert}
                      pendingShipImport={shipEditor.pendingShipImport}
                      onExport={shipEditor.handleExportDatabase}
                      onImportAlertDismiss={() => shipEditor.setManageImportAlert(null)}
                      onImagesImport={shipEditor.handleImagesImport}
                      onPendingShipImportDismiss={() => shipEditor.setPendingShipImport(null)}
                      onPendingShipImportKeepExisting={() =>
                        shipEditor.applyPendingShipImport({ keepExisting: true })
                      }
                      onPendingShipImportReplaceAll={() =>
                        shipEditor.applyPendingShipImport({ keepExisting: false })
                      }
                      onPendingShipImportReplaceSameRegistrationChange={(checked) =>
                        shipEditor.setPendingShipImport((current) =>
                          current
                            ? { ...current, replaceSameRegistration: checked }
                            : current,
                        )
                      }
                      onShipEditOpen={() => manageNavigation.push('manageShipEdit')}
                      onShipImport={shipEditor.handleShipImport}
                      rows={shipEditor.manageHomePrimaryRows}
                    />
                  </AnimatedScreen>

                  <AnimatedScreen
                    fillMode="absolute"
                    screenKey="manageShipEdit"
                    currentScreen={manageNavigation.currentScreen}
                    navDir={manageNavigation.transition}
                    reducedMotion={reducedMotion}
                  >
                    <ManageShipEditPage
                      cards={shipEditor.manageShipCardsState}
                      dirty={shipEditor.manageShipDirty}
                      onAdd={shipEditor.handleManageShipAdd}
                      onBack={() => {
                        if (shipEditor.manageShipDirty) {
                          shipEditor.setManageDiscardTarget('ship');
                          return;
                        }

                        manageNavigation.pop();
                      }}
                      onConfirmDiscard={() => {
                        shipEditor.setManageDiscardTarget(null);
                        shipEditor.restoreManageShipSaved();
                        manageNavigation.pop();
                      }}
                      onDelete={shipEditor.handleManageShipDelete}
                      onDismissDiscard={() => shipEditor.setManageDiscardTarget(null)}
                      onDismissToast={shipEditor.hideManageSaveToast}
                      onFieldChange={shipEditor.handleManageShipFieldChange}
                      onImageChange={shipEditor.handleManageShipImageChange}
                      onReorder={shipEditor.handleManageShipReorder}
                      onSave={shipEditor.handleManageShipSave}
                      onSearchChange={shipEditor.setManageShipSearch}
                      onSearchClear={() => shipEditor.setManageShipSearch('')}
                      originalCards={shipEditor.manageShipSavedState}
                      searchQuery={shipEditor.manageShipSearch}
                      showDiscardModal={shipEditor.manageDiscardTarget === 'ship'}
                      toast={shipEditor.manageSaveToast}
                    />
                  </AnimatedScreen>
                </div>
              </Suspense>
            ) : null}
          </AnimatedScreen>

          <AnimatedScreen
            fillMode="absolute"
            screenKey="menu"
            currentScreen={appState.activeTab}
            navDir={appState.tabTransition}
            reducedMotion={reducedMotion}
          >
            {hasVisitedMenu ? (
              <Suspense fallback={null}>
                <div className="tab-stack">
                  <AnimatedScreen
                    fillMode="absolute"
                    screenKey="menu"
                    currentScreen={menuNavigation.currentScreen}
                    navDir={menuNavigation.transition}
                    reducedMotion={reducedMotion}
                  >
                    <MenuPage
                      colorMode={colorMode}
                      onColorModeOpen={() => menuNavigation.push('menuMode')}
                      onInfoOpen={() => menuNavigation.push('menuInfo')}
                      onLogout={() => {
                        dispatch({ type: 'logout' });
                        databasePage.resetDatabasePage();
                        manageNavigation.reset('manageHome');
                        menuNavigation.reset('menu');
                        authNavigation.navigate('login', 'logout');
                      }}
                    />
                  </AnimatedScreen>

                  <AnimatedScreen
                    fillMode="absolute"
                    screenKey="menuMode"
                    currentScreen={menuNavigation.currentScreen}
                    navDir={menuNavigation.transition}
                    reducedMotion={reducedMotion}
                  >
                    <MenuModePage
                      colorMode={colorMode}
                      onBack={() => menuNavigation.pop()}
                      onSelectMode={setColorMode}
                    />
                  </AnimatedScreen>

                  <AnimatedScreen
                    fillMode="absolute"
                    screenKey="menuInfo"
                    currentScreen={menuNavigation.currentScreen}
                    navDir={menuNavigation.transition}
                    reducedMotion={reducedMotion}
                  >
                    <MenuInfoPage onBack={() => menuNavigation.pop()} />
                  </AnimatedScreen>
                </div>
              </Suspense>
            ) : null}
          </AnimatedScreen>
        </div>

        {showBottomTab ? (
          <BottomTab
            activeTab={appState.activeTab}
            compact={bottomTabCompact}
            onDbClick={handleBottomTabDbClick}
            onManageClick={handleBottomTabManageClick}
            onMenuClick={handleBottomTabMenuClick}
          />
        ) : null}

        {appState.zoomSession ? (
          <Suspense fallback={null}>
            <ImageZoomModal
              session={appState.zoomSession}
              onClose={() => dispatch({ type: 'close-zoom' })}
            />
          </Suspense>
        ) : null}
      </AnimatedScreen>
    </div>
  );
}
