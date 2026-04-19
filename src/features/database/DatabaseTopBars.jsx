import { motion } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';

import { getPressMotion } from '../../motion.js';
import { AppIcon } from '../../components/Icons.jsx';
import { assets } from '../../assets/assets.js';

function FiltersRow({
  blurViewOptions = false,
  compact,
  harborLabel = '전체 항포구',
  harborButtonRef,
  harborLabelWidth,
  harborLabelRef,
  inFilterSheet = false,
  openState = 'closed',
  vesselTypeLabel = '전체 선박',
  vesselTypeButtonRef,
  vesselTypeLabelWidth,
  vesselTypeLabelRef,
  onHarborClick,
  onToggleCompact,
  onVesselTypeClick,
}) {
  const anyDropdownOpen = openState !== 'closed';
  const dropdownIconName = anyDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (
    <div className={`top-bar__filters ${inFilterSheet ? 'top-bar__filters--filter-sheet' : ''}`}>
      <div className="filter-group">
        <motion.button
          className="filter-button pressable-control pressable-control--pill"
          ref={harborButtonRef}
          type="button"
          onClick={onHarborClick}
          {...getPressMotion('button')}
        >
          <span
            className="filter-button__label"
            ref={harborLabelRef}
            style={
              inFilterSheet && harborLabelWidth ? { width: `${harborLabelWidth}px` } : undefined
            }
          >
            {harborLabel}
          </span>
          <AppIcon
            className="filter-button__icon"
            name={dropdownIconName}
            preset="disclosure"
            tone="slate-400"
          />
        </motion.button>
        <motion.button
          className="filter-button pressable-control pressable-control--pill"
          ref={vesselTypeButtonRef}
          type="button"
          onClick={onVesselTypeClick}
          {...getPressMotion('button')}
        >
          <span
            className="filter-button__label"
            ref={vesselTypeLabelRef}
            style={
              inFilterSheet && vesselTypeLabelWidth
                ? { width: `${vesselTypeLabelWidth}px` }
                : undefined
            }
          >
            {vesselTypeLabel}
          </span>
          <AppIcon
            className="filter-button__icon"
            name={dropdownIconName}
            preset="disclosure"
            tone="slate-400"
          />
        </motion.button>
      </div>

      <div
        className={`view-options ${blurViewOptions ? 'view-options--blurred' : ''}`}
        aria-label="보기 옵션"
      >
        <motion.button
          className={`icon-button pressable-control pressable-control--icon ${compact ? 'icon-button--active' : ''}`}
          type="button"
          aria-label="요약 보기"
          onClick={() => onToggleCompact(true)}
          {...getPressMotion('icon')}
        >
          <AppIcon
            className="view-option-icon"
            name="event_list"
            preset="viewMode"
            tone={compact ? 'slate-500' : 'slate-300'}
          />
        </motion.button>
        <motion.button
          className={`icon-button pressable-control pressable-control--icon ${compact ? '' : 'icon-button--active'}`}
          type="button"
          aria-label="카드 보기"
          onClick={() => onToggleCompact(false)}
          {...getPressMotion('icon')}
        >
          <AppIcon
            className="view-option-icon"
            name="view_stream"
            preset="viewMode"
            tone={compact ? 'slate-300' : 'slate-500'}
          />
        </motion.button>
      </div>
    </div>
  );
}

export function TopBar({
  blurViewOptions = false,
  compact,
  harborFilter,
  harborButtonRef,
  harborLabelWidth,
  harborLabelRef,
  hidden,
  inFilterSheet = false,
  openState = 'closed',
  onHarborFilterOpen,
  onSearchOpen,
  onToggleCompact,
  onVesselTypeFilterOpen,
  vesselTypeButtonRef,
  vesselTypeLabelWidth,
  vesselTypeLabelRef,
  vesselTypeFilter,
}) {
  return (
    <header
      className={`top-bar ${hidden ? 'top-bar--hidden' : ''} ${inFilterSheet ? 'top-bar--filter-sheet' : ''}`}
    >
      <div className="top-bar__main">
        <img className="top-bar__logo" src={assets.logo} alt="SDRS" />
        <motion.button
          className="icon-button pressable-control pressable-control--icon"
          type="button"
          aria-label="검색"
          onClick={onSearchOpen}
          {...getPressMotion('icon')}
        >
          <AppIcon className="top-bar__action-icon" name="search" preset="search" tone="muted" />
        </motion.button>
      </div>
      <FiltersRow
        blurViewOptions={blurViewOptions}
        compact={compact}
        harborLabel={harborFilter}
        harborButtonRef={harborButtonRef}
        harborLabelWidth={harborLabelWidth}
        harborLabelRef={harborLabelRef}
        inFilterSheet={inFilterSheet}
        openState={openState}
        vesselTypeLabel={vesselTypeFilter}
        vesselTypeButtonRef={vesselTypeButtonRef}
        vesselTypeLabelWidth={vesselTypeLabelWidth}
        vesselTypeLabelRef={vesselTypeLabelRef}
        onHarborClick={onHarborFilterOpen}
        onToggleCompact={onToggleCompact}
        onVesselTypeClick={onVesselTypeFilterOpen}
      />
    </header>
  );
}

export function SearchTopBar({
  compact,
  harborFilter,
  query,
  vesselTypeFilter,
  onBack,
  onClear,
  onHarborFilterOpen,
  onQueryChange,
  onToggleCompact,
  onVesselTypeFilterOpen,
}) {
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus({ preventScroll: true });
    };

    const frameId = window.requestAnimationFrame(focusInput);
    const timeoutId = window.setTimeout(focusInput, 120);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <header className="search-top-bar">
      <div className="search-top-bar__main">
        <motion.button
          className="search-top-bar__back pressable-control pressable-control--icon"
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          {...getPressMotion('icon')}
        >
          <AppIcon
            className="search-top-bar__back-icon"
            name="arrow_back_ios_new"
            preset="iosArrow"
            tone="secondary"
          />
        </motion.button>
        <input
          ref={inputRef}
          autoFocus
          className={`search-top-bar__input ${query ? 'search-top-bar__input--filled' : ''}`}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="검색"
          spellCheck={false}
        />
        {query ? (
          <motion.button
            className="search-top-bar__cancel pressable-control pressable-control--icon"
            type="button"
            aria-label="검색 지우기"
            onClick={onClear}
            {...getPressMotion('icon')}
          >
            <AppIcon
              className="search-top-bar__cancel-icon"
              name="cancel"
              preset="closeChip"
              tone="muted"
            />
          </motion.button>
        ) : (
          <div className="search-top-bar__cancel-placeholder" />
        )}
      </div>
      <FiltersRow
        compact={compact}
        harborLabel={harborFilter}
        vesselTypeLabel={vesselTypeFilter}
        onHarborClick={onHarborFilterOpen}
        onToggleCompact={onToggleCompact}
        onVesselTypeClick={onVesselTypeFilterOpen}
      />
    </header>
  );
}
