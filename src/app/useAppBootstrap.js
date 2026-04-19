import { useEffect, useState } from 'react';

import { createEmptyDatabaseState, upgradeDatabaseState } from '../domain/databaseState.js';
import { applyImagesToShipRecords } from '../domain/ships.js';
import { loadStoredDatabaseState, saveStoredDatabaseState } from '../services/indexedDbStore.js';

async function loadBundledDatabaseStateOnDemand() {
  const { loadBundledDatabaseState } = await import('../domain/importExport/bundledData.js');
  return loadBundledDatabaseState();
}

async function loadBundledDatabaseOrEmpty({ loadBundledState, createEmptyState }) {
  try {
    return await loadBundledState();
  } catch {
    return createEmptyState();
  }
}

export async function resolveInitialDatabaseState({
  createEmptyState = createEmptyDatabaseState,
  loadBundledState = loadBundledDatabaseStateOnDemand,
  loadStoredState = loadStoredDatabaseState,
  upgradeState = upgradeDatabaseState,
} = {}) {
  try {
    const storedState = await loadStoredState();

    if (storedState) {
      return upgradeState(storedState);
    }
  } catch {
    return loadBundledDatabaseOrEmpty({ loadBundledState, createEmptyState });
  }

  return loadBundledDatabaseOrEmpty({ loadBundledState, createEmptyState });
}

async function loadInitialDatabaseState() {
  const nextDatabase = await resolveInitialDatabaseState();

  return {
    ...nextDatabase,
    shipRecords: applyImagesToShipRecords(nextDatabase.shipRecords, nextDatabase.imageEntries, {
      preserveExisting: true,
    }),
  };
}

let initialDatabaseStatePromise = null;

function getInitialDatabaseState() {
  if (!initialDatabaseStatePromise) {
    initialDatabaseStatePromise = loadInitialDatabaseState().catch((error) => {
      initialDatabaseStatePromise = null;
      throw error;
    });
  }

  return initialDatabaseStatePromise;
}

export function preloadAppBootstrap() {
  void getInitialDatabaseState();
}

export function useAppBootstrap() {
  const [databaseState, setDatabaseState] = useState(() => createEmptyDatabaseState());
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initializeDatabase = async () => {
      const nextDatabase = await getInitialDatabaseState();

      if (cancelled) {
        return;
      }

      setDatabaseState(nextDatabase);
      setDatabaseReady(true);
    };

    initializeDatabase().catch(() => {
      if (!cancelled) {
        setDatabaseState(createEmptyDatabaseState());
        setDatabaseReady(true);
      }
    });

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

  return {
    databaseReady,
    databaseState,
    setDatabaseState,
  };
}
