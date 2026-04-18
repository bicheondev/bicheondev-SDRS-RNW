import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import noImagePlaceholder from '../no-image.svg';
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
  back: 'https://www.figma.com/api/mcp/asset/646af1ba-5544-4da2-9365-9c818c86173c',
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
  zoomClose: 'https://www.figma.com/api/mcp/asset/fd3b5c11-4008-41e6-ae6d-24b9046d5dc8',
  manageChevron: 'https://www.figma.com/api/mcp/asset/0bb4c057-ff50-4059-a013-78583d062a59',
  manageTabDb: 'https://www.figma.com/api/mcp/asset/ce32707b-7c88-4252-ab60-d72935337ce3',
  manageTabActive: 'https://www.figma.com/api/mcp/asset/a4772792-c873-4f21-ae62-cfcdffc439a8',
  manageTabMenu: 'https://www.figma.com/api/mcp/asset/83504d4d-db6d-40b2-a844-58ae15a174e0',
  manageImage: 'https://www.figma.com/api/mcp/asset/22842761-9f91-4d96-8221-d5c4bdf760a8',
  manageBack: 'https://www.figma.com/api/mcp/asset/80d46fb6-4868-4a00-85e1-339542667462',
  manageDropdown: 'https://www.figma.com/api/mcp/asset/58bb45ff-3ca4-445b-8b04-9d13ace71c10',
  manageSearch: 'https://www.figma.com/api/mcp/asset/b6775b24-e19b-4746-a3e4-8eabe7e9a4ef',
  manageCancel: 'https://www.figma.com/api/mcp/asset/e7a46463-a09e-4e29-ad10-c5fb0349a8a5',
  manageEdit: 'https://www.figma.com/api/mcp/asset/5aacef5c-41cf-4ed1-ac35-85ecb06083ed',
  manageDelete: 'https://www.figma.com/api/mcp/asset/2daeef80-e6c7-4b44-8d14-c07a9dfa9513',
  emptySearch: 'https://www.figma.com/api/mcp/asset/5678f554-ac31-41d2-9337-d64fb30f32a5',
};

const vesselTypeOptions = ['전체 선박', '어선', '보트'];
const colorModeLabels = {
  system: '시스템 설정',
  light: '라이트',
  dark: '다크',
};

const manageHomeSecondaryRows = ['선박 DB 편집하기', 'DB 및 이미지 내보내기'];

const emptyManageShipCard = {
  searchKey: '',
  title: '',
  registration: '',
  ownerName: '',
  ownerPhone: '',
  port: '',
  business: '',
  tonnage: '',
  image: noImagePlaceholder,
  imageFileName: '',
  imageMimeType: '',
  sonar: false,
  detector: true,
  selected: true,
};

const MIN_ZOOM_SCALE = 1;
const MAX_ZOOM_SCALE = 4;
const DOUBLE_TAP_ZOOM_SCALE = 2.5;
const TAP_MAX_DURATION = 220;
const DOUBLE_TAP_DELAY = 280;
const TAP_MOVE_TOLERANCE = 12;
const GESTURE_MIN_ZOOM_SCALE = 0.85;
const GESTURE_MAX_ZOOM_SCALE = 4.5;
const PAN_ELASTICITY = 0.24;
const DISMISS_CLOSE_DISTANCE = 140;
const DISMISS_CLOSE_VELOCITY = 0.45;
const DISMISS_MAX_OFFSET = 260;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDistance(pointA, pointB) {
  return Math.hypot(pointA.clientX - pointB.clientX, pointA.clientY - pointB.clientY);
}

function getMidpoint(pointA, pointB) {
  return {
    clientX: (pointA.clientX + pointB.clientX) / 2,
    clientY: (pointA.clientY + pointB.clientY) / 2,
  };
}

function applyElasticity(value, max) {
  if (max <= 0) {
    return value * PAN_ELASTICITY;
  }

  if (Math.abs(value) <= max) {
    return value;
  }

  return Math.sign(value) * (max + (Math.abs(value) - max) * PAN_ELASTICITY);
}

function cloneManageItems(items) {
  return items.map((item) => ({ ...item }));
}

function areImageEntriesEqual(entriesA, entriesB) {
  if (entriesA.length !== entriesB.length) {
    return false;
  }

  return entriesA.every((entry, index) => {
    const otherEntry = entriesB[index];

    if (!otherEntry) {
      return false;
    }

    return (
      entry.fileName === otherEntry.fileName &&
      entry.registration === otherEntry.registration &&
      entry.dataUrl === otherEntry.dataUrl &&
      entry.mimeType === otherEntry.mimeType
    );
  });
}

function normalizeShipCardsForStorage(cards) {
  return cards.map((card, index) => ({
    ...emptyManageShipCard,
    ...card,
    rowNumber: String(index + 1),
    searchKey: card.title,
    selected: false,
  }));
}

function getVesselTypeFromBusiness(business) {
  return business === '연안통발어업' || business === '수하식양식업' ? '어선' : '보트';
}

function filterVessels(vessels, harborFilter, vesselTypeFilter) {
  return vessels.filter((vessel) => {
    const matchesHarbor = harborFilter === '전체 항포구' || vessel.port === harborFilter;
    const matchesType =
      vesselTypeFilter === '전체 선박' ||
      getVesselTypeFromBusiness(vessel.business) === vesselTypeFilter;

    return matchesHarbor && matchesType;
  });
}

