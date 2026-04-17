import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const assets = {
  shipWideA: 'https://www.figma.com/api/mcp/asset/67ab4606-6dee-4a02-8755-2216a79de9f4',
  shipWideB: 'https://www.figma.com/api/mcp/asset/ef8f7406-2285-4410-902f-2641e388e35f',
  shipCompact: 'https://www.figma.com/api/mcp/asset/ceeb9fe1-943a-4c7c-aade-4b9aad105e10',
  logo: 'https://www.figma.com/api/mcp/asset/82a70d65-f7fb-48f0-8179-1e12b7139bd1',
  search: 'https://www.figma.com/api/mcp/asset/2b933bca-20cd-40c4-a01f-93dbeca46a9a',
  searchCompact: 'https://www.figma.com/api/mcp/asset/290e1da4-9d4e-4df2-93bc-b380298dc366',
  chevron: 'https://www.figma.com/api/mcp/asset/76e36950-bf64-4376-b178-3eb129c8d703',
  chevronCompact: 'https://www.figma.com/api/mcp/asset/735aa1a7-3307-4b95-9d76-07fba82f5692',
  listIcon: 'https://www.figma.com/api/mcp/asset/e3bf4c01-8aaa-4469-925d-e3a0fba32eed',
  listIconCompact: 'https://www.figma.com/api/mcp/asset/a35d80f4-0b63-4de4-a34c-d07df1dee75c',
  cardIcon: 'https://www.figma.com/api/mcp/asset/bf08c90d-81e3-40e7-87db-44f327b39c80',
  cardIconCompact: 'https://www.figma.com/api/mcp/asset/90902670-fdc9-4104-8abc-e4583f8192a2',
  tabDb: 'https://www.figma.com/api/mcp/asset/e837aaad-4654-4a5b-853e-dc157726a5e2',
  tabDbCompact: 'https://www.figma.com/api/mcp/asset/9860dd1d-2ad6-424f-bde5-3404b8126935',
  tabManage: 'https://www.figma.com/api/mcp/asset/8a01b4e8-e757-4cb7-a4fe-6843bebd7d62',
  tabManageCompact: 'https://www.figma.com/api/mcp/asset/5ddbd099-3fc1-4db9-9981-0b1560ac9cfc',
  tabMenu: 'https://www.figma.com/api/mcp/asset/2d6f5b77-6480-40f7-b564-f94875651ba9',
  tabMenuCompact: 'https://www.figma.com/api/mcp/asset/6c30ea77-2f2c-450a-8711-6563ed2e7071',
  external: 'https://www.figma.com/api/mcp/asset/7ef38d85-3819-49c0-be07-31fa5e05160d',
  back: 'https://www.figma.com/api/mcp/asset/646af1ba-5544-4da2-9365-9c818c86173c',
  detailBack: 'https://www.figma.com/api/mcp/asset/a0fc3a38-caca-4963-a144-a9dc2233d627',
  searchBack: 'https://www.figma.com/api/mcp/asset/d005ba95-815f-4609-b7b6-59fb77aa3aef',
  searchCancel: 'https://www.figma.com/api/mcp/asset/2bdc2416-7cc9-4a40-922d-28741a32a789',
  arrowUp: 'https://www.figma.com/api/mcp/asset/31ea5b23-d727-40c2-a2df-717a477a8088',
  menuArrowForward: 'https://www.figma.com/api/mcp/asset/f7dc2877-4e1f-4c29-98a6-b8ee1ccc178e',
  menuInfoMark: 'https://www.figma.com/api/mcp/asset/801e4b10-a68c-43f4-a255-fea9589ea994',
  menuInfoLogo: 'https://www.figma.com/api/mcp/asset/66645103-64c6-44ac-9693-59729d446de9',
  menuCheck: 'https://www.figma.com/api/mcp/asset/86924083-f88a-4a6c-90b9-b2129580bf43',
  menuBack: 'https://www.figma.com/api/mcp/asset/7c884662-5127-4389-af6c-ce87474f53e9',
  tabDbInactive: 'https://www.figma.com/api/mcp/asset/99c74215-be29-4912-8258-84106ccf29c5',
  tabManageInactive: 'https://www.figma.com/api/mcp/asset/d05f4b12-59aa-4a2e-bacf-8f8bd0bf0ea6',
  tabMenuActive: 'https://www.figma.com/api/mcp/asset/99331aeb-d356-4335-921d-57ffd3178a2f',
};

