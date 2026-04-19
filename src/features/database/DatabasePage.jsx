import { AnimatePresence } from 'framer-motion';

import { vesselTypeOptions } from '../../assets/assets.js';
import { FilterScreen } from './FilterSheet.jsx';
import { SearchTopBar, TopBar } from './DatabaseTopBars.jsx';
import { VesselResults } from './VesselResults.jsx';

export function DatabasePage({
  compact,
  databaseView,
  displayVessels,
  filterSheet,
  filteredDisplayVessels,
  harborFilter,
  harborOptions,
  mainContentRef,
  onFilterClose,
  onFilterHarborSelect,
  onFilterOpen,
  onFilterSearchOpen,
  onFilterVesselTypeSelect,
  onImageClick,
  onMainScroll,
  onManageOpen,
  onMenuOpen,
  onSearchClear,
  onSearchClose,
  onSearchOpen,
  onSearchQueryChange,
  onToggleCompact,
  searchedDisplayVessels,
  searchQuery,
  topBarHidden,
  vesselTypeFilter,
}) {
  return (
    <main className="app-shell">
      <section
        className={`phone-screen ${databaseView === 'search' ? 'phone-screen--search' : 'phone-screen--main'}`}
      >
        {databaseView === 'search' ? (
          <SearchTopBar
            compact={compact}
            harborFilter={harborFilter}
            query={searchQuery}
            vesselTypeFilter={vesselTypeFilter}
            onBack={onSearchClose}
            onClear={onSearchClear}
            onHarborFilterOpen={() => onFilterOpen('harbor')}
            onQueryChange={onSearchQueryChange}
            onToggleCompact={onToggleCompact}
            onVesselTypeFilterOpen={() => onFilterOpen('vesselType')}
          />
        ) : (
          <TopBar
            compact={compact}
            harborFilter={harborFilter}
            harborLabelWidth={0}
            hidden={topBarHidden}
            onHarborFilterOpen={() => onFilterOpen('harbor')}
            onSearchOpen={onSearchOpen}
            onToggleCompact={onToggleCompact}
            onVesselTypeFilterOpen={() => onFilterOpen('vesselType')}
            vesselTypeLabelWidth={0}
            vesselTypeFilter={vesselTypeFilter}
          />
        )}

        <VesselResults
          className={`main-content ${databaseView === 'search' ? 'main-content--search' : ''}`.trim()}
          compact={compact}
          onImageClick={onImageClick}
          onScroll={databaseView === 'browse' ? onMainScroll : undefined}
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
            onClose={onFilterClose}
            onHarborSelect={onFilterHarborSelect}
            onImageClick={onImageClick}
            onManageOpen={onManageOpen}
            onMenuOpen={onMenuOpen}
            onSearchOpen={onFilterSearchOpen}
            onToggleCompact={onToggleCompact}
            onVesselTypeSelect={onFilterVesselTypeSelect}
            vesselTypeOptions={vesselTypeOptions}
            vesselTypeFilter={vesselTypeFilter}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
