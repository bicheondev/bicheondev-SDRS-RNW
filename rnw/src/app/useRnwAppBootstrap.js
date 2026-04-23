import { useEffect, useState } from 'react';

import {
  createEmptyDatabaseState,
  upgradeDatabaseState,
} from '../../../src/domain/databaseState.js';
import { loadBundledDatabaseState } from '../adapters/bundledSeed.web.js';
import { applyImagesToShipRecords } from '../../../src/domain/ships.js';
import { loadStoredDatabaseState, saveStoredDatabaseState } from '../adapters/storage.web.js';

async function loadBundledDatabaseOrEmpty({ loadBundledState, createEmptyState }) {
  try {
    return await loadBundledState();
  } catch {
    return createEmptyState();
  }
}

export async function resolveRnwInitialDatabaseState({
  createEmptyState = createEmptyDatabaseState,
  loadBundledState = loadBundledDatabaseState,
  loadStoredState = loadStoredDatabaseState,
  upgradeState = upgradeDatabaseState,
} = {}) {
  try {
    const storedState = await loadStoredState();

    if (storedState) {
      return upgradeState(storedState);
    }
  } catch {
    return loadBundledDatabaseOrEmpty({ createEmptyState, loadBundledState });
  }

  return loadBundledDatabaseOrEmpty({ createEmptyState, loadBundledState });
}

async function loadInitialDatabaseState() {
  const nextDatabase = await resolveRnwInitialDatabaseState();

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

export function preloadRnwAppBootstrap() {
  void getInitialDatabaseState();
}

export function useRnwAppBootstrap() {
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
