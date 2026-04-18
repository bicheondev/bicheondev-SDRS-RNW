import noImagePlaceholder from '../no-image.svg';

export const emptyManageShipCard = {
  searchKey: '',
  title: '',
  registration: '',
  ownerName: '',
  ownerPhone: '',
  port: '',
  business: '',
  tonnage: '',
  image: noImagePlaceholder,
  imageFileName: '',
  imageMimeType: '',
  sonar: false,
  detector: true,
  selected: true,
};

export function cloneManageItems(items) {
  return items.map((item) => ({ ...item }));
}

export function areImageEntriesEqual(entriesA, entriesB) {
  if (entriesA.length !== entriesB.length) {
    return false;
  }

  return entriesA.every((entry, index) => {
    const otherEntry = entriesB[index];

    if (!otherEntry) {
      return false;
    }

    return (
      entry.fileName === otherEntry.fileName &&
      entry.registration === otherEntry.registration &&
      entry.dataUrl === otherEntry.dataUrl &&
      entry.mimeType === otherEntry.mimeType
    );
  });
}

export function normalizeShipCardsForStorage(cards) {
  return cards.map((card, index) => ({
    ...emptyManageShipCard,
    ...card,
    rowNumber: String(index + 1),
    searchKey: card.title,
    selected: false,
  }));
}

export function getVesselTypeFromBusiness(business) {
  return business === '연안통발어업' || business === '수하식양식업' ? '어선' : '보트';
}

export function filterVessels(vessels, harborFilter, vesselTypeFilter) {
  return vessels.filter((vessel) => {
    const matchesHarbor = harborFilter === '전체 항포구' || vessel.port === harborFilter;
    const matchesType =
      vesselTypeFilter === '전체 선박' ||
      getVesselTypeFromBusiness(vessel.business) === vesselTypeFilter;

    return matchesHarbor && matchesType;
  });
}

export function areManageShipCardsEqual(cardsA, cardsB) {
  if (cardsA.length !== cardsB.length) {
    return false;
  }

  return cardsA.every((card, index) => {
    const otherCard = cardsB[index];

    if (!otherCard) {
      return false;
    }

    return (
      card.id === otherCard.id &&
      card.title === otherCard.title &&
      card.registration === otherCard.registration &&
      card.port === otherCard.port &&
      card.business === otherCard.business &&
      card.tonnage === otherCard.tonnage &&
      (card.image ?? '') === (otherCard.image ?? '') &&
      Boolean(card.sonar) === Boolean(otherCard.sonar) &&
      Boolean(card.detector) === Boolean(otherCard.detector)
    );
  });
}

function normalizeRegistrationKey(value) {
  return String(value ?? '').trim();
}

export function mergeImportedShipRecords(existingShipRecords, importedShipRecords, options = {}) {
  const { keepExisting = false, replaceSameRegistration = false } = options;

  if (!keepExisting) {
    return importedShipRecords;
  }

  if (!replaceSameRegistration) {
    return [...existingShipRecords.map((record) => ({ ...record })), ...importedShipRecords];
  }

  const importedRegistrations = new Set(
    importedShipRecords.map((record) => normalizeRegistrationKey(record.registration)).filter(Boolean),
  );
  const preservedExisting = existingShipRecords.filter((record) => {
    const registration = normalizeRegistrationKey(record.registration);
    return !(registration && importedRegistrations.has(registration));
  });

  return [...preservedExisting.map((record) => ({ ...record })), ...importedShipRecords];
}
