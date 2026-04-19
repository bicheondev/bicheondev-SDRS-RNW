import defaultImagesZipUrl from '../../../images.zip?url';
import defaultShipCsvUrl from '../../../ship.csv?url';

import { createImportError } from './shared.js';
import { importImagesZipFile } from './imagesZip.js';
import { importShipCsvFile } from './shipCsv.js';

export const DEFAULT_BUNDLED_FILES = {
  ship: { url: defaultShipCsvUrl, name: 'ship.csv', type: 'text/csv' },
  images: { url: defaultImagesZipUrl, name: 'images.zip', type: 'application/zip' },
};

async function fetchBundledFile({ url, name, type }) {
  const response = await fetch(url);

  if (!response.ok) {
    throw createImportError(`${name} 기본 파일을 불러오지 못했어요.`);
  }

  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || type });
}

export async function loadBundledDatabaseState(files = DEFAULT_BUNDLED_FILES) {
  const [shipFile, imagesFile] = await Promise.all([
    fetchBundledFile(files.ship),
    fetchBundledFile(files.images),
  ]);

  const { fileName: imagesFileName, imageEntries } = await importImagesZipFile(imagesFile);
  const shipResult = await importShipCsvFile(shipFile, imageEntries);

  return {
    shipRecords: shipResult.shipRecords,
    imageEntries,
    files: {
      ship: {
        name: shipResult.fileName,
        imported: true,
        modified: false,
      },
      images: {
        name: imagesFileName,
        imported: true,
        modified: false,
      },
    },
  };
}
