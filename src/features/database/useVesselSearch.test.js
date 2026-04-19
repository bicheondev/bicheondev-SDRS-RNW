import { describe, expect, it } from 'vitest';

import { applySearchQuery } from './useVesselSearch.js';

describe('applySearchQuery', () => {
  it('searches vessel name only', () => {
    const vessels = [
      {
        id: '1',
        name: '갈치호',
        registration: '2024-001',
        port: '제주',
        business: '연안통발어업',
      },
    ];

    expect(applySearchQuery(vessels, '갈치')).toEqual(vessels);
    expect(applySearchQuery(vessels, 'ㄱㅊ')).toEqual(vessels);
    expect(applySearchQuery(vessels, '2024-001')).toEqual([]);
    expect(applySearchQuery(vessels, '제주')).toEqual([]);
    expect(applySearchQuery(vessels, '연안통발어업')).toEqual([]);
  });
});
