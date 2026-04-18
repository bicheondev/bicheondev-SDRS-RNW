import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import {
  applyImagesToShipRecords,
  buildDatabaseExportBlob,
  buildDisplayVessels,
  buildHarborOptions,
  buildManageHomeRows,
  cloneDatabaseState,
  createEmptyDatabaseState,
  downloadBlob,
  importImagesZipFile,
  importShipCsvFile,
  loadBundledDatabaseState,
  rebuildImageEntriesFromShips,
} from './dataImport';
import { loadStoredDatabaseState, saveStoredDatabaseState } from './dataStore';
import {
  areImageEntriesEqual,
  areManageShipCardsEqual,
  cloneManageItems,
  emptyManageShipCard,
  filterVessels,
  mergeImportedShipRecords,
  normalizeShipCardsForStorage,
} from './appDomain';
import { getMotionCssVariables } from './motion';
import { assets, vesselTypeOptions } from './uiAssets';
import AnimatedScreen from './components/AnimatedScreen';
import BottomTab from './components/BottomTab';
import {
  applySearchQuery,
  FilterScreen,
  SearchTopBar,
  TopBar,
  VesselResults,
} from './components/DatabaseScreens';
import ImageZoomModal from './components/ImageZoomModal';
import { DataManagementHomeScreen, DataManagementShipEditScreen } from './components/ManageScreens';
import { MenuInfoScreen, MenuModeScreen, MenuScreen } from './components/MenuScreens';
import { useRouteNavigation, useStackNavigation } from './navigation';

const tabAssetSources = [
  assets.tabDb,
  assets.tabDbCompact,
  assets.tabManage,
  assets.tabManageCompact,
  assets.tabMenu,
  assets.tabMenuCompact,
  assets.tabDbInactive,
  assets.tabManageInactive,
  assets.tabMenuActive,
  assets.manageTabDb,
  assets.manageTabActive,
  assets.manageTabMenu,
];

const TAB_ORDER = ['db', 'manage', 'menu'];

function getTabTransition(currentTab, nextTab) {
  const currentIndex = TAB_ORDER.indexOf(currentTab);
  const nextIndex = TAB_ORDER.indexOf(nextTab);

  if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
    return 'none';
  }

  return nextIndex > currentIndex ? 'tabForward' : 'tabBackward';
}