const vesselData = [
  {
    id: 1,
    name: '고리호',
    registration: '058123-2019282',
    port: '이천항',
    business: '수하식양식업',
    tonnage: '7.53',
    sonar: false,
    detector: true,
    imageWide: assets.shipWideA,
    imageCompact: assets.shipCompact,
  },
  {
    id: 2,
    name: '학리호',
    registration: '058123-2019282',
    port: '이천항',
    business: '수하식양식업',
    tonnage: '7.53',
    sonar: false,
    detector: true,
    imageWide: assets.shipWideB,
    imageCompact: assets.shipCompact,
  },
  {
    id: 3,
    name: '학리호',
    registration: '058123-2019282',
    port: '이천항',
    business: '수하식양식업',
    tonnage: '7.53',
    sonar: false,
    detector: true,
    imageWide: assets.shipWideB,
    imageCompact: assets.shipCompact,
  },
];

const harborOptions = ['전체 항포구', '길천항', '월내항', '임랑항', '문동항'];
const vesselTypeOptions = ['전체 선박', '어선', '보트'];
const colorModeLabels = {
  system: '시스템 설정',
  light: '라이트',
  dark: '다크',
};

function StatusIcon({ name, className = '' }) {
  const isCheck = name === 'check';

  return (
    <svg
      className={`status-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      {isCheck ? (
        <path d="M6 12.5L10 16.5L18 8.5" />
      ) : (
        <>
          <path d="M8 8L16 16" />
          <path d="M16 8L8 16" />
        </>
      )}
    </svg>
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
  vesselTypeLabel = '전체 선박',
  vesselTypeButtonRef,
  vesselTypeLabelWidth,
  vesselTypeLabelRef,
  openState = 'closed',
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
        <button className="filter-button" ref={harborButtonRef} type="button" onClick={onHarborClick}>
          <span
            className="filter-button__label"
            ref={harborLabelRef}
            style={inFilterSheet && harborLabelWidth ? { width: `${harborLabelWidth}px` } : undefined}
          >
            {harborLabel}
          </span>
          <img src={harborArrow} alt="" />
        </button>
        <button className="filter-button" ref={vesselTypeButtonRef} type="button" onClick={onVesselTypeClick}>
          <span
            className="filter-button__label"
            ref={vesselTypeLabelRef}
            style={inFilterSheet && vesselTypeLabelWidth ? { width: `${vesselTypeLabelWidth}px` } : undefined}
          >
            {vesselTypeLabel}
          </span>
          <img src={vesselArrow} alt="" />
        </button>
      </div>

      <div className={`view-options ${blurViewOptions ? 'view-options--blurred' : ''}`} aria-label="보기 옵션">
        <button
          className={`icon-button ${compact ? 'icon-button--active' : ''}`}
          type="button"
          aria-label="요약 보기"
          onClick={() => onToggleCompact(true)}
        >
          <img src={compactViewIcon} alt="" />
        </button>
        <button
          className={`icon-button ${compact ? '' : 'icon-button--active'}`}
          type="button"
          aria-label="카드 보기"
          onClick={() => onToggleCompact(false)}
        >
          <img src={cardViewIcon} alt="" />
        </button>
      </div>
    </div>
  );
}

function TopBar({
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
        <button className="icon-button" type="button" aria-label="검색" onClick={onSearchOpen}>
          <img src={searchIcon} alt="" />
        </button>
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

function InfoTable({ vessel, onPortClick }) {
  return (
    <div className="info-table">
      <div className="info-table__row">
        <div className="info-table__cell info-table__cell--label">항포구</div>
        <div className="info-table__cell info-table__cell--value info-table__cell--link">
          <button className="info-table__port-button" type="button" onClick={() => onPortClick(vessel.port)}>
            <span className="info-table__link-text">{vessel.port}</span>
          </button>
          <span className="info-table__external">↗</span>
        </div>
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
        <div className="equipment-table__cell equipment-table__cell--icon">
          <StatusIcon name="close" />
        </div>
      </div>
      <div className="equipment-table__row">
        <div className="equipment-table__cell equipment-table__cell--label">어군 탐지기</div>
        <div className="equipment-table__cell equipment-table__cell--icon equipment-table__cell--icon-active">
          <StatusIcon name="check" />
        </div>
      </div>
    </div>
  );
}

function VesselCard({ vessel, onPortClick }) {
  return (
    <article className="vessel-card">
      <img className="vessel-card__image" src={vessel.imageWide} alt="" />

      <div className="vessel-card__body">
        <div className="vessel-card__header">
          <h2>{vessel.name}</h2>
          <p>{vessel.registration}</p>
        </div>

        <div className="vessel-card__tables">
          <InfoTable vessel={vessel} onPortClick={onPortClick} />
          <EquipmentTable vessel={vessel} />
        </div>
      </div>
    </article>
  );
}

function CompactRow({ label, value, link, onClick }) {
  return (
    <div className="compact-detail__row">
      <div className="compact-detail__label">{label}</div>
      <div className={`compact-detail__value ${link ? 'compact-detail__value--link' : ''}`}>
        {link ? (
          <button className="compact-detail__link-button" type="button" onClick={onClick}>
            {value}
          </button>
        ) : (
          value
        )}
        {link ? <img src={assets.external} alt="" /> : null}
      </div>
    </div>
  );
}

function CompactEquipment({ label, active }) {
  return (
    <div className="compact-equipment__item">
      <div className={`compact-equipment__label ${active ? 'compact-equipment__label--active' : ''}`}>
        {label}
      </div>
      <StatusIcon name={active ? 'check' : 'close'} className="status-icon--compact" />
    </div>
  );
}

function CompactVesselCard({ vessel, onPortClick }) {
  return (
    <article className="compact-card">
      <div className="compact-card__summary">
        <div className="compact-card__title-group">
          <h2>{vessel.name}</h2>
          <p>{vessel.registration}</p>
        </div>
        <img className="compact-card__image" src={vessel.imageCompact} alt="" />
      </div>

      <div className="compact-card__details">
        <CompactRow label="항포구" value={vessel.port} link onClick={() => onPortClick(vessel.port)} />
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

function BottomTab({ activeTab = 'db', compact, onDbClick, onMenuClick }) {
  const db =
    activeTab === 'menu'
      ? assets.tabDbInactive
      : compact
        ? assets.tabDbCompact
        : assets.tabDb;
  const manage = activeTab === 'menu' ? assets.tabManageInactive : compact ? assets.tabManageCompact : assets.tabManage;
  const menu = activeTab === 'menu' ? assets.tabMenuActive : compact ? assets.tabMenuCompact : assets.tabMenu;

  return (
    <nav className="bottom-tab" aria-label="하단 탭">
      <button
        className={`bottom-tab__item ${activeTab === 'db' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onDbClick}
      >
        <img src={db} alt="" />
        <span>DB</span>
      </button>
      <button className="bottom-tab__item" type="button">
        <img src={manage} alt="" />
        <span>데이터 관리</span>
      </button>
      <button
        className={`bottom-tab__item ${activeTab === 'menu' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onMenuClick}
      >
        <img src={menu} alt="" />
        <span>메뉴</span>
      </button>
    </nav>
  );
}

function SearchTopBar({ compact, query, onBack, onClear, onQueryChange, onToggleCompact }) {
  return (
    <header className="search-top-bar">
      <div className="search-top-bar__main">
        <button className="search-top-bar__back" type="button" aria-label="뒤로가기" onClick={onBack}>
          <img src={assets.searchBack} alt="" />
        </button>
        <input
          className={`search-top-bar__input ${query ? 'search-top-bar__input--filled' : ''}`}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="검색"
        />
        {query ? (
          <button className="search-top-bar__cancel" type="button" aria-label="검색 지우기" onClick={onClear}>
            <img src={assets.searchCancel} alt="" />
          </button>
        ) : (
          <div className="search-top-bar__cancel-placeholder" />
        )}
      </div>
      <FiltersRow compact={compact} onToggleCompact={onToggleCompact} />
    </header>
  );
}

function SearchScreen({ compact, query, onBack, onClear, onMenuOpen, onQueryChange, onPortClick, onToggleCompact }) {
  const lowered = query.trim().toLowerCase();
  const filtered = lowered
    ? vesselData.filter((vessel) =>
        [vessel.name, vessel.registration, vessel.port, vessel.business].some((value) =>
          value.toLowerCase().includes(lowered),
        ),
      )
    : vesselData;

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--search">
        <SearchTopBar
          compact={compact}
          query={query}
          onBack={onBack}
          onClear={onClear}
          onQueryChange={onQueryChange}
          onToggleCompact={onToggleCompact}
        />

        <div className="main-content main-content--search">
          {compact
            ? filtered.map((vessel, index) => (
                <div key={vessel.id}>
                  <CompactVesselCard vessel={vessel} onPortClick={onPortClick} />
                  {index < filtered.length - 1 ? <div className="section-divider" /> : null}
                </div>
              ))
            : filtered.map((vessel, index) => (
                <div key={vessel.id}>
                  <VesselCard vessel={vessel} onPortClick={onPortClick} />
                  {index < filtered.length - 1 ? <div className="section-divider" /> : null}
                </div>
              ))}
        </div>

        <BottomTab activeTab="db" compact={compact} onDbClick={onBack} onMenuClick={onMenuOpen} />
      </section>
    </main>
  );
}

function FilterScreen({
  compact,
  filterMode,
  harborFilter,
  harborOptions,
  onClose,
  onFilterModeChange,
  onHarborSelect,
  onMenuOpen,
  onPortClick,
  onSearchOpen,
  onToggleCompact,
  onVesselTypeSelect,
  vesselTypeOptions,
  vesselTypeFilter,
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
      const nextHarborWidth = Math.max(
        0,
        ...harborOptionRefs.current.map((node) => node?.getBoundingClientRect().width ?? 0),
      );
      const nextVesselTypeWidth = Math.max(
        0,
        ...vesselTypeOptionRefs.current.map((node) => node?.getBoundingClientRect().width ?? 0),
      );

      setHarborLabelWidth(nextHarborWidth);
      setVesselTypeLabelWidth(nextVesselTypeWidth);
    };

    measureWidths();
    window.addEventListener('resize', measureWidths);
    return () => window.removeEventListener('resize', measureWidths);
  }, [harborOptions, vesselTypeOptions]);

  useLayoutEffect(() => {
    const updateColumnLayout = () => {
      if (
        !overlayRef.current ||
        !harborButtonRef.current ||
        !vesselTypeButtonRef.current ||
        !harborLabelRef.current ||
        !vesselTypeLabelRef.current
      ) {
        return;
      }

      const overlayRect = overlayRef.current.getBoundingClientRect();
      const harborButtonRect = harborButtonRef.current.getBoundingClientRect();
      const vesselTypeButtonRect = vesselTypeButtonRef.current.getBoundingClientRect();
      const harborLabelRect = harborLabelRef.current.getBoundingClientRect();
      const vesselTypeLabelRect = vesselTypeLabelRef.current.getBoundingClientRect();

      setColumnLayout({
        top: Math.round(Math.max(harborButtonRect.bottom, vesselTypeButtonRect.bottom) - overlayRect.top + 24),
        harborLeft: Math.max(18, harborLabelRect.left - overlayRect.left),
        vesselTypeLeft: Math.max(18, vesselTypeLabelRect.left - overlayRect.left),
      });
    };

    updateColumnLayout();
    window.addEventListener('resize', updateColumnLayout);
    return () => window.removeEventListener('resize', updateColumnLayout);
  }, [compact, filterMode, harborFilter, harborLabelWidth, vesselTypeFilter, vesselTypeLabelWidth]);

  const filtered = vesselData.filter((vessel) => {
    const matchesHarbor = harborFilter === '전체 항포구' || vessel.port === harborFilter;
    const matchesType =
      vesselTypeFilter === '전체 선박' ||
      (vesselTypeFilter === '어선' ? vessel.name !== '보트' : vessel.name === '보트');
    return matchesHarbor && matchesType;
  });

  const options = filterMode === 'harbor' ? harborOptions : vesselTypeOptions;

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--search phone-screen--filter">
        <TopBar
          blurViewOptions
          compact={compact}
          harborFilter={harborFilter}
          harborButtonRef={harborButtonRef}
          harborLabelWidth={harborLabelWidth}
          harborLabelRef={harborLabelRef}
          hidden={false}
          inFilterSheet
          openState={filterMode}
          onHarborFilterOpen={() => {
            onClose();
          }}
          onSearchOpen={onSearchOpen}
          onToggleCompact={onToggleCompact}
          onVesselTypeFilterOpen={() => {
            onClose();
          }}
          vesselTypeButtonRef={vesselTypeButtonRef}
          vesselTypeLabelWidth={vesselTypeLabelWidth}
          vesselTypeLabelRef={vesselTypeLabelRef}
          vesselTypeFilter={vesselTypeFilter}
        />

        <div className="filter-screen__results">
          <div className="main-content main-content--filter">
            {compact
              ? filtered.map((vessel, index) => (
                  <div key={vessel.id}>
                    <CompactVesselCard vessel={vessel} onPortClick={onPortClick} />
                    {index < filtered.length - 1 ? <div className="section-divider" /> : null}
                  </div>
                ))
              : filtered.map((vessel, index) => (
                  <div key={vessel.id}>
                    <VesselCard vessel={vessel} onPortClick={onPortClick} />
                    {index < filtered.length - 1 ? <div className="section-divider" /> : null}
                  </div>
                ))}
          </div>
        </div>

	        <div className="filter-screen__overlay" ref={overlayRef}>
	          <button className="filter-screen__backdrop" type="button" aria-label="필터 닫기" onClick={onClose} />
	          <div className="filter-screen__panel">
	            <div className="filter-screen__columns" style={{ paddingTop: `${columnLayout.top}px` }}>
              <div className="filter-screen__column" style={{ left: `${columnLayout.harborLeft}px` }}>
                {harborOptions.map((option) => (
                  <button
                    key={option}
                    className={`filter-screen__option ${harborFilter === option ? 'filter-screen__option--active' : ''}`}
                    ref={(node) => {
                      harborOptionRefs.current[harborOptions.indexOf(option)] = node;
                    }}
                    type="button"
                    onClick={() => {
                      onHarborSelect(option);
                      onClose();
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="filter-screen__column" style={{ left: `${columnLayout.vesselTypeLeft}px` }}>
                {vesselTypeOptions.map((option) => (
                  <button
                    key={option}
                    className={`filter-screen__option ${vesselTypeFilter === option ? 'filter-screen__option--active' : ''}`}
                    ref={(node) => {
                      vesselTypeOptionRefs.current[vesselTypeOptions.indexOf(option)] = node;
                    }}
                    type="button"
                    onClick={() => {
                      onVesselTypeSelect(option);
                      onClose();
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BottomTab activeTab="db" compact={compact} onDbClick={onClose} onMenuClick={onMenuOpen} />
      </section>
    </main>
  );
}

function PortDetailScreen({ portName, onBack }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--detail">
        <header className="detail-top-bar">
          <button className="detail-back-button" type="button" aria-label="뒤로가기" onClick={onBack}>
            <img src={assets.detailBack} alt="" />
          </button>
        </header>

        <h1 className="detail-screen__title">어촌계 정보</h1>

        <div className="detail-screen__panel">
          <h2 className="detail-screen__port-name">{portName}</h2>

          <div className="detail-screen__rows">
            <div className="detail-screen__row">
              <div className="detail-screen__label">어촌계장</div>
              <div className="detail-screen__value">김철수</div>
            </div>
            <div className="detail-screen__row">
              <div className="detail-screen__label">연락처</div>
              <a className="detail-screen__value detail-screen__value--link" href="tel:01012345678">
                010-1234-5678
              </a>
            </div>
            <div className="detail-screen__row">
              <div className="detail-screen__label">주소</div>
              <div className="detail-screen__value">서울특별시 광진구 454</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MenuRow({ children, detail, onClick, showArrow = false }) {
  return (
    <button className="menu-row" type="button" onClick={onClick}>
      <span className="menu-row__label">{children}</span>
      {detail || showArrow ? (
        <span className="menu-row__detail-group">
          {detail ? <span className="menu-row__detail">{detail}</span> : null}
          <img className="menu-row__arrow" src={assets.menuArrowForward} alt="" />
        </span>
      ) : null}
    </button>
  );
}

function SubpageTopBar({ title, onBack }) {
  return (
    <>
      <header className="detail-top-bar detail-top-bar--menu">
        <button className="detail-back-button" type="button" aria-label="뒤로가기" onClick={onBack}>
          <img src={assets.menuBack} alt="" />
        </button>
      </header>
      <h1 className="menu-screen__title menu-screen__title--subpage">{title}</h1>
    </>
  );
}

function MenuScreen({ compact, colorMode, onColorModeOpen, onDbOpen, onInfoOpen, onLogout }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu">
        <h1 className="menu-screen__title">메뉴</h1>

        <div className="menu-screen__content">
          <MenuRow detail={colorModeLabels[colorMode]} onClick={onColorModeOpen}>
            화면 모드
          </MenuRow>

          <div className="menu-screen__divider" />

          <div className="menu-screen__group">
            <MenuRow showArrow onClick={onInfoOpen}>
              앱 정보
            </MenuRow>
            <MenuRow onClick={onLogout}>로그아웃</MenuRow>
          </div>
        </div>

        <BottomTab activeTab="menu" compact={compact} onDbClick={onDbOpen} onMenuClick={undefined} />
      </section>
    </main>
  );
}

function MenuModeScreen({ colorMode, onBack, onSelectMode }) {
  const modeOptions = [
    { value: 'system', label: '시스템 설정' },
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
  ];

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage">
        <SubpageTopBar title="화면 모드" onBack={onBack} />

        <div className="menu-subpage__section">
          {modeOptions.map((modeOption) => (
            <button
              key={modeOption.value}
              className="menu-subpage__row menu-subpage__row--button"
              type="button"
              onClick={() => onSelectMode(modeOption.value)}
            >
              <span className="menu-subpage__label">{modeOption.label}</span>
              {colorMode === modeOption.value ? <img className="menu-subpage__check" src={assets.menuCheck} alt="" /> : null}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function MenuInfoScreen({ onBack }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage">
        <SubpageTopBar title="앱 정보" onBack={onBack} />

        <div className="menu-info">
          <div className="menu-info__background" />
          <div className="menu-info__content">
            <img className="menu-info__mark" src={assets.menuInfoMark} alt="" />
            <div className="menu-info__logo-wrap">
              <img className="menu-info__logo" src={assets.menuInfoLogo} alt="SDRS 선박DB조회체계" />
            </div>
            <p className="menu-info__version">버전 1.0</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function PersistedScreen({ active, children }) {
  return (
    <div className={`screen-layer ${active ? 'screen-layer--active' : ''}`} aria-hidden={!active}>
      {children}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState('login');
  const [compact, setCompact] = useState(false);
  const [colorMode, setColorMode] = useState('light');
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [selectedPort, setSelectedPort] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [harborFilter, setHarborFilter] = useState('전체 항포구');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('전체 선박');
  const [filterMode, setFilterMode] = useState('harbor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const mainContentRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const mainScrollPositionRef = useRef(0);

  const isFilled = username.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    return () => {
      root.style.colorScheme = '';
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

  const openPortDetail = (portName) => {
    mainScrollPositionRef.current = mainContentRef.current?.scrollTop ?? mainScrollPositionRef.current;
    setSelectedPort(portName);
    setScreen('portDetail');
  };

  const openSearch = () => {
    setTopBarHidden(false);
    setSearchQuery('');
    setScreen('search');
  };

  const openFilter = (mode) => {
    setTopBarHidden(false);
    setFilterMode(mode);
    setScreen('filter');
  };

  const openMenu = () => {
    setTopBarHidden(false);
    setScreen('menu');
  };

  const enterMainScreen = () => {
    mainScrollPositionRef.current = 0;
    lastScrollTopRef.current = 0;
    setTopBarHidden(false);
    setScreen('main');
  };

  return (
    <div className="screen-stack">
      <PersistedScreen active={screen === 'login'}>
        <main className="app-shell">
          <section className="phone-screen phone-screen--login">
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
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                />
              </label>

              <label className={`input-shell ${focusedField === 'password' ? 'input-shell--focused' : ''}`}>
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  placeholder="비밀번호"
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                />
              </label>
            </form>

            <p className="app-version">선박DB정보체계 버전 1.0</p>

            <button
              className={`login-button ${isFilled ? 'login-button--active' : ''}`}
              type="button"
              disabled={!isFilled}
              onClick={enterMainScreen}
            >
              로그인
            </button>
          </section>
        </main>
      </PersistedScreen>

      <PersistedScreen active={screen === 'main'}>
        <main className="app-shell">
          <section className="phone-screen phone-screen--main">
            <TopBar
              compact={compact}
              harborFilter={harborFilter}
              harborLabelWidth={0}
              hidden={topBarHidden}
              onHarborFilterOpen={() => openFilter('harbor')}
              onSearchOpen={openSearch}
              onToggleCompact={setCompact}
              onVesselTypeFilterOpen={() => openFilter('vesselType')}
              vesselTypeLabelWidth={0}
              vesselTypeFilter={vesselTypeFilter}
            />

            <div className="main-content" ref={mainContentRef} onScroll={handleMainScroll}>
              {compact
                ? vesselData.map((vessel, index) => (
                    <div key={vessel.id}>
                      <CompactVesselCard vessel={vessel} onPortClick={openPortDetail} />
                      {index < vesselData.length - 1 ? <div className="section-divider" /> : null}
                    </div>
                  ))
                : vesselData.map((vessel, index) => (
                    <div key={vessel.id}>
                      <VesselCard vessel={vessel} onPortClick={openPortDetail} />
                      {index < vesselData.length - 1 ? <div className="section-divider" /> : null}
                    </div>
                  ))}
            </div>

            <BottomTab activeTab="db" compact={compact} onDbClick={undefined} onMenuClick={openMenu} />
          </section>
        </main>
      </PersistedScreen>

      <PersistedScreen active={screen === 'portDetail'}>
        <PortDetailScreen portName={selectedPort} onBack={() => setScreen('main')} />
      </PersistedScreen>

      <PersistedScreen active={screen === 'search'}>
        <SearchScreen
          compact={compact}
          query={searchQuery}
          onBack={() => setScreen('main')}
          onClear={() => setSearchQuery('')}
          onMenuOpen={openMenu}
          onQueryChange={setSearchQuery}
          onPortClick={openPortDetail}
          onToggleCompact={setCompact}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'filter'}>
        <FilterScreen
          compact={compact}
          filterMode={filterMode}
          harborFilter={harborFilter}
          harborOptions={harborOptions}
          onClose={() => setScreen('main')}
          onFilterModeChange={setFilterMode}
          onHarborSelect={setHarborFilter}
          onMenuOpen={openMenu}
          onPortClick={openPortDetail}
          onSearchOpen={openSearch}
          onToggleCompact={setCompact}
          onVesselTypeSelect={setVesselTypeFilter}
          vesselTypeOptions={vesselTypeOptions}
          vesselTypeFilter={vesselTypeFilter}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'menu'}>
        <MenuScreen
          colorMode={colorMode}
          compact={compact}
          onColorModeOpen={() => setScreen('menuMode')}
          onDbOpen={() => setScreen('main')}
          onInfoOpen={() => setScreen('menuInfo')}
          onLogout={() => {
            setUsername('');
            setPassword('');
            setFocusedField('');
            setScreen('login');
          }}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'menuMode'}>
        <MenuModeScreen
          colorMode={colorMode}
          onBack={() => setScreen('menu')}
          onSelectMode={setColorMode}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'menuInfo'}>
        <MenuInfoScreen onBack={() => setScreen('menu')} />
      </PersistedScreen>
    </div>
  );
}

export default App;