function areManageShipCardsEqual(cardsA, cardsB) {
  if (cardsA.length !== cardsB.length) {
    return false;
  }

  return cardsA.every((card, index) => {
    const otherCard = cardsB[index];
    if (!otherCard) {
      return false;
    }

    return (
      card.id === otherCard.id &&
      card.title === otherCard.title &&
      card.registration === otherCard.registration &&
      card.port === otherCard.port &&
      card.business === otherCard.business &&
      card.tonnage === otherCard.tonnage &&
      (card.image ?? '') === (otherCard.image ?? '') &&
      Boolean(card.sonar) === Boolean(otherCard.sonar) &&
      Boolean(card.detector) === Boolean(otherCard.detector)
    );
  });
}

function StatusIcon({ name, className = '' }) {
  return (
    <span className={`material-symbols-rounded status-icon ${className}`.trim()} aria-hidden="true">
      {name}
    </span>
  );
}

function PlusIcon({ className = '' }) {
  return (
    <span className={`material-symbols-rounded ${className}`.trim()} aria-hidden="true">
      add
    </span>
  );
}

function DeleteIcon({ className = '' }) {
  return (
    <span className={`material-symbols-rounded ${className}`.trim()} aria-hidden="true">
      delete
    </span>
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

function VesselCard({ vessel, onImageClick }) {
  return (
    <article className="vessel-card">
      <button
        className="vessel-card__image-button"
        type="button"
        aria-label={`${vessel.name} 이미지 확대`}
        onClick={() => onImageClick(vessel)}
      >
        <img className="vessel-card__image" src={vessel.imageWide} alt="" />
      </button>

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

function CompactEquipment({ label, active }) {
  return (
    <div className={`compact-equipment__item ${active ? 'compact-equipment__item--active' : ''}`}>
      <div className={`compact-equipment__label ${active ? 'compact-equipment__label--active' : ''}`}>
        {label}
      </div>
      <StatusIcon name={active ? 'check' : 'close'} className="status-icon--compact" />
    </div>
  );
}

function CompactVesselCard({ vessel, onImageClick }) {
  return (
    <article className="compact-card">
      <div className="compact-card__summary">
        <div className="compact-card__title-group">
          <h2>{vessel.name}</h2>
          <p>{vessel.registration}</p>
        </div>
        <button
          className="compact-card__image-button"
          type="button"
          aria-label={`${vessel.name} 이미지 확대`}
          onClick={() => onImageClick(vessel)}
        >
          <img className="compact-card__image" src={vessel.imageCompact} alt="" />
        </button>
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

function VesselEmptyState() {
  return (
    <div className="vessel-empty-state">
      <img className="vessel-empty-state__icon" src={assets.emptySearch} alt="" />
      <p className="vessel-empty-state__text">조건에 맞는 선박을 찾지 못했어요.</p>
    </div>
  );
}

function ImageZoomModal({ vessel, onClose }) {
  const imageWrapRef = useRef(null);
  const imageRef = useRef(null);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const lastTapRef = useRef(null);
  const dismissOffsetRef = useRef(0);
  const transformRef = useRef({ scale: MIN_ZOOM_SCALE, x: 0, y: 0 });
  const [transform, setTransform] = useState(transformRef.current);
  const [dismissOffset, setDismissOffset] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const setViewport = (nextTransform) => {
    transformRef.current = nextTransform;
    setTransform(nextTransform);
  };

  const setDismiss = (nextOffset) => {
    dismissOffsetRef.current = nextOffset;
    setDismissOffset(nextOffset);
  };

  const getBounds = (scale) => {
    const wrapRect = imageWrapRef.current?.getBoundingClientRect();
    const imageNode = imageRef.current;

    if (!wrapRect || !imageNode) {
      return { maxX: 0, maxY: 0 };
    }

    const activeScale = Math.max(scale, MIN_ZOOM_SCALE);
    const imageWidth = imageNode.offsetWidth;
    const imageHeight = imageNode.offsetHeight;

    return {
      maxX: Math.max(0, ((imageWidth * activeScale) - wrapRect.width) / 2),
      maxY: Math.max(0, ((imageHeight * activeScale) - wrapRect.height) / 2),
    };
  };

  const commitTransform = (
    nextScale,
    nextX,
    nextY,
    { allowElastic = false, allowScaleElastic = false } = {},
  ) => {
    const minScale = allowScaleElastic ? GESTURE_MIN_ZOOM_SCALE : MIN_ZOOM_SCALE;
    const maxScale = allowScaleElastic ? GESTURE_MAX_ZOOM_SCALE : MAX_ZOOM_SCALE;
    const scale = clamp(nextScale, minScale, maxScale);

    if (scale <= MIN_ZOOM_SCALE) {
      const reset = { scale, x: 0, y: 0 };
      setViewport(reset);
      return reset;
    }

    const { maxX, maxY } = getBounds(scale);
    const nextTransform = {
      scale,
      x: allowElastic ? applyElasticity(nextX, maxX) : clamp(nextX, -maxX, maxX),
      y: allowElastic ? applyElasticity(nextY, maxY) : clamp(nextY, -maxY, maxY),
    };

    setViewport(nextTransform);
    return nextTransform;
  };

  const settleTransform = (nextTransform = transformRef.current) => {
    const finalScale = clamp(nextTransform.scale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    if (finalScale <= MIN_ZOOM_SCALE) {
      setViewport({ scale: MIN_ZOOM_SCALE, x: 0, y: 0 });
      return;
    }

    commitTransform(finalScale, nextTransform.x, nextTransform.y);
  };

  const zoomAtPoint = (targetScale, clientX, clientY) => {
    const wrapRect = imageWrapRef.current?.getBoundingClientRect();

    if (!wrapRect) {
      return;
    }

    if (targetScale <= MIN_ZOOM_SCALE) {
      setDismiss(0);
      setViewport({ scale: MIN_ZOOM_SCALE, x: 0, y: 0 });
      return;
    }

    const centerX = wrapRect.left + wrapRect.width / 2;
    const centerY = wrapRect.top + wrapRect.height / 2;
    const { scale, x, y } = transformRef.current;
    const localX = (clientX - centerX - x) / scale;
    const localY = (clientY - centerY - y) / scale;
    const nextX = clientX - centerX - targetScale * localX;
    const nextY = clientY - centerY - targetScale * localY;

    setDismiss(0);
    commitTransform(targetScale, nextX, nextY);
  };

  const beginSingleGesture = (pointer, mode = transformRef.current.scale > MIN_ZOOM_SCALE ? 'pan' : 'undecided') => {
    gestureRef.current = {
      type: 'single',
      mode,
      pointerId: pointer.pointerId,
      pointerType: pointer.pointerType,
      startX: pointer.clientX,
      startY: pointer.clientY,
      lastX: pointer.clientX,
      lastY: pointer.clientY,
      lastTime: performance.now(),
      velocityY: 0,
      startedAt: performance.now(),
      moved: false,
      startTranslate: {
        x: transformRef.current.x,
        y: transformRef.current.y,
      },
      startDismissOffset: dismissOffsetRef.current,
    };
    setIsInteracting(true);
  };

  const beginPinchGesture = () => {
    const activePointers = Array.from(pointersRef.current.values());
    const wrapRect = imageWrapRef.current?.getBoundingClientRect();

    if (activePointers.length < 2 || !wrapRect) {
      return;
    }

    const [firstPointer, secondPointer] = activePointers;
    const midpoint = getMidpoint(firstPointer, secondPointer);
    const centerX = wrapRect.left + wrapRect.width / 2;
    const centerY = wrapRect.top + wrapRect.height / 2;
    const { scale, x, y } = transformRef.current;

    setDismiss(0);
    gestureRef.current = {
      type: 'pinch',
      initialScale: scale,
      initialDistance: Math.max(getDistance(firstPointer, secondPointer), 1),
      localMidpoint: {
        x: (midpoint.clientX - centerX - x) / scale,
        y: (midpoint.clientY - centerY - y) / scale,
      },
    };
    setIsInteracting(true);
  };

  useEffect(() => {
    if (!vessel) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, vessel]);

  useEffect(() => {
    const reset = { scale: MIN_ZOOM_SCALE, x: 0, y: 0 };
    pointersRef.current.clear();
    gestureRef.current = null;
    lastTapRef.current = null;
    dismissOffsetRef.current = 0;
    setDismissOffset(0);
    setViewport(reset);
    setIsInteracting(false);
  }, [vessel]);

  if (!vessel) {
    return null;
  }

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType,
    });

    if (pointersRef.current.size >= 2) {
      lastTapRef.current = null;
      beginPinchGesture();
      return;
    }

    beginSingleGesture(event);
  };

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    pointersRef.current.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType,
    });

    const activePointers = Array.from(pointersRef.current.values());

    if (activePointers.length >= 2) {
      if (gestureRef.current?.type !== 'pinch') {
        beginPinchGesture();
      }

      const pinchGesture = gestureRef.current;
      const wrapRect = imageWrapRef.current?.getBoundingClientRect();

      if (!pinchGesture || pinchGesture.type !== 'pinch' || !wrapRect) {
        return;
      }

      const [firstPointer, secondPointer] = activePointers;
      const midpoint = getMidpoint(firstPointer, secondPointer);
      const centerX = wrapRect.left + wrapRect.width / 2;
      const centerY = wrapRect.top + wrapRect.height / 2;
      const nextScale =
        pinchGesture.initialScale * (getDistance(firstPointer, secondPointer) / pinchGesture.initialDistance);
      const nextX = midpoint.clientX - centerX - nextScale * pinchGesture.localMidpoint.x;
      const nextY = midpoint.clientY - centerY - nextScale * pinchGesture.localMidpoint.y;

      commitTransform(nextScale, nextX, nextY, {
        allowElastic: true,
        allowScaleElastic: true,
      });
      return;
    }

    const singleGesture = gestureRef.current;

    if (!singleGesture || singleGesture.type !== 'single' || singleGesture.pointerId !== event.pointerId) {
      return;
    }

    const now = performance.now();
    const deltaX = event.clientX - singleGesture.startX;
    const deltaY = event.clientY - singleGesture.startY;
    const movedDistance = Math.hypot(deltaX, deltaY);

    if (movedDistance > TAP_MOVE_TOLERANCE) {
      singleGesture.moved = true;
    }

    const deltaTime = Math.max(now - singleGesture.lastTime, 1);
    singleGesture.velocityY = (event.clientY - singleGesture.lastY) / deltaTime;
    singleGesture.lastX = event.clientX;
    singleGesture.lastY = event.clientY;
    singleGesture.lastTime = now;

    if (singleGesture.mode === 'undecided') {
      if (transformRef.current.scale > MIN_ZOOM_SCALE) {
        singleGesture.mode = 'pan';
      } else if (
        singleGesture.pointerType === 'touch' &&
        Math.abs(deltaY) > TAP_MOVE_TOLERANCE &&
        Math.abs(deltaY) > Math.abs(deltaX)
      ) {
        singleGesture.mode = 'dismiss';
      } else if (movedDistance > TAP_MOVE_TOLERANCE) {
        singleGesture.mode = 'ignore';
      }
    }

    if (singleGesture.mode === 'pan') {
      commitTransform(
        transformRef.current.scale,
        singleGesture.startTranslate.x + deltaX,
        singleGesture.startTranslate.y + deltaY,
        { allowElastic: true },
      );
      return;
    }

    if (singleGesture.mode === 'dismiss') {
      setDismiss(clamp(singleGesture.startDismissOffset + deltaY, -DISMISS_MAX_OFFSET, DISMISS_MAX_OFFSET));
    }
  };

  const finishPointerInteraction = (event, { cancelled = false } = {}) => {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const activePointerCount = pointersRef.current.size;
    const currentGesture = gestureRef.current;
    pointersRef.current.delete(event.pointerId);

    if (activePointerCount >= 2) {
      const remainingPointers = Array.from(pointersRef.current.values());

      if (remainingPointers.length >= 2) {
        beginPinchGesture();
        return;
      }

      if (remainingPointers.length === 1) {
        settleTransform();
        beginSingleGesture(
          remainingPointers[0],
          transformRef.current.scale > MIN_ZOOM_SCALE ? 'pan' : 'undecided',
        );
        return;
      }

      gestureRef.current = null;
      setIsInteracting(false);
      settleTransform();
      return;
    }

    gestureRef.current = null;
    setIsInteracting(false);

    if (cancelled) {
      lastTapRef.current = null;
      setDismiss(0);
      settleTransform();
      return;
    }

    if (
      !currentGesture ||
      currentGesture.type !== 'single' ||
      currentGesture.pointerId !== event.pointerId ||
      currentGesture.pointerType !== 'touch'
    ) {
      settleTransform();
      return;
    }

    if (currentGesture.mode === 'dismiss') {
      const shouldClose =
        Math.abs(dismissOffsetRef.current) >= DISMISS_CLOSE_DISTANCE ||
        Math.abs(currentGesture.velocityY) >= DISMISS_CLOSE_VELOCITY;

      if (shouldClose) {
        onClose();
        return;
      }

      setDismiss(0);
      setViewport({ scale: MIN_ZOOM_SCALE, x: 0, y: 0 });
      return;
    }

    settleTransform();

    const interactionDuration = performance.now() - currentGesture.startedAt;

    if (currentGesture.moved || interactionDuration > TAP_MAX_DURATION) {
      lastTapRef.current = null;
      return;
    }

    const previousTap = lastTapRef.current;
    const currentTap = { time: performance.now(), clientX: event.clientX, clientY: event.clientY };

    if (
      previousTap &&
      currentTap.time - previousTap.time <= DOUBLE_TAP_DELAY &&
      getDistance(previousTap, currentTap) <= TAP_MOVE_TOLERANCE * 2
    ) {
      lastTapRef.current = null;
      const targetScale =
        transformRef.current.scale > MIN_ZOOM_SCALE ? MIN_ZOOM_SCALE : DOUBLE_TAP_ZOOM_SCALE;
      zoomAtPoint(targetScale, event.clientX, event.clientY);
      return;
    }

    lastTapRef.current = currentTap;
  };

  const handleDoubleClick = (event) => {
    const targetScale = transformRef.current.scale > MIN_ZOOM_SCALE ? MIN_ZOOM_SCALE : DOUBLE_TAP_ZOOM_SCALE;
    zoomAtPoint(targetScale, event.clientX, event.clientY);
  };

  const dismissProgress = clamp(Math.abs(dismissOffset) / DISMISS_MAX_OFFSET, 0, 1);
  const backdropOpacity = transform.scale > MIN_ZOOM_SCALE ? 1 : 1 - dismissProgress * 0.7;
  const stageScale = transform.scale > MIN_ZOOM_SCALE ? 1 : 1 - dismissProgress * 0.08;
  const imageWrapClassName = [
    'zoom-modal__image-wrap',
    transform.scale > MIN_ZOOM_SCALE ? 'zoom-modal__image-wrap--zoomed' : '',
    isInteracting && transform.scale > MIN_ZOOM_SCALE ? 'zoom-modal__image-wrap--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="zoom-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${vessel.name} 이미지 확대`}
      style={{ backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }}
    >
      <button className="zoom-modal__backdrop" type="button" aria-label="확대 이미지 닫기" onClick={onClose} />
      <div className="zoom-modal__frame">
        <button
          className="zoom-modal__close"
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{ opacity: backdropOpacity }}
        >
          <img src={assets.zoomClose} alt="" />
        </button>

        <div
          ref={imageWrapRef}
          className={imageWrapClassName}
          onDoubleClick={handleDoubleClick}
          onPointerCancel={(event) => finishPointerInteraction(event, { cancelled: true })}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerInteraction}
        >
          <div
            className={`zoom-modal__image-stage ${isInteracting ? '' : 'zoom-modal__image-stage--settling'}`.trim()}
            style={{ transform: `translate3d(0, ${dismissOffset}px, 0) scale(${stageScale})` }}
          >
            <div
              className={`zoom-modal__image-pan ${isInteracting ? '' : 'zoom-modal__image-pan--settling'}`.trim()}
              style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }}
            >
              <img
                ref={imageRef}
                className={`zoom-modal__image ${isInteracting ? '' : 'zoom-modal__image--settling'}`.trim()}
                src={vessel.imageWide}
                alt={`${vessel.name} 선박 이미지`}
                draggable={false}
                style={{ transform: `scale(${transform.scale})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomTab({ activeTab = 'db', compact, onDbClick, onManageClick, onMenuClick }) {
  let db = compact ? assets.tabDbCompact : assets.tabDb;
  let manage = compact ? assets.tabManageCompact : assets.tabManage;
  let menu = compact ? assets.tabMenuCompact : assets.tabMenu;

  if (activeTab === 'menu') {
    db = assets.tabDbInactive;
    manage = assets.tabManageInactive;
    menu = assets.tabMenuActive;
  } else if (activeTab === 'manage') {
    db = assets.manageTabDb;
    manage = assets.manageTabActive;
    menu = assets.manageTabMenu;
  }

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
      <button
        className={`bottom-tab__item ${activeTab === 'manage' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onManageClick}
      >
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

function SearchScreen({
  compact,
  vessels,
  query,
  onBack,
  onClear,
  onImageClick,
  onManageOpen,
  onMenuOpen,
  onQueryChange,
  onToggleCompact,
}) {
  const lowered = query.trim().toLowerCase();
  const filtered = lowered
    ? vessels.filter((vessel) =>
        [vessel.name, vessel.registration, vessel.port, vessel.business].some((value) =>
          value.toLowerCase().includes(lowered),
        ),
      )
    : vessels;

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
          {filtered.length === 0 ? (
            <VesselEmptyState />
          ) : compact ? (
            filtered.map((vessel, index) => (
              <div key={vessel.id}>
                <CompactVesselCard vessel={vessel} onImageClick={onImageClick} />
                {index < filtered.length - 1 ? <div className="section-divider" /> : null}
              </div>
            ))
          ) : (
            filtered.map((vessel, index) => (
              <div key={vessel.id}>
                <VesselCard vessel={vessel} onImageClick={onImageClick} />
                {index < filtered.length - 1 ? <div className="section-divider" /> : null}
              </div>
            ))
          )}
        </div>

        <BottomTab activeTab="db" compact={compact} onDbClick={onBack} onManageClick={onManageOpen} onMenuClick={onMenuOpen} />
      </section>
    </main>
  );
}

function FilterScreen({
  compact,
  filterMode,
  harborFilter,
  harborOptions,
  vessels,
  onClose,
  onFilterModeChange,
  onHarborSelect,
  onImageClick,
  onManageOpen,
  onMenuOpen,
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
        !harborLabelRef.current ||
        !vesselTypeLabelRef.current
      ) {
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

  const filtered = filterVessels(vessels, harborFilter, vesselTypeFilter);

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
            {filtered.length === 0 ? (
              <VesselEmptyState />
          ) : compact ? (
            filtered.map((vessel, index) => (
              <div key={vessel.id}>
                  <CompactVesselCard vessel={vessel} onImageClick={onImageClick} />
                  {index < filtered.length - 1 ? <div className="section-divider" /> : null}
              </div>
            ))
          ) : (
            filtered.map((vessel, index) => (
              <div key={vessel.id}>
                  <VesselCard vessel={vessel} onImageClick={onImageClick} />
                  {index < filtered.length - 1 ? <div className="section-divider" /> : null}
              </div>
            ))
            )}
          </div>
        </div>

        <div className="filter-screen__overlay">
          <button className="filter-screen__backdrop" type="button" aria-label="필터 닫기" onClick={onClose} />
        </div>

        <div className="filter-screen__panel" ref={overlayRef}>
          <div className="filter-screen__columns">
            <div
              className="filter-screen__column"
              style={{ top: `${columnLayout.top}px`, left: `${columnLayout.harborLeft}px` }}
            >
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

            <div
              className="filter-screen__column"
              style={{ top: `${columnLayout.top}px`, left: `${columnLayout.vesselTypeLeft}px` }}
            >
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

        <BottomTab activeTab="db" compact={compact} onDbClick={onClose} onManageClick={onManageOpen} onMenuClick={onMenuOpen} />
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

function MenuScreen({ compact, colorMode, onColorModeOpen, onDbOpen, onInfoOpen, onLogout, onManageOpen }) {
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

        <BottomTab activeTab="menu" compact={compact} onDbClick={onDbOpen} onManageClick={onManageOpen} onMenuClick={undefined} />
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

function DataManagementHomeRow({ label, onClick, tone = 'default', value }) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`manage-home__row ${onClick ? 'manage-home__row--button' : ''}`}
    >
      <span className="manage-home__label">{label}</span>
      {value ? (
        <span className="manage-home__value-group">
          <span className={`manage-home__value ${tone === 'blue' ? 'manage-home__value--blue' : ''}`}>{value}</span>
          <img className="manage-home__chevron" src={assets.manageChevron} alt="" />
        </span>
      ) : null}
    </Tag>
  );
}

function DataManagementHomeScreen({
  importAlert,
  onDbOpen,
  onEditChooserOpen,
  onExport,
  onImportAlertDismiss,
  onImagesImport,
  onMenuOpen,
  onShipImport,
  rows,
}) {
  const shipInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const primaryRowActions = {
    '선박 DB (.csv)': () => shipInputRef.current?.click(),
    '이미지 압축 파일 (.zip)': () => imagesInputRef.current?.click(),
  };

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu phone-screen--manage-home">
        <h1 className="manage-screen__title">데이터 관리</h1>

        <div className="manage-home__content">
          <div className="manage-home__group">
            {rows.map((row) => (
              <DataManagementHomeRow
                key={row.label}
                label={row.label}
                onClick={primaryRowActions[row.label]}
                value={row.value}
                tone={row.tone}
              />
            ))}
          </div>

          <div className="section-divider" />

          <div className="manage-home__group">
            {manageHomeSecondaryRows.map((label) => (
              <DataManagementHomeRow
                key={label}
                label={label}
                onClick={label === '선박 DB 편집하기' ? onEditChooserOpen : onExport}
              />
            ))}
          </div>
        </div>

        <input
          ref={shipInputRef}
          hidden
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            onShipImport(event.target.files?.[0] ?? null);
            event.target.value = '';
          }}
        />
        <input
          ref={imagesInputRef}
          hidden
          type="file"
          accept=".zip,application/zip"
          onChange={(event) => {
            onImagesImport(event.target.files?.[0] ?? null);
            event.target.value = '';
          }}
        />

        <BottomTab activeTab="manage" compact={false} onDbClick={onDbOpen} onManageClick={undefined} onMenuClick={onMenuOpen} />

        {importAlert ? (
          <ManageAlertModal
            title={importAlert.title}
            copy={importAlert.copy}
            confirmLabel="확인"
            confirmTone="neutral"
            hideCancel
            onConfirm={onImportAlertDismiss}
          />
        ) : null}
      </section>
    </main>
  );
}

