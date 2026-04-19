import { motion } from 'framer-motion';
import { forwardRef, memo, useCallback } from 'react';

import { getPressMotion } from '../../motion.js';
import { AppIcon } from '../../components/Icons.jsx';

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
          <AppIcon
            className="status-icon status-icon--equipment-small"
            name={vessel.sonar ? 'check' : 'close'}
            preset="statusSmall"
            tone="violet"
          />
        </div>
      </div>
      <div className="equipment-table__row">
        <div className="equipment-table__cell equipment-table__cell--label">어군 탐지기</div>
        <div
          className={`equipment-table__cell equipment-table__cell--icon ${
            vessel.detector ? 'equipment-table__cell--icon-active' : ''
          }`}
        >
          <AppIcon
            className="status-icon status-icon--equipment-small"
            name={vessel.detector ? 'check' : 'close'}
            preset="statusSmall"
            tone="violet"
          />
        </div>
      </div>
    </div>
  );
}

export const VesselCard = memo(function VesselCard({ vessel, onImageClick }) {
  return (
    <article className="vessel-card">
      <motion.button
        className="vessel-card__image-button pressable-control pressable-control--media"
        type="button"
        data-vessel-thumb-id={vessel.id}
        aria-label={`${vessel.name} 이미지 확대`}
        onClick={(event) => onImageClick(vessel, event.currentTarget)}
        {...getPressMotion('card')}
      >
        <img
          className="vessel-card__image"
          src={vessel.imageWide}
          alt=""
          loading="lazy"
          decoding="async"
        />
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
});

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
      <div
        className={`compact-equipment__label ${active ? 'compact-equipment__label--active' : ''}`}
      >
        {label}
      </div>
      <AppIcon
        className="status-icon status-icon--compact"
        name={active ? 'check' : 'close'}
        preset="statusCompact"
        tone={active ? 'violet' : 'violet-muted'}
      />
    </div>
  );
}

export const CompactVesselCard = memo(function CompactVesselCard({ vessel, onImageClick }) {
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
          onClick={(event) => onImageClick(vessel, event.currentTarget)}
          {...getPressMotion('card')}
        >
          <img
            className="compact-card__image"
            src={vessel.imageCompact}
            alt=""
            loading="lazy"
            decoding="async"
          />
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
});

export function VesselEmptyState() {
  return (
    <div className="vessel-empty-state">
      <AppIcon
        className="vessel-empty-state__icon"
        name="sticky_note_2"
        preset="emptyState"
        tone="muted"
      />
      <p className="vessel-empty-state__text">조건에 맞는 선박을 찾지 못했어요.</p>
    </div>
  );
}

export const VesselResults = forwardRef(function VesselResults(
  { className = 'main-content', compact, vessels, onImageClick, ...contentProps },
  ref,
) {
  const handleImageClick = useCallback(
    (selectedVessel, sourceThumbnail) => {
      onImageClick(selectedVessel, vessels, sourceThumbnail);
    },
    [onImageClick, vessels],
  );

  return (
    <div className={className} ref={ref} {...contentProps}>
      <div className="vessel-results-mode">
        {vessels.length === 0 ? (
          <VesselEmptyState />
        ) : compact ? (
          vessels.map((vessel, index) => (
            <div key={vessel.id}>
              <CompactVesselCard vessel={vessel} onImageClick={handleImageClick} />
              {index < vessels.length - 1 ? <div className="section-divider" /> : null}
            </div>
          ))
        ) : (
          vessels.map((vessel, index) => (
            <div key={vessel.id}>
              <VesselCard vessel={vessel} onImageClick={handleImageClick} />
              {index < vessels.length - 1 ? <div className="section-divider" /> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
