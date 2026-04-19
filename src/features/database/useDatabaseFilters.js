import {
  useCallback,
  useDeferredValue,
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { buildDisplayVessels, buildHarborOptions } from '../../domain/databaseState.js';
import { filterVessels } from '../../domain/ships.js';
import { applySearchQuery } from './useVesselSearch.js';

export function useDatabaseFilters({ activeTab, isAppVisible, shipRecords }) {
  const [compact, setCompact] = useState(false);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [databaseView, setDatabaseView] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [harborFilter, setHarborFilter] = useState('전체 항포구');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('전체 선박');
  const [filterSheet, setFilterSheet] = useState(null);
  const mainContentRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const mainScrollPositionRef = useRef(0);
  const scrollHideDistanceRef = useRef(0);
  const scrollShowDistanceRef = useRef(0);
  const topBarHiddenRef = useRef(false);
  const revealLockScrollTopRef = useRef(0);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const displayVessels = useMemo(() => buildDisplayVessels(shipRecords), [shipRecords]);
  const harborOptions = useMemo(() => buildHarborOptions(shipRecords), [shipRecords]);
  const filteredDisplayVessels = useMemo(
    () => filterVessels(displayVessels, harborFilter, vesselTypeFilter),
    [displayVessels, harborFilter, vesselTypeFilter],
  );
  const searchedDisplayVessels = useMemo(
    () => applySearchQuery(filteredDisplayVessels, deferredSearchQuery),
    [deferredSearchQuery, filteredDisplayVessels],
  );

  useEffect(() => {
    if (harborOptions.includes(harborFilter)) {
      return;
    }

    setHarborFilter('전체 항포구');
  }, [harborFilter, harborOptions]);

  useEffect(() => {
    topBarHiddenRef.current = topBarHidden;
  }, [topBarHidden]);

  useLayoutEffect(() => {
    if (
      !isAppVisible ||
      activeTab !== 'db' ||
      databaseView !== 'browse' ||
      !mainContentRef.current
    ) {
      return;
    }

    mainContentRef.current.scrollTop = mainScrollPositionRef.current;
  }, [activeTab, databaseView, isAppVisible]);

  const resetTransientUi = useCallback(() => {
    topBarHiddenRef.current = false;
    revealLockScrollTopRef.current = 0;
    setTopBarHidden(false);
    setFilterSheet(null);
  }, []);

  const handleCompactChange = useCallback(
    (nextCompact) => {
      if (compact === nextCompact) {
        return;
      }

      startTransition(() => {
        setCompact(nextCompact);
      });
    },
    [compact],
  );

  const handleMainScroll = useCallback(
    (event) => {
      if (activeTab !== 'db' || databaseView !== 'browse') {
        return;
      }

      const currentScrollTop = event.currentTarget.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;

      mainScrollPositionRef.current = currentScrollTop;

      if (currentScrollTop <= 0) {
        topBarHiddenRef.current = false;
        setTopBarHidden(false);
        lastScrollTopRef.current = 0;
        scrollHideDistanceRef.current = 0;
        scrollShowDistanceRef.current = 0;
        revealLockScrollTopRef.current = 0;
        return;
      }

      const delta = currentScrollTop - lastScrollTop;
      const scrollingDown = delta > 0;
      const scrollingUp = delta < 0;

      if (scrollingDown) {
        scrollHideDistanceRef.current += delta;
        scrollShowDistanceRef.current = 0;
      } else if (scrollingUp) {
        scrollShowDistanceRef.current += Math.abs(delta);
        scrollHideDistanceRef.current = 0;
      }

      if (currentScrollTop <= 72) {
        if (topBarHiddenRef.current) {
          topBarHiddenRef.current = false;
          setTopBarHidden(false);
        }
        scrollHideDistanceRef.current = 0;
        scrollShowDistanceRef.current = 0;
        revealLockScrollTopRef.current = currentScrollTop + 40;
        lastScrollTopRef.current = currentScrollTop;
        return;
      }

      if (
        !topBarHiddenRef.current &&
        currentScrollTop > Math.max(24, revealLockScrollTopRef.current) &&
        scrollHideDistanceRef.current > 24
      ) {
        topBarHiddenRef.current = true;
        setTopBarHidden(true);
        scrollHideDistanceRef.current = 0;
        revealLockScrollTopRef.current = 0;
      } else if (topBarHiddenRef.current && scrollShowDistanceRef.current > 18) {
        topBarHiddenRef.current = false;
        setTopBarHidden(false);
        scrollShowDistanceRef.current = 0;
        revealLockScrollTopRef.current = currentScrollTop + 40;
      }

      lastScrollTopRef.current = currentScrollTop;
    },
    [activeTab, databaseView],
  );

  const resetDatabasePage = useCallback(() => {
    resetTransientUi();
    setDatabaseView('browse');
  }, [resetTransientUi]);

  const openSearch = useCallback(() => {
    resetTransientUi();
    setDatabaseView('search');
  }, [resetTransientUi]);

  const closeSearch = useCallback(() => {
    resetTransientUi();
    setDatabaseView('browse');
  }, [resetTransientUi]);

  const openFilter = useCallback(
    (mode) => {
      resetTransientUi();
      setFilterSheet({
        mode,
        sourceView: databaseView,
      });
    },
    [databaseView, resetTransientUi],
  );

  const closeFilter = useCallback(() => {
    setFilterSheet(null);
  }, []);

  const handleFilterSearchOpen = useCallback(() => {
    if (filterSheet?.sourceView === 'search') {
      closeFilter();
      return;
    }

    openSearch();
  }, [closeFilter, filterSheet?.sourceView, openSearch]);
  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    closeFilter,
    closeSearch,
    compact,
    clearSearchQuery,
    databaseView,
    displayVessels,
    filterSheet,
    filteredDisplayVessels,
    handleCompactChange,
    handleFilterSearchOpen,
    handleMainScroll,
    harborFilter,
    harborOptions,
    mainContentRef,
    openFilter,
    openSearch,
    resetDatabasePage,
    searchQuery,
    searchedDisplayVessels,
    setHarborFilter,
    setSearchQuery,
    setVesselTypeFilter,
    topBarHidden,
    vesselTypeFilter,
  };
}
