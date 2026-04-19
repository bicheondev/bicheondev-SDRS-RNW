import { useMemo } from 'react';

import BottomTab from './BottomTab.jsx';
import { applySearchQuery } from '../features/database/useVesselSearch.js';
import { SearchTopBar } from '../features/database/DatabaseTopBars.jsx';
import { VesselResults } from '../features/database/VesselResults.jsx';

export { FilterScreen } from '../features/database/FilterSheet.jsx';
export { SearchTopBar, TopBar } from '../features/database/DatabaseTopBars.jsx';
export { VesselResults } from '../features/database/VesselResults.jsx';

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

        <VesselResults
          className="main-content main-content--search"
          compact={compact}
          vessels={searchedVessels}
          onImageClick={onImageClick}
        />

        <BottomTab
          activeTab="db"
          compact={compact}
          onDbClick={onBack}
          onManageClick={onManageOpen}
          onMenuClick={onMenuOpen}
        />
      </section>
    </main>
  );
}
