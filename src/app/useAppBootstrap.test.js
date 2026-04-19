import { describe, expect, it, vi } from 'vitest';

import { resolveInitialDatabaseState } from './useAppBootstrap.js';

describe('resolveInitialDatabaseState', () => {
  it('returns upgraded stored state without loading bundled data', async () => {
    const storedState = { shipRecords: [{ id: 'stored' }] };
    const upgradedState = { shipRecords: [{ id: 'upgraded' }] };
    const loadStoredState = vi.fn().mockResolvedValue(storedState);
    const upgradeState = vi.fn().mockReturnValue(upgradedState);
    const loadBundledState = vi.fn();

    await expect(
      resolveInitialDatabaseState({
        loadStoredState,
        upgradeState,
        loadBundledState,
      }),
    ).resolves.toBe(upgradedState);

    expect(loadStoredState).toHaveBeenCalledTimes(1);
    expect(upgradeState).toHaveBeenCalledWith(storedState);
    expect(loadBundledState).not.toHaveBeenCalled();
  });

  it('loads bundled data when there is no stored state', async () => {
    const bundledState = { shipRecords: [{ id: 'bundled' }] };
    const loadBundledState = vi.fn().mockResolvedValue(bundledState);

    await expect(
      resolveInitialDatabaseState({
        loadStoredState: vi.fn().mockResolvedValue(null),
        loadBundledState,
      }),
    ).resolves.toBe(bundledState);

    expect(loadBundledState).toHaveBeenCalledTimes(1);
  });

  it('falls back to empty state when both stored and bundled loads fail', async () => {
    const emptyState = { shipRecords: [], imageEntries: [] };
    const loadBundledState = vi.fn().mockRejectedValue(new Error('bundled failed'));

    await expect(
      resolveInitialDatabaseState({
        createEmptyState: vi.fn().mockReturnValue(emptyState),
        loadBundledState,
        loadStoredState: vi.fn().mockRejectedValue(new Error('stored failed')),
      }),
    ).resolves.toBe(emptyState);

    expect(loadBundledState).toHaveBeenCalledTimes(1);
  });
});
