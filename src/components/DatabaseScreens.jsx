import { motion } from 'framer-motion';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { filterVessels } from '../appDomain';
import { getPressMotion } from '../motion';
import { assets } from '../uiAssets';
import BottomTab from './BottomTab';
import { StatusIcon } from './Icons';

function applySearchQuery(vessels, query) {
  const loweredQuery = query.trim().toLowerCase();

  if (!loweredQuery) {
    return vessels;
  }

  return vessels.filter((vessel) =>
    [vessel.name, vessel.registration, vessel.port, vessel.business].some((value) => value.toLowerCase().includes(loweredQuery)),
  );
}

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
  const harborArrow = anyDropdownOpen ? assets.arrowUp : compact ? assets.chevronCompact : assets.chevron;
  const vesselArrow = anyDropdownOpen ? assets.arrowUp : compact ? assets.chevronCompact : assets.chevron;
  const compactViewIcon = compact ? assets.listIconCompact : assets.listIcon;
  const cardViewIcon = compact ? assets.cardIconCompact : assets.cardIcon;

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
            style={inFilterSheet && harborLabelWidth ? { width: `${harborLabelWidth}px` } : undefined}
          >
            {harborLabel}
          </span>
          <img src={harborArrow} alt="" />
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
            style={inFilterSheet && vesselTypeLabelWidth ? { width: `${vesselTypeLabelWidth}px` } : undefined}
          >
            {vesselTypeLabel}
          </span>
          <img src={vesselArrow} alt="" />
        </motion.button>
      </div>

      <div className={`view-options ${blurViewOptions ? 'view-options--blurred' : ''}`} aria-label="보기 옵션">
        <motion.button
          className={`icon-button pressable-control pressable-control--icon ${compact ? 'icon-button--active' : ''}`}
          type="button"
          aria-label="요약 보기"
          onClick={() => onToggleCompact(true)}
          {...getPressMotion('icon')}
        >
          <img src={compactViewIcon} alt="" />
        </motion.button>
        <motion.button
          className={`icon-button pressable-control pressable-control--icon ${compact ? '' : 'icon-button--active'}`}
          type="button"
          aria-label="카드 보기"
          onClick={() => onToggleCompact(false)}
          {...getPressMotion('icon')}
        >
          <img src={cardViewIcon} alt="" />
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
  const searchIcon = compact ? assets.searchCompact : assets.search;

  return (
    <header className={`top-bar ${hidden ? 'top-bar--hidden' : ''} ${inFilterSheet ? 'top-bar--filter-sheet' : ''}`}>
      <div className="top-bar__main">
        <img className="top-bar__logo" src={assets.logo} alt="SDRS" />
        <motion.button
          className="icon-button pressable-control pressable-control--icon"
          type="button"
          aria-label="검색"
          onClick={onSearchOpen}
          {...getPressMotion('icon')}
        >
          <img src={searchIcon} alt="" />
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

function InfoTable({ vessel }) {
  return (
    <div className="info-table">
      <div className="info-table__row">
        <div className="info-table__cell info-table__cell--label">항포구</div>
        <div className="info-table__cell info-table__cell--value">{vessel.port}</div>
      </div>
      <div className="info-table__row">
        <div className="info-table__cell info-table__cell--label">업종</div>
        <div className="info-table__cell info-table__cell--value">{vessel.business}</div>
      </div>
      <div className="info-table__row">
        <div className="info-table__cell info-table__cell--label">총톤수</div>
        <div className="info-table__cell info-table__cell--value">{vessel.tonnage}</div>
      </div>
    </div>
  );
}

function EquipmentTable({ vessel }) {
  return (
    <div className="equipment-table">
      <div className="equipment-table__row">
        <div className="equipment-table__cell equipment-table__cell--label">소나</div>
        <div
          className={`equipment-table__cell equipment-table__cell--icon ${
            vessel.sonar ? 'equipment-table__cell--icon-active' : ''
          }`}
        >
          <StatusIcon name={vessel.sonar ? 'check' : 'close'} />
        </div>
      </div>
      <div className="equipment-table__row">
        <div className="equipment-table__cell equipment-table__cell--label">어군 탐지기</div>
        <div
          className={`equipment-table__cell equipment-table__cell--icon ${
            vessel.detector ? 'equipment-table__cell--icon-active' : ''
          }`}
        >
          <StatusIcon name={vessel.detector ? 'check' : 'close'} />
        </div>
      </div>
    </div>
  );
}

export function VesselCard({ vessel, onImageClick }) {
  return (
    <article className="vessel-card">
      <motion.button
        className="vessel-card__image-button pressable-control pressable-control--media"
        type="button"
        data-vessel-thumb-id={vessel.id}
        aria-label={`${vessel.name} 이미지 확대`}
        onClick={() => onImageClick(vessel)}
        {...getPressMotion('card')}
      >
        <img className="vessel-card__image" src={vessel.imageWide} alt="" loading="lazy" decoding="async" />
      </motion.button>

      <div className="vessel-card__body">
        <div className="vessel-card__header">
          <h2>{vessel.name}</h2>
          <p>{vessel.registration}</p>
        </div>

        <div className="vessel-card__tables">
          <InfoTable vessel={vessel} />
          <EquipmentTable vessel={vessel} />
        </div>
      </div>
    </article>
  );
}

function CompactRow({ label, value }) {
  return (
    <div className="compact-detail__row">
      <div className="compact-detail__label">{label}</div>
      <div className="compact-detail__value">{value}</div>
    </div>
  );
}

function CompactEquipment({ active, label }) {
  return (
    <div className={`compact-equipment__item ${active ? 'compact-equipment__item--active' : ''}`}>
      <div className={`compact-equipment__label ${active ? 'compact-equipment__label--active' : ''}`}>{label}</div>
      <StatusIcon name={active ? 'check' : 'close'} className="status-icon--compact" />
    </div>
  );
}

export function CompactVesselCard({ vessel, onImageClick }) {
  return (
    <article className="compact-card">
      <div className="compact-card__summary">
        <div className="compact-card__title-group">
          <h2>{vessel.name}</h2>
          <p>{vessel.registration}</p>
        </div>
        <motion.button
          className="compact-card__image-button pressable-control pressable-control--media"
          type="button"
          data-vessel-thumb-id={vessel.id}
          aria-label={`${vessel.name} 이미지 확대`}
          onClick={() => onImageClick(vessel)}
          {...getPressMotion('card')}
        >
          <img className="compact-card__image" src={vessel.imageCompact} alt="" loading="lazy" decoding="async" />
        </motion.button>
      </div>

      <div className="compact-card__details">
        <CompactRow label="항포구" value={vessel.port} />
        <CompactRow label="업종" value={vessel.business} />
        <CompactRow label="총톤수" value={vessel.tonnage} />
      </div>

      <div className="compact-card__divider" />

      <div className="compact-equipment">
        <CompactEquipment label="소나" active={vessel.sonar} />
        <CompactEquipment label="어군 탐지기" active={vessel.detector} />
      </div>
    </article>
  );
}

export function VesselEmptyState() {
  return (
    <div className="vessel-empty-state">
      <img className="vessel-empty-state__icon" src={assets.emptySearch} alt="" />
      <p className="vessel-empty-state__text">조건에 맞는 선박을 찾지 못했어요.</p>
    </div>
  );
}

function SearchTopBar({
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
          <img src={assets.searchBack} alt="" />
        </motion.button>
        <input
          className={`search-top-bar__input ${query ? 'search-top-bar__input--filled' : ''}`}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="검색"
        />
        {query ? (
          <motion.button
            className="search-top-bar__cancel pressable-control pressable-control--icon"
            type="button"
            aria-label="검색 지우기"
            onClick={onClear}
            {...getPressMotion('icon')}
          >
            <img src={assets.searchCancel} alt="" />
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

export function SearchScreen({
  compact,
  harborFilter,
  query,
  vesselTypeFilter,
  vessels,
  onBack,
  onClear,
  onHarborFilterOpen,
  onImageClick,
  onManageOpen,
  onMenuOpen,
  onQueryChange,
  onToggleCompact,
  onVesselTypeFilterOpen,
}) {
  const searchedVessels = useMemo(() => applySearchQuery(vessels, query), [vessels, query]);
  const handleImageClick = (selectedVessel) => onImageClick(selectedVessel, searchedVessels);

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--search">
        <SearchTopBar
          compact={compact}
          harborFilter={harborFilter}
          query={query}
          vesselTypeFilter={vesselTypeFilter}
          onBack={onBack}
          onClear={onClear}
          onHarborFilterOpen={onHarborFilterOpen}
          onQueryChange={onQueryChange}
          onToggleCompact={onToggleCompact}
          onVesselTypeFilterOpen={onVesselTypeFilterOpen}
        />

        <div className="main-content main-content--search">
          {searchedVessels.length === 0 ? (
            <VesselEmptyState />
          ) : compact ? (
            searchedVessels.map((vessel, index) => (
              <div key={vessel.id}>
                <CompactVesselCard vessel={vessel} onImageClick={handleImageClick} />
                {index < searchedVessels.length - 1 ? <div className="section-divider" /> : null}
              </div>
            ))
          ) : (
            searchedVessels.map((vessel, index) => (
              <div key={vessel.id}>
                <VesselCard vessel={vessel} onImageClick={handleImageClick} />
                {index < searchedVessels.length - 1 ? <div className="section-divider" /> : null}
              </div>
            ))
          )}
        </div>

        <BottomTab activeTab="db" compact={compact} onDbClick={onBack} onManageClick={onManageOpen} onMenuClick={onMenuOpen} />
      </section>
    </main>
  );
}

export function FilterScreen({
  compact,
  filterMode,
  harborFilter,
  harborOptions,
  query = '',
  vessels,
  onClose,
  onHarborSelect,
  onImageClick,
  onManageOpen,
  onMenuOpen,
  onSearchOpen,
  onToggleCompact,
  onVesselTypeSelect,
  vesselTypeFilter,
  vesselTypeOptions,
}) {
  const overlayRef = useRef(null);
  const harborButtonRef = useRef(null);
  const harborLabelRef = useRef(null);
  const vesselTypeButtonRef = useRef(null);
  const vesselTypeLabelRef = useRef(null);
  const harborOptionRefs = useRef([]);
  const vesselTypeOptionRefs = useRef([]);
  const [harborLabelWidth, setHarborLabelWidth] = useState(0);
  const [vesselTypeLabelWidth, setVesselTypeLabelWidth] = useState(0);
  const [columnLayout, setColumnLayout] = useState({
    top: 122,
    harborLeft: 18,
    vesselTypeLeft: 18,
  });

  useLayoutEffect(() => {
    const measureWidths = () => {
      const nextHarborWidth = Math.max(0, ...harborOptionRefs.current.map((node) => node?.getBoundingClientRect().width ?? 0));
      const nextVesselTypeWidth = Math.max(0, ...vesselTypeOptionRefs.current.map((node) => node?.getBoundingClientRect().width ?? 0));

      setHarborLabelWidth(nextHarborWidth);
      setVesselTypeLabelWidth(nextVesselTypeWidth);
    };

    measureWidths();
    window.addEventListener('resize', measureWidths);

    return () => window.removeEventListener('resize', measureWidths);
  }, [harborOptions, vesselTypeOptions]);

  useLayoutEffect(() => {
    const updateColumnLayout = () => {
      if (!overlayRef.current || !harborLabelRef.current || !vesselTypeLabelRef.current) {
        return;
      }

      const overlayRect = overlayRef.current.getBoundingClientRect();
      const harborLabelRect = harborLabelRef.current.getBoundingClientRect();
      const vesselTypeLabelRect = vesselTypeLabelRef.current.getBoundingClientRect();

      setColumnLayout({
        top: 122,
        harborLeft: Math.max(18, harborLabelRect.left - overlayRect.left),
        vesselTypeLeft: Math.max(18, vesselTypeLabelRect.left - overlayRect.left),
      });
    };

    updateColumnLayout();
    window.addEventListener('resize', updateColumnLayout);

    return () => window.removeEventListener('resize', updateColumnLayout);
  }, [compact, filterMode, harborFilter, harborLabelWidth, vesselTypeFilter, vesselTypeLabelWidth]);

  const filteredVessels = useMemo(
    () => applySearchQuery(filterVessels(vessels, harborFilter, vesselTypeFilter), query),
    [harborFilter, query, vesselTypeFilter, vessels],
  );
  const handleImageClick = (selectedVessel) => onImageClick(selectedVessel, filteredVessels);

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--search phone-screen--filter">
        <TopBar
          blurViewOptions
          compact={compact}
          harborFilter={harborFilter}
          harborButtonRef={harborButtonRef}
          harborLabelRef={harborLabelRef}
          harborLabelWidth={harborLabelWidth}
          hidden={false}
          inFilterSheet
          openState={filterMode}
          onHarborFilterOpen={onClose}
          onSearchOpen={onSearchOpen}
          onToggleCompact={onToggleCompact}
          onVesselTypeFilterOpen={onClose}
          vesselTypeButtonRef={vesselTypeButtonRef}
          vesselTypeFilter={vesselTypeFilter}
          vesselTypeLabelRef={vesselTypeLabelRef}
          vesselTypeLabelWidth={vesselTypeLabelWidth}
        />

        <div className="filter-screen__results">
          <div className="main-content main-content--filter">
            {filteredVessels.length === 0 ? (
              <VesselEmptyState />
            ) : compact ? (
              filteredVessels.map((vessel, index) => (
                <div key={vessel.id}>
                  <CompactVesselCard vessel={vessel} onImageClick={handleImageClick} />
                  {index < filteredVessels.length - 1 ? <div className="section-divider" /> : null}
                </div>
              ))
            ) : (
              filteredVessels.map((vessel, index) => (
                <div key={vessel.id}>
                  <VesselCard vessel={vessel} onImageClick={handleImageClick} />
                  {index < filteredVessels.length - 1 ? <div className="section-divider" /> : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="filter-screen__overlay">
          <button className="filter-screen__backdrop interaction-reset" type="button" aria-label="필터 닫기" onClick={onClose} />
        </div>

        <div className="filter-screen__panel" ref={overlayRef}>
          <div className="filter-screen__columns">
            <div className="filter-screen__column" style={{ top: `${columnLayout.top}px`, left: `${columnLayout.harborLeft}px` }}>
              {harborOptions.map((option) => (
                <motion.button
                  key={option}
                  className={`filter-screen__option pressable-control pressable-control--option ${
                    harborFilter === option ? 'filter-screen__option--active' : ''
                  }`}
                  ref={(node) => {
                    harborOptionRefs.current[harborOptions.indexOf(option)] = node;
                  }}
                  type="button"
                  onClick={() => {
                    onHarborSelect(option);
                    onClose();
                  }}
                  {...getPressMotion('row')}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            <div className="filter-screen__column" style={{ top: `${columnLayout.top}px`, left: `${columnLayout.vesselTypeLeft}px` }}>
              {vesselTypeOptions.map((option) => (
                <motion.button
                  key={option}
                  className={`filter-screen__option pressable-control pressable-control--option ${
                    vesselTypeFilter === option ? 'filter-screen__option--active' : ''
                  }`}
                  ref={(node) => {
                    vesselTypeOptionRefs.current[vesselTypeOptions.indexOf(option)] = node;
                  }}
                  type="button"
                  onClick={() => {
                    onVesselTypeSelect(option);
                    onClose();
                  }}
                  {...getPressMotion('row')}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <BottomTab activeTab="db" compact={compact} onDbClick={onClose} onManageClick={onManageOpen} onMenuClick={onMenuOpen} />
      </section>
    </main>
  );
}
