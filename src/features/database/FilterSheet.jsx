import { motion, usePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { filterVessels } from '../../domain/ships.js';
import {
  getPressMotion,
  getSheetOverlayMotion,
  getSheetPanelMotion,
  motionDurationsMs,
} from '../../motion.js';
import BottomTab from '../../components/layout/BottomTab.jsx';
import { applySearchQuery } from './useVesselSearch.js';
import { TopBar } from './DatabaseTopBars.jsx';
import { VesselResults } from './VesselResults.jsx';

const FILTER_COLUMN_TOP = 122;
const FILTER_COLUMN_EDGE = 18;
const FILTER_BUTTON_GAP = 24;
const FILTER_DISCLOSURE_WIDTH = 24;

function measureElementNaturalWidth(node) {
  if (!(node instanceof HTMLElement) || typeof document === 'undefined') {
    return 0;
  }

  const computedStyle = window.getComputedStyle(node);
  const clone = node.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.display = 'inline-block';
  clone.style.width = 'auto';
  clone.style.minWidth = '0';
  clone.style.maxWidth = 'none';
  clone.style.visibility = 'hidden';
  clone.style.pointerEvents = 'none';
  clone.style.transform = 'none';
  clone.style.font = computedStyle.font;
  clone.style.fontKerning = computedStyle.fontKerning;
  clone.style.fontSize = computedStyle.fontSize;
  clone.style.fontStretch = computedStyle.fontStretch;
  clone.style.fontStyle = computedStyle.fontStyle;
  clone.style.fontVariant = computedStyle.fontVariant;
  clone.style.fontWeight = computedStyle.fontWeight;
  clone.style.letterSpacing = computedStyle.letterSpacing;
  clone.style.lineHeight = computedStyle.lineHeight;
  clone.style.textTransform = computedStyle.textTransform;
  clone.style.whiteSpace = computedStyle.whiteSpace;
  document.body.appendChild(clone);

  const width = clone.getBoundingClientRect().width;
  clone.remove();
  return width;
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
  const [isPresent, safeToRemove] = usePresence();
  const reducedMotion = useReducedMotion() ?? false;
  const overlayRef = useRef(null);
  const harborButtonRef = useRef(null);
  const harborLabelRef = useRef(null);
  const vesselTypeButtonRef = useRef(null);
  const vesselTypeLabelRef = useRef(null);
  const harborOptionRefs = useRef([]);
  const vesselTypeOptionRefs = useRef([]);
  const labelWidthAnimationFrameRef = useRef(null);
  const [harborLabelWidth, setHarborLabelWidth] = useState(0);
  const [vesselTypeLabelWidth, setVesselTypeLabelWidth] = useState(0);
  const [columnLayout, setColumnLayout] = useState({
    top: FILTER_COLUMN_TOP,
    harborLeft: FILTER_COLUMN_EDGE,
    vesselTypeLeft: FILTER_COLUMN_EDGE,
  });
  const filterSheetCloseDuration = reducedMotion
    ? motionDurationsMs.instant
    : motionDurationsMs.normal;

  useEffect(() => {
    if (isPresent || typeof window === 'undefined') {
      return undefined;
    }

    const timeoutId = window.setTimeout(safeToRemove, filterSheetCloseDuration);
    return () => window.clearTimeout(timeoutId);
  }, [filterSheetCloseDuration, isPresent, safeToRemove]);

  useLayoutEffect(() => {
    const measureWidths = () => {
      const nextHarborOptionWidth = Math.max(
        0,
        ...harborOptionRefs.current.map((node) => node?.getBoundingClientRect().width ?? 0),
      );
      const nextVesselTypeOptionWidth = Math.max(
        0,
        ...vesselTypeOptionRefs.current.map((node) => node?.getBoundingClientRect().width ?? 0),
      );
      const nextHarborLabelWidth = measureElementNaturalWidth(harborLabelRef.current);
      const nextVesselTypeLabelWidth = measureElementNaturalWidth(vesselTypeLabelRef.current);
      const nextHarborWidth = isPresent
        ? Math.max(nextHarborLabelWidth, nextHarborOptionWidth)
        : nextHarborLabelWidth;
      const nextVesselTypeWidth = Math.max(
        nextVesselTypeLabelWidth,
        isPresent ? nextVesselTypeOptionWidth : 0,
      );

      if (labelWidthAnimationFrameRef.current) {
        window.cancelAnimationFrame(labelWidthAnimationFrameRef.current);
        labelWidthAnimationFrameRef.current = null;
      }

      if (reducedMotion || !isPresent) {
        setHarborLabelWidth(nextHarborWidth);
        setVesselTypeLabelWidth(nextVesselTypeWidth);
        return;
      }

      setHarborLabelWidth(nextHarborLabelWidth);
      setVesselTypeLabelWidth(nextVesselTypeLabelWidth);
      labelWidthAnimationFrameRef.current = window.requestAnimationFrame(() => {
        labelWidthAnimationFrameRef.current = null;
        setHarborLabelWidth(nextHarborWidth);
        setVesselTypeLabelWidth(nextVesselTypeWidth);
      });
    };

    measureWidths();
    window.addEventListener('resize', measureWidths);

    return () => {
      window.removeEventListener('resize', measureWidths);
      if (labelWidthAnimationFrameRef.current) {
        window.cancelAnimationFrame(labelWidthAnimationFrameRef.current);
        labelWidthAnimationFrameRef.current = null;
      }
    };
  }, [harborFilter, harborOptions, isPresent, reducedMotion, vesselTypeFilter, vesselTypeOptions]);

  useLayoutEffect(() => {
    const updateColumnLayout = () => {
      if (!overlayRef.current || !harborButtonRef.current) {
        return;
      }

      const overlayRect = overlayRef.current.getBoundingClientRect();
      const harborButtonRect = harborButtonRef.current.getBoundingClientRect();
      const disclosureWidth =
        harborButtonRef.current
          .querySelector('.filter-button__icon')
          ?.getBoundingClientRect().width ?? FILTER_DISCLOSURE_WIDTH;
      const harborLeft = Math.max(FILTER_COLUMN_EDGE, harborButtonRect.left - overlayRect.left);

      setColumnLayout({
        top: FILTER_COLUMN_TOP,
        harborLeft,
        vesselTypeLeft:
          harborLeft + harborLabelWidth + disclosureWidth + FILTER_BUTTON_GAP,
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
  const layerMotion = getSheetOverlayMotion(reducedMotion);
  const panelMotion = getSheetPanelMotion(reducedMotion);
  const visualFilterMode = isPresent ? filterMode : 'closed';

  return (
    <motion.main className="app-shell filter-screen-layer" {...layerMotion}>
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
          openState={visualFilterMode}
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
          <VesselResults
            className="main-content main-content--filter"
            compact={compact}
            vessels={filteredVessels}
            onImageClick={onImageClick}
          />
        </div>

        <div className="filter-screen__overlay">
          <button
            className="filter-screen__backdrop interaction-reset"
            type="button"
            aria-label="필터 닫기"
            onClick={onClose}
          />
        </div>

        <motion.div className="filter-screen__panel" ref={overlayRef} {...panelMotion}>
          <div className="filter-screen__columns">
            <div
              className="filter-screen__column"
              style={{ top: `${columnLayout.top}px`, left: `${columnLayout.harborLeft}px` }}
            >
              {harborOptions.map((option, index) => (
                <motion.button
                  key={option}
                  className={`filter-screen__option pressable-control pressable-control--option ${
                    harborFilter === option ? 'filter-screen__option--active' : ''
                  }`}
                  ref={(node) => {
                    harborOptionRefs.current[index] = node;
                  }}
                  type="button"
                  onClick={() => {
                    onHarborSelect(option);
                    onClose();
                  }}
                  {...getPressMotion('row')}
                >
                  <span className="filter-screen__option-label filter-button__label">
                    {option}
                  </span>
                </motion.button>
              ))}
            </div>

            <div
              className="filter-screen__column"
              style={{ top: `${columnLayout.top}px`, left: `${columnLayout.vesselTypeLeft}px` }}
            >
              {vesselTypeOptions.map((option, index) => (
                <motion.button
                  key={option}
                  className={`filter-screen__option pressable-control pressable-control--option ${
                    vesselTypeFilter === option ? 'filter-screen__option--active' : ''
                  }`}
                  ref={(node) => {
                    vesselTypeOptionRefs.current[index] = node;
                  }}
                  type="button"
                  onClick={() => {
                    onVesselTypeSelect(option);
                    onClose();
                  }}
                  {...getPressMotion('row')}
                >
                  <span className="filter-screen__option-label filter-button__label">
                    {option}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <BottomTab
          activeTab="db"
          compact={compact}
          onDbClick={onClose}
          onManageClick={onManageOpen}
          onMenuClick={onMenuOpen}
        />
      </section>
    </motion.main>
  );
}