function ManageSubpageTopBar({ saveActive = false, saveLabel = '저장', title, onAdd, onBack, onSave }) {
  return (
    <>
      <header className="manage-subpage__top-bar">
        <button className="detail-back-button" type="button" aria-label="뒤로가기" onClick={onBack}>
          <img src={assets.manageBack} alt="" />
        </button>
        <div className="manage-subpage__actions">
          {onAdd ? (
            <button className="manage-subpage__add" type="button" aria-label="추가" onClick={onAdd}>
              <PlusIcon className="manage-subpage__add-icon" />
            </button>
          ) : null}
          <button
            className={`manage-subpage__save ${saveActive ? 'manage-subpage__save--active' : ''}`}
            type="button"
            disabled={!saveActive}
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </div>
      </header>
      <h1 className="manage-screen__title manage-screen__title--subpage">{title}</h1>
    </>
  );
}

function DataManagementEditMenuScreen({ onBack, onShipOpen }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage phone-screen--manage-subpage">
        <header className="manage-subpage__top-bar manage-subpage__top-bar--simple">
          <button className="detail-back-button" type="button" aria-label="뒤로가기" onClick={onBack}>
            <img src={assets.manageBack} alt="" />
          </button>
        </header>

        <h1 className="manage-screen__title manage-screen__title--subpage">선박 DB 편집하기</h1>

        <div className="manage-edit-menu">
          <button className="manage-edit-menu__row" type="button" onClick={onShipOpen}>
            선박 DB 편집하기
          </button>
        </div>
      </section>
    </main>
  );
}