function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const authNavigation = useRouteNavigation('login');
  const manageNavigation = useStackNavigation('manageHome');
  const menuNavigation = useStackNavigation('menu');
  const [activeTab, setActiveTab] = useState('db');
  const [tabTransition, setTabTransition] = useState('none');
  const [compact, setCompact] = useState(false);
  const [colorMode, setColorMode] = useState('light');
  const [systemColorMode, setSystemColorMode] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [databaseState, setDatabaseState] = useState(() => createEmptyDatabaseState());
  const [databaseReady, setDatabaseReady] = useState(false);
  const [manageShipCardsState, setManageShipCardsState] = useState([]);
  const [manageShipSavedState, setManageShipSavedState] = useState([]);
  const [manageShipDirty, setManageShipDirty] = useState(false);
  const [manageShipSearch, setManageShipSearch] = useState('');
  const [manageDiscardTarget, setManageDiscardTarget] = useState(null);
  const [manageImportAlert, setManageImportAlert] = useState(null);
  const [pendingShipImport, setPendingShipImport] = useState(null);
  const [manageSaveToast, setManageSaveToast] = useState(null);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [databaseView, setDatabaseView] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomSession, setZoomSession] = useState(null);
  const [harborFilter, setHarborFilter] = useState('전체 항포구');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('전체 선박');
  const [filterSheet, setFilterSheet] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [loginKeyboardOpen, setLoginKeyboardOpen] = useState(false);
  const [loginViewportTop, setLoginViewportTop] = useState(0);
  const [loginViewportHeight, setLoginViewportHeight] = useState(0);
  const mainContentRef = useRef(null);
  const loginFieldBlurTimeoutRef = useRef(null);
  const loginViewportBaseHeightRef = useRef(0);
  const manageSaveToastTimeoutRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const mainScrollPositionRef = useRef(0);
  const displayVessels = useMemo(() => buildDisplayVessels(databaseState.shipRecords), [databaseState.shipRecords]);
  const filteredDisplayVessels = useMemo(
    () => filterVessels(displayVessels, harborFilter, vesselTypeFilter),
    [displayVessels, harborFilter, vesselTypeFilter],
  );
  const searchedDisplayVessels = useMemo(
    () => applySearchQuery(filteredDisplayVessels, searchQuery),
    [filteredDisplayVessels, searchQuery],
  );
  const harborOptions = useMemo(() => buildHarborOptions(databaseState.shipRecords), [databaseState.shipRecords]);
  const manageHomePrimaryRows = useMemo(() => buildManageHomeRows(databaseState.files), [databaseState.files]);
  const resolvedColorMode = colorMode === 'system' ? systemColorMode : colorMode;
  const isFilled = username.trim() !== '' && password.trim() !== '';

  const navigateTab = (nextTab) => {
    if (activeTab === nextTab) {
      return;
    }

    startTransition(() => {
      setTabTransition(getTabTransition(activeTab, nextTab));
      setActiveTab(nextTab);
    });
  };

  const handleCompactChange = (nextCompact) => {
    if (compact === nextCompact) {
      return;
    }

    startTransition(() => {
      setCompact(nextCompact);
    });
  };

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.Image !== 'function') {
      return undefined;
    }

    const preloadedImages = tabAssetSources.map((src) => {
      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });

    return () => {
      preloadedImages.forEach((image) => {
        image.src = '';
      });
    };
  }, []);

  useEffect(
    () => () => {
      if (loginFieldBlurTimeoutRef.current) {
        clearTimeout(loginFieldBlurTimeoutRef.current);
      }

      if (manageSaveToastTimeoutRef.current) {
        clearTimeout(manageSaveToastTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const initializeDatabase = async () => {
      let nextDatabase = null;

      try {
        const storedState = await loadStoredDatabaseState();
        nextDatabase = storedState ? cloneDatabaseState(storedState) : await loadBundledDatabaseState();
      } catch (error) {
        try {
          nextDatabase = await loadBundledDatabaseState();
        } catch (seedError) {
          nextDatabase = createEmptyDatabaseState();
        }
      }

      if (cancelled) {
        return;
      }

      nextDatabase.shipRecords = applyImagesToShipRecords(nextDatabase.shipRecords, nextDatabase.imageEntries, {
        preserveExisting: true,
      });

      setDatabaseState(nextDatabase);
      setManageShipSavedState(cloneManageItems(nextDatabase.shipRecords));
      setManageShipCardsState(cloneManageItems(nextDatabase.shipRecords));
      setDatabaseReady(true);
    };

    initializeDatabase();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authNavigation.screen !== 'login') {
      setLoginKeyboardOpen(false);
      setLoginViewportTop(0);
      setLoginViewportHeight(0);
      loginViewportBaseHeightRef.current = 0;
      return;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const updateKeyboardState = () => {
      if (focusedField === '') {
        loginViewportBaseHeightRef.current = Math.max(loginViewportBaseHeightRef.current, viewport.height);
        setLoginKeyboardOpen(false);
        setLoginViewportTop(0);
        setLoginViewportHeight(0);
        return;
      }

      const viewportBaseHeight = loginViewportBaseHeightRef.current || viewport.height;
      const isKeyboardOpen = viewportBaseHeight - viewport.height > 80;

      setLoginKeyboardOpen(isKeyboardOpen);
      setLoginViewportTop(isKeyboardOpen ? viewport.offsetTop : 0);
      setLoginViewportHeight(isKeyboardOpen ? viewport.height : 0);
    };

    updateKeyboardState();

    viewport.addEventListener('resize', updateKeyboardState);
    viewport.addEventListener('scroll', updateKeyboardState);

    return () => {
      viewport.removeEventListener('resize', updateKeyboardState);
      viewport.removeEventListener('scroll', updateKeyboardState);
    };
  }, [authNavigation.screen, focusedField]);

  useEffect(() => {
    if (!databaseReady) {
      return;
    }

    saveStoredDatabaseState(databaseState).catch(() => {});
  }, [databaseReady, databaseState]);

  useEffect(() => {
    if (harborOptions.includes(harborFilter)) {
      return;
    }

    setHarborFilter('전체 항포구');
  }, [harborFilter, harborOptions]);

  useEffect(() => {
    setManageShipDirty(!areManageShipCardsEqual(manageShipCardsState, manageShipSavedState));
  }, [manageShipCardsState, manageShipSavedState]);

  useLayoutEffect(() => {
    if (authNavigation.screen !== 'app' || activeTab !== 'db' || databaseView !== 'browse' || !mainContentRef.current) {
      return;
    }

    mainContentRef.current.scrollTop = mainScrollPositionRef.current;
  }, [activeTab, authNavigation.screen, databaseView]);

  const handleMainScroll = (event) => {
    if (activeTab !== 'db' || databaseView !== 'browse') {
      return;
    }

    const currentScrollTop = event.currentTarget.scrollTop;
    const lastScrollTop = lastScrollTopRef.current;

    mainScrollPositionRef.current = currentScrollTop;

    if (currentScrollTop <= 0) {
      setTopBarHidden(false);
      lastScrollTopRef.current = 0;
      return;
    }

    const delta = currentScrollTop - lastScrollTop;

    if (delta > 6 && currentScrollTop > 24) {
      setTopBarHidden(true);
    } else if (delta < -6) {
      setTopBarHidden(false);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  const openSearch = () => {
    setTopBarHidden(false);
    setFilterSheet(null);
    startTransition(() => {
      setDatabaseView('search');
    });
  };

  const openFilter = (mode) => {
    setTopBarHidden(false);
    setFilterSheet({
      mode,
      sourceView: databaseView,
    });
  };

  const closeFilter = () => {
    setFilterSheet(null);
  };

  const closeSearch = () => {
    setTopBarHidden(false);
    setFilterSheet(null);
    startTransition(() => {
      setDatabaseView('browse');
    });
  };

  const handleFilterSearchOpen = () => {
    if (filterSheet?.sourceView === 'search') {
      closeFilter();
      return;
    }

    openSearch();
  };

  const openMenu = () => {
    setTopBarHidden(false);
    setFilterSheet(null);
    setDatabaseView('browse');
    menuNavigation.reset('menu');
    navigateTab('menu');
  };

  const syncShipEditor = (shipRecords) => {
    const savedCards = cloneManageItems(shipRecords);
    setManageShipSavedState(savedCards);
    setManageShipCardsState(cloneManageItems(shipRecords));
    setManageShipDirty(false);
    setManageShipSearch('');
  };

  const resetManageShip = () => {
    const initialCards = cloneManageItems(databaseState.shipRecords);
    setManageShipSavedState(initialCards);
    setManageShipCardsState(cloneManageItems(databaseState.shipRecords));
    setManageShipDirty(false);
    setManageShipSearch('');
  };

  const restoreManageShipSaved = () => {
    setManageShipCardsState(cloneManageItems(manageShipSavedState));
    setManageShipDirty(false);
  };

  const showImportAlert = (error, fallbackCopy) => {
    setManageImportAlert({
      title: '불러오기 실패',
      copy: error instanceof Error && error.message ? error.message : fallbackCopy,
    });
  };

  const hideManageSaveToast = () => {
    if (manageSaveToastTimeoutRef.current) {
      clearTimeout(manageSaveToastTimeoutRef.current);
      manageSaveToastTimeoutRef.current = null;
    }

    setManageSaveToast(null);
  };

  const showManageSaveToast = (message) => {
    const id = Date.now();

    if (manageSaveToastTimeoutRef.current) {
      clearTimeout(manageSaveToastTimeoutRef.current);
    }

    setManageSaveToast({ id, message });
    manageSaveToastTimeoutRef.current = setTimeout(() => {
      setManageSaveToast((current) => (current?.id === id ? null : current));
      manageSaveToastTimeoutRef.current = null;
    }, 2200);
  };

  const showDatabaseHome = () => {
    setTopBarHidden(false);
    setFilterSheet(null);
    setDatabaseView('browse');
    navigateTab('db');
  };

  const openManage = () => {
    setTopBarHidden(false);
    setFilterSheet(null);
    setDatabaseView('browse');
    resetManageShip();
    setManageDiscardTarget(null);
    setManageImportAlert(null);
    setPendingShipImport(null);
    hideManageSaveToast();
    manageNavigation.reset('manageHome');
    navigateTab('manage');
  };

  const handleManageShipFieldChange = (cardId, field, value) => {
    hideManageSaveToast();
    setManageShipCardsState((current) =>
      current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              ...(field === 'title' ? { searchKey: value } : {}),
              [field]: value,
              selected: true,
            }
          : card,
      ),
    );
    setManageShipDirty(true);
  };

  const handleManageShipAdd = () => {
    hideManageSaveToast();
    setManageShipCardsState((current) => [
      ...current.map((card) => ({ ...card, selected: false })),
      {
        id: `ship-${Date.now()}`,
        ...emptyManageShipCard,
        selected: true,
      },
    ]);
    setManageShipDirty(true);
    setManageShipSearch('');
  };

  const handleManageShipDelete = (cardId) => {
    hideManageSaveToast();
    setManageShipCardsState((current) => current.filter((card) => card.id !== cardId));
  };

  const handleManageShipImageChange = (cardId, file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    hideManageSaveToast();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return;
      }

      setManageShipCardsState((current) =>
        current.map((card) =>
          card.id === cardId
            ? {
                ...card,
                image: reader.result,
                imageFileName: file.name,
                imageMimeType: file.type || '',
                selected: true,
              }
            : card,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleManageShipReorder = (nextCards) => {
    hideManageSaveToast();
    setManageShipCardsState(nextCards.map((card) => ({ ...card })));
  };

  const handleManageShipSave = () => {
    const nextShipRecords = normalizeShipCardsForStorage(manageShipCardsState);
    const nextImageEntries = rebuildImageEntriesFromShips(nextShipRecords);
    const nextDatabase = cloneDatabaseState(databaseState);
    const shipImported = nextDatabase.files.ship.imported || nextShipRecords.length > 0;
    const imagesImported = nextDatabase.files.images.imported || nextImageEntries.length > 0;
    const imagesChanged = !areImageEntriesEqual(nextImageEntries, nextDatabase.imageEntries);

    nextDatabase.imageEntries = nextImageEntries;
    nextDatabase.shipRecords = applyImagesToShipRecords(nextShipRecords, nextImageEntries, {
      preserveExisting: true,
    });
    nextDatabase.files.ship = {
      ...nextDatabase.files.ship,
      imported: shipImported,
      modified: shipImported,
    };
    nextDatabase.files.images = {
      ...nextDatabase.files.images,
      imported: imagesImported,
      modified: imagesImported && imagesChanged,
    };

    setDatabaseState(nextDatabase);
    syncShipEditor(nextDatabase.shipRecords);
    showManageSaveToast('DB가 업데이트되었어요.');
  };

  const handleShipImport = async (file) => {
    if (!file) {
      return;
    }

    setManageImportAlert(null);
    setPendingShipImport(null);

    try {
      const { fileName, shipRecords } = await importShipCsvFile(file, databaseState.imageEntries);

      if (databaseState.shipRecords.length === 0) {
        const nextDatabase = cloneDatabaseState(databaseState);

        nextDatabase.shipRecords = shipRecords;
        nextDatabase.files.ship = {
          name: fileName,
          imported: true,
          modified: false,
        };

        setDatabaseState(nextDatabase);
        syncShipEditor(nextDatabase.shipRecords);
        setHarborFilter('전체 항포구');
        return;
      }

      setPendingShipImport({
        fileName,
        shipRecords,
        replaceSameRegistration: true,
      });
    } catch (error) {
      showImportAlert(error, '선박 DB를 불러오지 못했어요.\n파일 형식을 확인해 주세요.');
    }
  };

  const applyPendingShipImport = ({ keepExisting }) => {
    if (!pendingShipImport) {
      return;
    }

    const nextDatabase = cloneDatabaseState(databaseState);
    const nextShipRecords = mergeImportedShipRecords(nextDatabase.shipRecords, pendingShipImport.shipRecords, {
      keepExisting,
      replaceSameRegistration: keepExisting && pendingShipImport.replaceSameRegistration,
    });

    nextDatabase.shipRecords = applyImagesToShipRecords(nextShipRecords, nextDatabase.imageEntries, {
      preserveExisting: true,
    });
    nextDatabase.files.ship = {
      name: pendingShipImport.fileName,
      imported: true,
      modified: keepExisting,
    };

    setDatabaseState(nextDatabase);
    syncShipEditor(nextDatabase.shipRecords);
    setHarborFilter('전체 항포구');
    setPendingShipImport(null);
  };

  const handleImagesImport = async (file) => {
    if (!file) {
      return;
    }

    setManageImportAlert(null);

    try {
      const { fileName, imageEntries } = await importImagesZipFile(file);
      const nextDatabase = cloneDatabaseState(databaseState);

      nextDatabase.imageEntries = imageEntries;
      nextDatabase.shipRecords = applyImagesToShipRecords(nextDatabase.shipRecords, imageEntries);
      nextDatabase.files.images = {
        name: fileName,
        imported: true,
        modified: false,
      };

      setDatabaseState(nextDatabase);
      syncShipEditor(nextDatabase.shipRecords);
    } catch (error) {
      showImportAlert(error, '이미지 압축 파일을 불러오지 못했어요.\n파일 형식을 확인해 주세요.');
    }
  };

  const handleExportDatabase = async () => {
    const exportBlob = await buildDatabaseExportBlob(databaseState);
    downloadBlob(exportBlob, 'db_export.zip');
  };

  const showBottomTab =
    activeTab === 'db' ||
    (activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') ||
    (activeTab === 'menu' && menuNavigation.currentScreen === 'menu');
  const bottomTabCompact = activeTab === 'manage' ? false : compact;
  const handleBottomTabDbClick = () => {
    if (activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') {
      setPendingShipImport(null);
    }

    if (activeTab === 'db' && databaseView === 'search') {
      closeSearch();
      return;
    }

    showDatabaseHome();
  };
  const handleBottomTabManageClick = activeTab === 'manage' ? undefined : openManage;
  const handleBottomTabMenuClick = () => {
    if (activeTab === 'manage' && manageNavigation.currentScreen === 'manageHome') {
      setPendingShipImport(null);
    }

    if (activeTab === 'menu') {
      return;
    }

    openMenu();
  };

  const openImageZoom = (vessel, collection = [vessel]) => {
    const vessels = Array.isArray(collection) && collection.length > 0 ? collection.slice() : [vessel];
    const startIndex = Math.max(
      0,
      vessels.findIndex((entry) => entry.id === vessel.id),
    );

    setZoomSession({
      vessels,
      startIndex,
      openedAt: Date.now(),
    });
  };

  const handleLoginFieldFocus = (field) => {
    if (loginFieldBlurTimeoutRef.current) {
      clearTimeout(loginFieldBlurTimeoutRef.current);
      loginFieldBlurTimeoutRef.current = null;
    }

    setFocusedField(field);
  };

  const handleLoginFieldBlur = () => {
    loginFieldBlurTimeoutRef.current = window.setTimeout(() => {
      setFocusedField('');
      loginFieldBlurTimeoutRef.current = null;
    }, 80);
  };

  const enterMainScreen = () => {
    mainScrollPositionRef.current = 0;
    lastScrollTopRef.current = 0;
    setTopBarHidden(false);
    setFilterSheet(null);
    setDatabaseView('browse');
    setTabTransition('none');
    setActiveTab('db');
    manageNavigation.reset('manageHome');
    menuNavigation.reset('menu');
    authNavigation.navigate('app', 'loginToMain');
  };

  return (
    <div className="screen-stack" style={getMotionCssVariables(reducedMotion)}>
      <AnimatedScreen
        screenKey="login"
        currentScreen={authNavigation.screen}
        navDir={authNavigation.transition}
        reducedMotion={reducedMotion}
      >
        <main className="app-shell app-shell--login">
          <section
            className={`phone-screen phone-screen--login ${loginKeyboardOpen ? 'phone-screen--login-keyboard-open' : ''}`.trim()}
            style={{
              '--login-viewport-top': `${loginViewportTop}px`,
              '--login-viewport-height': `${loginViewportHeight}px`,
            }}
          >
            <header className="login-header">
              <h1 className="login-title">
                <span className="login-title__accent">로그인 정보</span>를
                <br />
                입력하세요.
              </h1>
            </header>

            <form
              id="login-form"
              className="login-form"
              onSubmit={(event) => {
                event.preventDefault();

                if (isFilled) {
                  enterMainScreen();
                }
              }}
            >
              <label className={`input-shell ${focusedField === 'username' ? 'input-shell--focused' : ''}`}>
                <input
                  className="login-input"
                  type="text"
                  value={username}
                  placeholder="아이디"
                  enterKeyHint="next"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(event) => setUsername(event.target.value)}
                  onFocus={() => handleLoginFieldFocus('username')}
                  onBlur={handleLoginFieldBlur}
                />
              </label>

              <label className={`input-shell ${focusedField === 'password' ? 'input-shell--focused' : ''}`}>
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  placeholder="비밀번호"
                  enterKeyHint="go"
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => handleLoginFieldFocus('password')}
                  onBlur={handleLoginFieldBlur}
                />
              </label>
            </form>

            <p className="app-version">선박DB정보체계 버전 1.0</p>

            <motion.button
              className={`login-button pressable-control pressable-control--filled ${isFilled ? 'login-button--active' : ''}`}
              form="login-form"
              type="submit"
              disabled={!isFilled}
            >
              로그인
            </motion.button>
          </section>
        </main>
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
            currentScreen={activeTab}
            navDir={tabTransition}
            reducedMotion={reducedMotion}
          >
            <main className="app-shell">
              <section className={`phone-screen ${databaseView === 'search' ? 'phone-screen--search' : 'phone-screen--main'}`}>
                {databaseView === 'search' ? (
                  <SearchTopBar
                    compact={compact}
                    harborFilter={harborFilter}
                    query={searchQuery}
                    vesselTypeFilter={vesselTypeFilter}
                    onBack={closeSearch}
                    onClear={() => setSearchQuery('')}
                    onHarborFilterOpen={() => openFilter('harbor')}
                    onQueryChange={setSearchQuery}
                    onToggleCompact={handleCompactChange}
                    onVesselTypeFilterOpen={() => openFilter('vesselType')}
                  />
                ) : (
                  <TopBar
                    compact={compact}
                    harborFilter={harborFilter}
                    harborLabelWidth={0}
                    hidden={topBarHidden}
                    onHarborFilterOpen={() => openFilter('harbor')}
                    onSearchOpen={openSearch}
                    onToggleCompact={handleCompactChange}
                    onVesselTypeFilterOpen={() => openFilter('vesselType')}
                    vesselTypeLabelWidth={0}
                    vesselTypeFilter={vesselTypeFilter}
                  />
                )}

                <VesselResults
                  className={`main-content ${databaseView === 'search' ? 'main-content--search' : ''}`.trim()}
                  compact={compact}
                  onImageClick={openImageZoom}
                  onScroll={databaseView === 'browse' ? handleMainScroll : undefined}
                  ref={databaseView === 'browse' ? mainContentRef : undefined}
                  vessels={databaseView === 'search' ? searchedDisplayVessels : filteredDisplayVessels}
                />
              </section>

              <AnimatePresence>
                {filterSheet ? (
                  <FilterScreen
                    compact={compact}
                    filterMode={filterSheet.mode}
                    harborFilter={harborFilter}
                    harborOptions={harborOptions}
                    query={filterSheet.sourceView === 'search' ? searchQuery : ''}
                    vessels={displayVessels}
                    onClose={closeFilter}
                    onHarborSelect={setHarborFilter}
                    onImageClick={openImageZoom}
                    onManageOpen={openManage}
                    onMenuOpen={openMenu}
                    onSearchOpen={handleFilterSearchOpen}
                    onToggleCompact={handleCompactChange}
                    onVesselTypeSelect={setVesselTypeFilter}
                    vesselTypeOptions={vesselTypeOptions}
                    vesselTypeFilter={vesselTypeFilter}
                  />
                ) : null}
              </AnimatePresence>
            </main>
          </AnimatedScreen>

          <AnimatedScreen
            fillMode="absolute"
            screenKey="manage"
            currentScreen={activeTab}
            navDir={tabTransition}
            reducedMotion={reducedMotion}
          >
            <div className="tab-stack">
              <AnimatedScreen
                fillMode="absolute"
                screenKey="manageHome"
                currentScreen={manageNavigation.currentScreen}
                navDir={manageNavigation.transition}
                reducedMotion={reducedMotion}
              >
                <DataManagementHomeScreen
                  importAlert={manageImportAlert}
                  pendingShipImport={pendingShipImport}
                  onExport={handleExportDatabase}
                  onImportAlertDismiss={() => setManageImportAlert(null)}
                  onImagesImport={handleImagesImport}
                  onPendingShipImportDismiss={() => setPendingShipImport(null)}
                  onPendingShipImportKeepExisting={() => applyPendingShipImport({ keepExisting: true })}
                  onPendingShipImportReplaceAll={() => applyPendingShipImport({ keepExisting: false })}
                  onPendingShipImportReplaceSameRegistrationChange={(checked) =>
                    setPendingShipImport((current) => (current ? { ...current, replaceSameRegistration: checked } : current))
                  }
                  onShipEditOpen={() => manageNavigation.push('manageShipEdit')}
                  onShipImport={handleShipImport}
                  rows={manageHomePrimaryRows}
                />
              </AnimatedScreen>

              <AnimatedScreen
                fillMode="absolute"
                screenKey="manageShipEdit"
                currentScreen={manageNavigation.currentScreen}
                navDir={manageNavigation.transition}
                reducedMotion={reducedMotion}
              >
                <DataManagementShipEditScreen
                  cards={manageShipCardsState}
                  dirty={manageShipDirty}
                  onDismissToast={hideManageSaveToast}
                  originalCards={manageShipSavedState}
                  onAdd={handleManageShipAdd}
                  onBack={() => {
                    if (manageShipDirty) {
                      setManageDiscardTarget('ship');
                      return;
                    }

                    manageNavigation.pop();
                  }}
                  onConfirmDiscard={() => {
                    setManageDiscardTarget(null);
                    restoreManageShipSaved();
                    manageNavigation.pop();
                  }}
                  onDelete={handleManageShipDelete}
                onDismissDiscard={() => setManageDiscardTarget(null)}
                onFieldChange={handleManageShipFieldChange}
                onImageChange={handleManageShipImageChange}
                onReorder={handleManageShipReorder}
                onSave={handleManageShipSave}
                onSearchChange={setManageShipSearch}
                onSearchClear={() => setManageShipSearch('')}
                  searchQuery={manageShipSearch}
                  showDiscardModal={manageDiscardTarget === 'ship'}
                  toast={manageSaveToast}
                />
              </AnimatedScreen>
            </div>
          </AnimatedScreen>

          <AnimatedScreen
            fillMode="absolute"
            screenKey="menu"
            currentScreen={activeTab}
            navDir={tabTransition}
            reducedMotion={reducedMotion}
          >
            <div className="tab-stack">
              <AnimatedScreen
                fillMode="absolute"
                screenKey="menu"
                currentScreen={menuNavigation.currentScreen}
                navDir={menuNavigation.transition}
                reducedMotion={reducedMotion}
              >
                <MenuScreen
                  colorMode={colorMode}
                  onColorModeOpen={() => menuNavigation.push('menuMode')}
                  onInfoOpen={() => menuNavigation.push('menuInfo')}
                  onLogout={() => {
                    setUsername('');
                    setPassword('');
                    setFocusedField('');
                    setZoomSession(null);
                    setFilterSheet(null);
                    setDatabaseView('browse');
                    setTabTransition('none');
                    setActiveTab('db');
                    setTopBarHidden(false);
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
                <MenuModeScreen colorMode={colorMode} onBack={() => menuNavigation.pop()} onSelectMode={setColorMode} />
              </AnimatedScreen>

              <AnimatedScreen
                fillMode="absolute"
                screenKey="menuInfo"
                currentScreen={menuNavigation.currentScreen}
                navDir={menuNavigation.transition}
                reducedMotion={reducedMotion}
              >
                <MenuInfoScreen onBack={() => menuNavigation.pop()} />
              </AnimatedScreen>
            </div>
          </AnimatedScreen>
        </div>

        {showBottomTab ? (
          <BottomTab
            activeTab={activeTab}
            compact={bottomTabCompact}
            onDbClick={handleBottomTabDbClick}
            onManageClick={handleBottomTabManageClick}
            onMenuClick={handleBottomTabMenuClick}
          />
        ) : null}

        <ImageZoomModal session={zoomSession} onClose={() => setZoomSession(null)} />
      </AnimatedScreen>
    </div>
  );
}

export default App;
