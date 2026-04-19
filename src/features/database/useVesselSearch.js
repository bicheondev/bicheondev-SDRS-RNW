import { matchesSearchQuery } from '../../domain/search.js';

export function applySearchQuery(vessels, query) {
  return vessels.filter((vessel) => matchesSearchQuery([vessel.name], query));
}