function ManageSearchBar({ onChange, onClear, placeholder = '검색', value = '' }) {
  return (
    <div className="manage-search-bar">
      <img className="manage-search-bar__icon" src={assets.manageSearch} alt="" />
      <input
        className={`manage-search-bar__input ${value ? 'manage-search-bar__input--filled' : ''}`}
        type="text"
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button className="manage-search-bar__cancel-button" type="button" aria-label="검색 지우기" onClick={onClear}>
          <img className="manage-search-bar__cancel" src={assets.manageCancel} alt="" />
        </button>
      ) : null}
    </div>
  );
}

function ManageFieldPill({ children, withArrow = false }) {
  return (
    <span className="manage-field-pill">
      <span>{children}</span>
      {withArrow ? <img className="manage-field-pill__arrow" src={assets.manageDropdown} alt="" /> : null}
    </span>
  );
}

function ManageFieldInput({ edited = false, onChange, readOnly = false, value }) {
  return (
    <label className={`manage-field-pill ${edited ? 'manage-field-pill--edited' : ''}`}>
      <input
        className="manage-field-pill__input"
        type="text"
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : 0}
        spellCheck={false}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function ManageTextBox({
  active = false,
  edited = false,
  fullWidth = false,
  onChange,
  readOnly = false,
  value,
  variant = 'title',
}) {
  return (
    <label
      className={[
        'manage-textbox',
        `manage-textbox--${variant}`,
        active ? 'manage-textbox--active' : '',
        edited ? 'manage-textbox--edited' : '',
        fullWidth ? 'manage-textbox--full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        className="manage-textbox__input"
        type="text"
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : 0}
        spellCheck={false}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function ManageShipCard({
  card,
  editable = false,
  originalCard,
  showDeleteButton = false,
  showEditButton = false,
  onDelete,
  onEditActivate,
  onFieldChange,
  onImageChange,
}) {
  const imageInputRef = useRef(null);
  const baselineCard = originalCard ?? emptyManageShipCard;
  const titleEdited = editable ? card.title !== baselineCard.title : false;
  const registrationEdited = editable ? card.registration !== baselineCard.registration : false;
  const portEdited = editable ? card.port !== baselineCard.port : false;
  const businessEdited = editable ? card.business !== baselineCard.business : false;
  const tonnageEdited = editable ? card.tonnage !== baselineCard.tonnage : false;
  const sonarEdited = editable ? Boolean(card.sonar) !== Boolean(baselineCard.sonar) : false;
  const detectorEdited = editable ? Boolean(card.detector) !== Boolean(baselineCard.detector) : false;
  const imageSource = card.image ?? assets.manageImage;

  const handleImageInputChange = (event) => {
    const [file] = event.target.files ?? [];
    if (file) {
      onImageChange?.(file);
    }
    event.target.value = '';
  };

  return (
    <article className={`manage-ship-card ${card.selected ? 'manage-ship-card--selected' : ''}`}>
      <div className="manage-ship-card__hero">
        <div className="manage-ship-card__identity">
          <ManageTextBox
            edited={titleEdited}
            onChange={(nextValue) => onFieldChange?.('title', nextValue)}
            readOnly={!editable}
            value={card.title}
            variant="title"
          />
          <ManageTextBox
            active={card.selected}
            edited={registrationEdited}
            onChange={(nextValue) => onFieldChange?.('registration', nextValue)}
            readOnly={!editable}
            value={card.registration}
            variant="subtitle"
          />
        </div>
        {editable ? (
          <>
            <button
              className="manage-ship-card__image-button"
              type="button"
              aria-label="선박 이미지 선택"
              onClick={() => imageInputRef.current?.click()}
            >
              <img className="manage-ship-card__image" src={imageSource} alt="" />
            </button>
            <input
              ref={imageInputRef}
              className="manage-ship-card__image-input"
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
            />
          </>
        ) : (
          <img className="manage-ship-card__image" src={imageSource} alt="" />
        )}
        {showEditButton ? (
          <button className="manage-ship-card__edit-button" type="button" aria-label="선박 정보 수정" onClick={onEditActivate}>
            <img src={assets.manageEdit} alt="" />
          </button>
        ) : null}
      </div>

      <div className="manage-ship-card__details">
        <div className="manage-ship-card__row">
          <span className="manage-ship-card__label">항포구</span>
          <ManageFieldInput
            edited={portEdited}
            onChange={(nextValue) => onFieldChange?.('port', nextValue)}
            readOnly={!editable}
            value={card.port}
          />
        </div>
        <div className="manage-ship-card__row">
          <span className="manage-ship-card__label">업종</span>
          <ManageFieldInput
            edited={businessEdited}
            onChange={(nextValue) => onFieldChange?.('business', nextValue)}
            readOnly={!editable}
            value={card.business}
          />
        </div>
        <div className="manage-ship-card__row">
          <span className="manage-ship-card__label">총톤수</span>
          <ManageFieldInput
            edited={tonnageEdited}
            onChange={(nextValue) => onFieldChange?.('tonnage', nextValue)}
            readOnly={!editable}
            value={card.tonnage}
          />
        </div>
      </div>

      <div className="manage-ship-card__rule" />

      <div className="manage-ship-card__equipment">
        <button
          className={`manage-ship-card__equipment-item ${
            sonarEdited
              ? 'manage-ship-card__equipment-item--blue'
              : card.sonar
                ? 'manage-ship-card__equipment-item--violet'
                : 'manage-ship-card__equipment-item--muted'
          }`}
          type="button"
          aria-label={`소나 ${card.sonar ? '켜짐' : '꺼짐'}`}
          aria-pressed={card.sonar}
          onClick={() => onFieldChange?.('sonar', !card.sonar)}
        >
          <span className="manage-ship-card__equipment-label">소나</span>
          <StatusIcon name={card.sonar ? 'check' : 'close'} className="status-icon--manage" />
        </button>
        <button
          className={`manage-ship-card__equipment-item ${
            detectorEdited
              ? 'manage-ship-card__equipment-item--blue'
              : card.detector
                ? 'manage-ship-card__equipment-item--violet'
                : 'manage-ship-card__equipment-item--muted'
          }`}
          type="button"
          aria-label={`어군 탐지기 ${card.detector ? '켜짐' : '꺼짐'}`}
          aria-pressed={card.detector}
          onClick={() => onFieldChange?.('detector', !card.detector)}
        >
          <span className="manage-ship-card__equipment-label">어군 탐지기</span>
          <StatusIcon name={card.detector ? 'check' : 'close'} className="status-icon--manage" />
        </button>
      </div>

      {showDeleteButton ? (
        <button className="manage-ship-card__delete" type="button" aria-label="선박 삭제" onClick={onDelete}>
          <DeleteIcon className="manage-ship-card__delete-icon" />
        </button>
      ) : null}
    </article>
  );
}

function ManageAlertModal({
  cancelLabel = '아니요',
  confirmLabel = '네',
  confirmTone = 'danger',
  copy = '저장되지 않은 사항은 모두 삭제돼요.\n진행하시겠어요?',
  hideCancel = false,
  onCancel,
  onConfirm,
  title = '경고 사항',
}) {
  const confirmButtonClassName = [
    'manage-discard-modal__button',
    confirmTone === 'danger' ? 'manage-discard-modal__button--danger' : 'manage-discard-modal__button--neutral',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="manage-discard-modal">
      <div className="manage-discard-modal__scrim" />
      <div className="manage-discard-modal__card">
        <h2 className="manage-discard-modal__title">{title}</h2>
        <p className="manage-discard-modal__copy">{copy}</p>
        <div className="manage-discard-modal__actions">
          {!hideCancel ? (
            <button className="manage-discard-modal__button manage-discard-modal__button--ghost" type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          <button className={confirmButtonClassName} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageSavedToast({ message }) {
  return (
    <div className="manage-saved-toast" role="status" aria-live="polite">
      <StatusIcon name="check_circle" className="manage-saved-toast__icon" />
      <span className="manage-saved-toast__message">{message}</span>
    </div>
  );
}

function DataManagementShipEditScreen({
  cards,
  dirty,
  originalCards,
  onAdd,
  onBack,
  onConfirmDiscard,
  onDelete,
  onDismissDiscard,
  onFieldChange,
  onImageChange,
  onSave,
  onSearchChange,
  onSearchClear,
  searchQuery,
  showDiscardModal,
  toast,
}) {
  const loweredQuery = searchQuery.trim().toLowerCase();
  const visibleCards = loweredQuery
    ? cards.filter((card) =>
        [card.searchKey, card.title, card.registration, card.port, card.business].some((value) =>
          value.toLowerCase().includes(loweredQuery),
        ),
      )
    : cards;

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--manage-edit">
        <ManageSubpageTopBar title="선박 DB 편집하기" saveActive={dirty} onAdd={onAdd} onBack={onBack} onSave={dirty ? onSave : undefined} />

        <div className="manage-edit-screen__content">
          {visibleCards.map((card, index) => (
            <div key={`${card.id}-${index}`}>
              <div className="manage-edit-screen__section">
                <ManageShipCard
                  card={card}
                  editable
                  originalCard={originalCards.find((item) => item.id === card.id)}
                  showDeleteButton
                  showEditButton={false}
                  onDelete={() => onDelete(card.id)}
                  onFieldChange={(field, value) => onFieldChange(card.id, field, value)}
                  onImageChange={(file) => onImageChange(card.id, file)}
                />
              </div>
              {index < visibleCards.length - 1 ? <div className="section-divider" /> : null}
            </div>
          ))}
        </div>

        <ManageSearchBar value={searchQuery} onChange={onSearchChange} onClear={onSearchClear} />

        {toast ? <ManageSavedToast key={toast.id} message={toast.message} /> : null}
        {showDiscardModal ? <ManageAlertModal onCancel={onDismissDiscard} onConfirm={onConfirmDiscard} /> : null}
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
  const [databaseState, setDatabaseState] = useState(() => createEmptyDatabaseState());
  const [databaseReady, setDatabaseReady] = useState(false);
  const [manageShipCardsState, setManageShipCardsState] = useState([]);
  const [manageShipSavedState, setManageShipSavedState] = useState([]);
  const [manageShipDirty, setManageShipDirty] = useState(false);
  const [manageShipSearch, setManageShipSearch] = useState('');
  const [manageDiscardTarget, setManageDiscardTarget] = useState(null);
  const [manageImportAlert, setManageImportAlert] = useState(null);
  const [manageSaveToast, setManageSaveToast] = useState(null);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomedVessel, setZoomedVessel] = useState(null);
  const [harborFilter, setHarborFilter] = useState('전체 항포구');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('전체 선박');
  const [filterMode, setFilterMode] = useState('harbor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const mainContentRef = useRef(null);
  const manageSaveToastTimeoutRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const mainScrollPositionRef = useRef(0);
  const displayVessels = buildDisplayVessels(databaseState.shipRecords);
  const filteredDisplayVessels = filterVessels(displayVessels, harborFilter, vesselTypeFilter);
  const harborOptions = buildHarborOptions(databaseState.shipRecords);
  const manageHomePrimaryRows = buildManageHomeRows(databaseState.files);

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

  useEffect(
    () => () => {
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
    hideManageSaveToast();
    setScreen('manageHome');
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

    try {
      const { fileName, shipRecords } = await importShipCsvFile(file, databaseState.imageEntries);
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
    } catch (error) {
      showImportAlert(error, '선박 DB를 불러오지 못했어요.\n파일 형식을 확인해 주세요.');
    }
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

  const openImageZoom = (vessel) => {
    setZoomedVessel(vessel);
  };

  const enterMainScreen = () => {
    if (!databaseReady) {
      return;
    }

    mainScrollPositionRef.current = 0;
    lastScrollTopRef.current = 0;
    setTopBarHidden(false);
    setScreen('main');
  };

  return (
    <div className="screen-stack">
      <PersistedScreen active={screen === 'login'}>
        <main className="app-shell app-shell--login">
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
              disabled={!isFilled || !databaseReady}
              onClick={enterMainScreen}
            >
              {databaseReady ? '로그인' : '기본 데이터 불러오는 중...'}
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
              {filteredDisplayVessels.length === 0 ? (
                <VesselEmptyState />
              ) : compact ? (
                filteredDisplayVessels.map((vessel, index) => (
                  <div key={vessel.id}>
                    <CompactVesselCard vessel={vessel} onImageClick={openImageZoom} />
                    {index < filteredDisplayVessels.length - 1 ? <div className="section-divider" /> : null}
                  </div>
                ))
              ) : (
                filteredDisplayVessels.map((vessel, index) => (
                  <div key={vessel.id}>
                    <VesselCard vessel={vessel} onImageClick={openImageZoom} />
                    {index < filteredDisplayVessels.length - 1 ? <div className="section-divider" /> : null}
                  </div>
                ))
              )}
            </div>

            <BottomTab activeTab="db" compact={compact} onDbClick={undefined} onManageClick={openManage} onMenuClick={openMenu} />
          </section>
        </main>
      </PersistedScreen>

      <PersistedScreen active={screen === 'manageHome'}>
        <DataManagementHomeScreen
          importAlert={manageImportAlert}
          onDbOpen={() => setScreen('main')}
          onEditChooserOpen={() => setScreen('manageEditMenu')}
          onExport={handleExportDatabase}
          onImportAlertDismiss={() => setManageImportAlert(null)}
          onImagesImport={handleImagesImport}
          onMenuOpen={openMenu}
          onShipImport={handleShipImport}
          rows={manageHomePrimaryRows}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'manageEditMenu'}>
        <DataManagementEditMenuScreen
          onBack={() => setScreen('manageHome')}
          onShipOpen={() => setScreen('manageShipEdit')}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'manageShipEdit'}>
        <DataManagementShipEditScreen
          cards={manageShipCardsState}
          dirty={manageShipDirty}
          originalCards={manageShipSavedState}
          onAdd={handleManageShipAdd}
          onBack={() => {
            if (manageShipDirty) {
              setManageDiscardTarget('ship');
              return;
            }

            setScreen('manageEditMenu');
          }}
          onConfirmDiscard={() => {
            setManageDiscardTarget(null);
            restoreManageShipSaved();
            setScreen('manageEditMenu');
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
      </PersistedScreen>

      <PersistedScreen active={screen === 'search'}>
        <SearchScreen
          compact={compact}
          vessels={displayVessels}
          query={searchQuery}
          onBack={() => setScreen('main')}
          onClear={() => setSearchQuery('')}
          onImageClick={openImageZoom}
          onManageOpen={openManage}
          onMenuOpen={openMenu}
          onQueryChange={setSearchQuery}
          onToggleCompact={setCompact}
        />
      </PersistedScreen>

      <PersistedScreen active={screen === 'filter'}>
        <FilterScreen
          compact={compact}
          filterMode={filterMode}
          harborFilter={harborFilter}
          harborOptions={harborOptions}
          vessels={displayVessels}
          onClose={() => setScreen('main')}
          onFilterModeChange={setFilterMode}
          onHarborSelect={setHarborFilter}
          onImageClick={openImageZoom}
          onManageOpen={openManage}
          onMenuOpen={openMenu}
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
          onManageOpen={openManage}
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

      <ImageZoomModal vessel={zoomedVessel} onClose={() => setZoomedVessel(null)} />
    </div>
  );
}

export default App;
