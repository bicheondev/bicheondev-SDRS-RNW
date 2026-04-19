import { describe, expect, it } from 'vitest';

import { filterVessels, findImageEntryForRegistration, mergeImportedShipRecords } from './ships.js';
import { matchesSearchQuery } from './search.js';

describe('ship helpers', () => {
  it('matches image entries by exact registration or file name fallback', () => {
    const entries = [
      { fileName: 'foo.png', registration: '2024001-1111111', dataUrl: 'a', mimeType: 'image/png' },
      {
        fileName: 'fallback-2024002-2222222.jpg',
        registration: '',
        dataUrl: 'b',
        mimeType: 'image/jpeg',
      },
    ];

    expect(findImageEntryForRegistration(entries, '2024001-1111111')?.dataUrl).toBe('a');
    expect(findImageEntryForRegistration(entries, '2024002-2222222')?.dataUrl).toBe('b');
    expect(findImageEntryForRegistration(entries, '')).toBeNull();
  });

  it('merges imported ship records compatibly', () => {
    const existing = [
      { id: '1', registration: 'A' },
      { id: '2', registration: 'B' },
    ];
    const imported = [
      { id: '3', registration: 'B' },
      { id: '4', registration: 'C' },
    ];

    expect(mergeImportedShipRecords(existing, imported)).toBe(imported);
    expect(mergeImportedShipRecords(existing, imported, { keepExisting: true })).toEqual([
      ...existing,
      ...imported,
    ]);
    expect(
      mergeImportedShipRecords(existing, imported, {
        keepExisting: true,
        replaceSameRegistration: true,
      }),
    ).toEqual([
      { id: '1', registration: 'A' },
      { id: '3', registration: 'B' },
      { id: '4', registration: 'C' },
    ]);
  });

  it('filters vessels by harbor and vessel type', () => {
    const vessels = [
      { id: '1', port: '제주', business: '연안통발어업' },
      { id: '2', port: '부산', business: '레저보트업' },
    ];

    expect(filterVessels(vessels, '전체 항포구', '전체 선박')).toHaveLength(2);
    expect(filterVessels(vessels, '제주', '전체 선박')).toEqual([vessels[0]]);
    expect(filterVessels(vessels, '전체 항포구', '보트')).toEqual([vessels[1]]);
  });
});

describe('search behavior', () => {
  it('supports choseong search', () => {
    expect(matchesSearchQuery(['갈치호'], 'ㄱㅊ')).toBe(true);
    expect(matchesSearchQuery(['갈치호'], 'ㄷ')).toBe(false);
    expect(matchesSearchQuery(['Busan'], 'bus')).toBe(true);
  });
});
