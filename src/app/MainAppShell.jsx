import { lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { DatabasePage } from '../features/database/DatabasePage.jsx';
import { useDatabaseFilters } from '../features/database/useDatabaseFilters.js';
import { useShipEditor } from '../features/manage/useShipEditor.js';
import { useColorMode } from '../hooks/useColorMode.js';
import { useStackNavigation } from '../hooks/useStackNavigation.js';
import AnimatedScreen from '../components/layout/AnimatedScreen.jsx';
import BottomTab from '../components/layout/BottomTab.jsx';
import { motionDurationsMs } from '../motion.js';
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

export default function MainAppShell({ isActive, onLogout, reducedMotion }) {
  const [appState, dispatch] = useReducer(appReducer, initialAppState);
  const [hasVisitedManage, setHasVisitedManage] = useState(false);
  const [hasVisitedMenu, setHasVisitedMenu] = useState(false);
  const manageNavigation = useStackNavigation('manageHome');
  const menuNavigation = useStackNavigation('menu');
  const { colorMode, setColorMode } = useColorMode('light');
  const { databaseState, setDatabaseState } = useAppBootstrap();
  const shipEditContentRef = useRef(null);
  const databasePage = useDatabaseFilters({
    activeTab: appState.activeTab,
    isAppVisible: isActive,
    shipRecords: databaseState.shipRecords,
  });
  const shipEditor = useShipEditor({
    databaseState,
    onShipsChanged: () => databasePage.setHarborFilter('전체 항포구'),
    setDatabaseState,
  });

  useEffect(() => {
    if (!isActive) {
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
  }, [isActive]);

  useEffect(() => {
    if (appState.activeTab === 'manage') {
      setHasVisitedManage(true);
    }

    if (appState.activeTab === 'menu') {
      setHasVisitedMenu(true);
    }
  }, [appState.activeTab]);

  const navigateTab = useCallback((nextTab) => {
    dispatch({ type: 'navigate-tab', nextTab });
  }, []);

  const showDatabaseHome = useCallback(() => {
    databasePage.resetDatabasePage();
    navigateTab('db');
  }, [databasePage, navigateTab]);

  const openManage = useCallback(() => {
    databasePage.resetDatabasePage();
    shipEditor.resetSession();
    manageNavigation.reset('manageHome');
    navigateTab('manage');
  }, [databasePage, manageNavigation, navigateTab, shipEditor]);

  const openMenu = useCallback(() => {
    databasePage.resetDatabasePage();
    menuNavigation.reset('menu');
    navigateTab('menu');
  }, [databasePage, menuNavigation, navigateTab]);

  const openImageZoom = useCallback((vessel, collection = [vessel], sourceThumbnail = null) => {
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
      sourceThumbnail instanceof HTMLElement ? sourceThumbnail.getBoundingClientRect() : null;

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
  }, []);

  const handleLogout = useCallback(() => {
    onLogout();
    window.setTimeout(() => {
      dispatch({ type: 'logout' });
      databasePage.resetDatabasePage();
      shipEditor.resetSession();
      manageNavigation.reset('manageHome');
      menuNavigation.reset('menu');
    }, motionDurationsMs.normal + 40);
  }, [databasePage, manageNavigation, menuNavigation, onLogout, shipEditor]);

  const handleBottomTabDbClick = useCallback(() => {
    if (appState.activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') {
      shipEditor.setPendingShipImport(null);
    }

    if (appState.activeTab === 'db' && databasePage.databaseView === 'search') {
      databasePage.closeSearch();
      return;
    }

    showDatabaseHome();
  }, [
    appState.activeTab,
    databasePage,
    manageNavigation.currentScreen,
    shipEditor,
    showDatabaseHome,
  ]);

  const handleBottomTabManageClick = appState.activeTab === 'manage' ? undefined : openManage;

  const handleBottomTabMenuClick = useCallback(() => {
    if (appState.activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') {
      shipEditor.setPendingShipImport(null);
    }

    if (appState.activeTab === 'menu') {
      return;
    }

    openMenu();
  }, [appState.activeTab, manageNavigation.currentScreen, openMenu, shipEditor]);

  const showBottomTab =
    appState.activeTab === 'db' ||
    (appState.activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') ||
    (appState.activeTab === 'menu' && menuNavigation.currentScreen === 'menu');
  const bottomTabCompact = appState.activeTab === 'manage' ? false : databasePage.compact;

  return (
    <>
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
            onSearchClear={databasePage.clearSearchQuery}
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
                        current ? { ...current, replaceSameRegistration: checked } : current,
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
                    contentRef={shipEditContentRef}
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
                    onLogout={handleLogout}
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
    </>
  );
}
