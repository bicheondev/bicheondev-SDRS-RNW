import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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
import { getMotionCssVariables, getPressMotion } from './motion';
import { vesselTypeOptions } from './uiAssets';
import AnimatedScreen from './components/AnimatedScreen';
import BottomTab from './components/BottomTab';
import {
  CompactVesselCard,
  FilterScreen,
  SearchScreen,
  TopBar,
  VesselCard,
  VesselEmptyState,
} from './components/DatabaseScreens';
import ImageZoomModal from './components/ImageZoomModal';
import { DataManagementHomeScreen, DataManagementShipEditScreen } from './components/ManageScreens';
import { MenuInfoScreen, MenuModeScreen, MenuScreen } from './components/MenuScreens';

function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const [screen, setScreen] = useState('login');
  const [navDir, setNavDir] = useState('none');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomSession, setZoomSession] = useState(null);
  const [harborFilter, setHarborFilter] = useState('전체 항포구');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('전체 선박');
  const [filterMode, setFilterMode] = useState('harbor');
  const [filterOrigin, setFilterOrigin] = useState('main');
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
  const harborOptions = useMemo(() => buildHarborOptions(databaseState.shipRecords), [databaseState.shipRecords]);
  const manageHomePrimaryRows = useMemo(() => buildManageHomeRows(databaseState.files), [databaseState.files]);
  const resolvedColorMode = colorMode === 'system' ? systemColorMode : colorMode;

  const isFilled = username.trim() !== '' && password.trim() !== '';

  const navigate = (to, dir, options = {}) => {
    const { deferred = false } = options;
    const commitNavigation = () => {
      setNavDir(dir);
      setScreen(to);
    };

    if (deferred) {
      startTransition(commitNavigation);
      return;
    }

    commitNavigation();
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
    if (screen !== 'login') {
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
  }, [focusedField, screen]);

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
    if (screen !== 'main' || !mainContentRef.current) {
      return;
    }

    mainContentRef.current.scrollTop = mainScrollPositionRef.current;
  }, [screen]);

  const handleMainScroll = (event) => {
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
    navigate('search', 'push', { deferred: true });
  };

  const openFilter = (mode) => {
    setTopBarHidden(false);
    setFilterMode(mode);
    setFilterOrigin(screen === 'search' ? 'search' : 'main');
    navigate('filter', 'sheet', { deferred: true });
  };

  const closeFilter = () => {
    navigate(filterOrigin, 'sheetBack');
  };

  const handleFilterSearchOpen = () => {
    if (filterOrigin === 'search') {
      closeFilter();
      return;
    }

    openSearch();
  };

  const openMenu = () => {
    setTopBarHidden(false);
    navigate('menu', 'tab');
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

  const openManage = () => {
    setTopBarHidden(false);
    resetManageShip();
    setManageDiscardTarget(null);
    setManageImportAlert(null);
    setPendingShipImport(null);
    hideManageSaveToast();
    navigate('manageHome', 'tab');
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
    if (!databaseReady) {
      return;
    }

    mainScrollPositionRef.current = 0;
    lastScrollTopRef.current = 0;
    setTopBarHidden(false);
    navigate('main', 'loginToMain');
  };

  return (
    <div className="screen-stack" style={getMotionCssVariables(reducedMotion)}>
      <AnimatedScreen screenKey="login" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
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

            <form className="login-form" onSubmit={(event) => event.preventDefault()}>
              <label className={`input-shell ${focusedField === 'username' ? 'input-shell--focused' : ''}`}>
                <input
                  className="login-input"
                  type="text"
                  value={username}
                  placeholder="아이디"
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
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => handleLoginFieldFocus('password')}
                  onBlur={handleLoginFieldBlur}
                />
              </label>
            </form>

            <p className="app-version">선박DB정보체계 버전 1.0</p>

            <motion.button
              className={`login-button pressable-control pressable-control--filled ${isFilled ? 'login-button--active' : ''}`}
              type="button"
              disabled={!isFilled || !databaseReady}
              onClick={enterMainScreen}
              {...getPressMotion('button', { enabled: isFilled })}
            >
              {databaseReady ? '로그인' : '기본 데이터 불러오는 중...'}
            </motion.button>
          </section>
        </main>
      </AnimatedScreen>

      <AnimatedScreen screenKey="main" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <main className="app-shell">
          <section className="phone-screen phone-screen--main">
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

            <div className="main-content" ref={mainContentRef} onScroll={handleMainScroll}>
              {filteredDisplayVessels.length === 0 ? (
                <VesselEmptyState />
              ) : compact ? (
                filteredDisplayVessels.map((vessel, index) => (
                  <div key={vessel.id}>
                    <CompactVesselCard
                      vessel={vessel}
                      onImageClick={(selectedVessel) => openImageZoom(selectedVessel, filteredDisplayVessels)}
                    />
                    {index < filteredDisplayVessels.length - 1 ? <div className="section-divider" /> : null}
                  </div>
                ))
              ) : (
                filteredDisplayVessels.map((vessel, index) => (
                  <div key={vessel.id}>
                    <VesselCard
                      vessel={vessel}
                      onImageClick={(selectedVessel) => openImageZoom(selectedVessel, filteredDisplayVessels)}
                    />
                    {index < filteredDisplayVessels.length - 1 ? <div className="section-divider" /> : null}
                  </div>
                ))
              )}
            </div>

            <BottomTab activeTab="db" compact={compact} onDbClick={undefined} onManageClick={openManage} onMenuClick={openMenu} />
          </section>
        </main>
      </AnimatedScreen>

      <AnimatedScreen screenKey="manageHome" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <DataManagementHomeScreen
          importAlert={manageImportAlert}
          pendingShipImport={pendingShipImport}
          onDbOpen={() => {
            setPendingShipImport(null);
            navigate('main', 'tabBack');
          }}
          onExport={handleExportDatabase}
          onImportAlertDismiss={() => setManageImportAlert(null)}
          onImagesImport={handleImagesImport}
          onPendingShipImportDismiss={() => setPendingShipImport(null)}
          onPendingShipImportKeepExisting={() => applyPendingShipImport({ keepExisting: true })}
          onPendingShipImportReplaceAll={() => applyPendingShipImport({ keepExisting: false })}
          onPendingShipImportReplaceSameRegistrationChange={(checked) =>
            setPendingShipImport((current) => (current ? { ...current, replaceSameRegistration: checked } : current))
          }
          onMenuOpen={() => {
            setPendingShipImport(null);
            openMenu();
          }}
          onShipEditOpen={() => navigate('manageShipEdit', 'push')}
          onShipImport={handleShipImport}
          rows={manageHomePrimaryRows}
        />
      </AnimatedScreen>

      <AnimatedScreen screenKey="manageShipEdit" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
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

            navigate('manageHome', 'pop');
          }}
          onConfirmDiscard={() => {
            setManageDiscardTarget(null);
            restoreManageShipSaved();
            navigate('manageHome', 'pop');
          }}
          onDelete={handleManageShipDelete}
          onDismissDiscard={() => setManageDiscardTarget(null)}
          onFieldChange={handleManageShipFieldChange}
          onImageChange={handleManageShipImageChange}
          onSave={handleManageShipSave}
          onSearchChange={setManageShipSearch}
          onSearchClear={() => setManageShipSearch('')}
          searchQuery={manageShipSearch}
          showDiscardModal={manageDiscardTarget === 'ship'}
          toast={manageSaveToast}
        />
      </AnimatedScreen>

      <AnimatedScreen screenKey="search" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <SearchScreen
          compact={compact}
          harborFilter={harborFilter}
          query={searchQuery}
          vessels={filteredDisplayVessels}
          onBack={() => navigate('main', 'pop')}
          onClear={() => setSearchQuery('')}
          onHarborFilterOpen={() => openFilter('harbor')}
          onImageClick={openImageZoom}
          onManageOpen={openManage}
          onMenuOpen={openMenu}
          onQueryChange={setSearchQuery}
          onToggleCompact={handleCompactChange}
          onVesselTypeFilterOpen={() => openFilter('vesselType')}
          vesselTypeFilter={vesselTypeFilter}
        />
      </AnimatedScreen>

      <AnimatedScreen screenKey="filter" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <FilterScreen
          compact={compact}
          filterMode={filterMode}
          harborFilter={harborFilter}
          harborOptions={harborOptions}
          query={filterOrigin === 'search' ? searchQuery : ''}
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
      </AnimatedScreen>

      <AnimatedScreen screenKey="menu" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <MenuScreen
          colorMode={colorMode}
          compact={compact}
          onColorModeOpen={() => navigate('menuMode', 'none')}
          onDbOpen={() => navigate('main', 'tabBack')}
          onInfoOpen={() => navigate('menuInfo', 'none')}
          onManageOpen={openManage}
          onLogout={() => {
            setUsername('');
            setPassword('');
            setFocusedField('');
            navigate('login', 'logout');
          }}
        />
      </AnimatedScreen>

      <AnimatedScreen screenKey="menuMode" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <MenuModeScreen
          colorMode={colorMode}
          onBack={() => navigate('menu', 'none')}
          onSelectMode={setColorMode}
        />
      </AnimatedScreen>

      <AnimatedScreen screenKey="menuInfo" currentScreen={screen} navDir={navDir} reducedMotion={reducedMotion}>
        <MenuInfoScreen onBack={() => navigate('menu', 'none')} />
      </AnimatedScreen>

      <ImageZoomModal session={zoomSession} onClose={() => setZoomSession(null)} />
    </div>
  );
}

export default App;
