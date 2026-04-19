import { describe, expect, it } from 'vitest';

import {
  cloneDatabaseState,
  createEmptyDatabaseState,
  upgradeDatabaseState,
} from './databaseState.js';

describe('databaseState', () => {
  it('creates the default empty database shape', () => {
    expect(createEmptyDatabaseState()).toEqual({
      shipRecords: [],
      imageEntries: [],
      files: {
        ship: { name: 'ship.csv', imported: false, modified: false },
        images: { name: 'images.zip', imported: false, modified: false },
      },
    });
  });

  it('fills missing file metadata while preserving persisted arrays', () => {
    expect(
      cloneDatabaseState({
        shipRecords: [{ id: 'ship-1', title: '가가호' }],
        imageEntries: [{ id: 'image-1', fileName: '123.jpg' }],
        files: {
          ship: { imported: true },
        },
      }),
    ).toEqual({
      shipRecords: [{ id: 'ship-1', title: '가가호' }],
      imageEntries: [{ id: 'image-1', fileName: '123.jpg' }],
      files: {
        ship: { name: 'ship.csv', imported: true, modified: false },
        images: { name: 'images.zip', imported: false, modified: false },
      },
    });
  });

  it('normalizes legacy or partial stored state through the upgrade path', () => {
    expect(
      upgradeDatabaseState({
        shipRecords: null,
        files: {
          images: { name: 'legacy-images.zip', imported: true },
        },
      }),
    ).toEqual({
      shipRecords: [],
      imageEntries: [],
      files: {
        ship: { name: 'ship.csv', imported: false, modified: false },
        images: { name: 'legacy-images.zip', imported: true, modified: false },
      },
    });
  });
});
