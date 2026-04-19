import { getChoseong } from 'es-hangul';

function normalizeSearchText(value) {
  return String(value ?? '').trim();
}

function compactWhitespace(value) {
  return value.replace(/\s+/g, '');
}

function isChoseongQuery(value) {
  return /^[ㄱ-ㅎ\s]+$/.test(value);
}

export function matchesSearchQuery(fields, query, options = {}) {
  const { choseongFields = fields } = options;
  const normalizedQuery = normalizeSearchText(query).toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const normalizedFields = fields.map((field) => normalizeSearchText(field));

  if (normalizedFields.some((field) => field && field.toLowerCase().includes(normalizedQuery))) {
    return true;
  }

  if (!isChoseongQuery(normalizedQuery)) {
    return false;
  }

  const compactQuery = compactWhitespace(normalizedQuery);

  return choseongFields.some((field) => {
    const normalizedField = normalizeSearchText(field);
    return (
      normalizedField && compactWhitespace(getChoseong(normalizedField)).includes(compactQuery)
    );
  });
}
