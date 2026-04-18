import JSZip from 'jszip';
import noImagePlaceholder from '../no-image.svg';
import defaultImagesZipUrl from '../images.zip?url';
import defaultShipCsvUrl from '../ship.csv?url';

const SHIP_HEADERS = ['번호', '어선번호', '어선명', '어선총톤수', '성명', '연락처', '업종', '선적항', '소나', '어군 탐지기'];
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif']);
const DEFAULT_FILE_META = {
  ship: { name: 'ship.csv', imported: false, modified: false },
  images: { name: 'images.zip', imported: false, modified: false },
};
const DEFAULT_BUNDLED_FILES = {
  ship: { url: defaultShipCsvUrl, name: 'ship.csv', type: 'text/csv' },
  images: { url: defaultImagesZipUrl, name: 'images.zip', type: 'application/zip' },
};

function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseCsvDocument(text) {
  const lines = stripBom(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
  });

  return { headers, rows };
}

function encodeCsvValue(value) {
  const normalized = String(value ?? '');
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function serializeCsv(headers, rows) {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => encodeCsvValue(row[header] ?? '')).join(',')),
  ];

  return lines.join('\r\n');
}

function formatPhoneNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return String(value ?? '');
}

function compactPhoneNumber(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function decodeCsvBuffer(buffer) {
  const decoders = ['utf-8', 'euc-kr'];

  for (const encoding of decoders) {
    try {
      return new TextDecoder(encoding, { fatal: true }).decode(buffer);
    } catch (error) {
      continue;
    }
  }

  return new TextDecoder().decode(buffer);
}

function createImportError(message) {
  return new Error(message);
}

async function fetchBundledFile({ url, name, type }) {
  const response = await fetch(url);

  if (!response.ok) {
    throw createImportError(`${name} 기본 파일을 불러오지 못했어요.`);
  }

  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || type });
}

function validateHeaders(actualHeaders, expectedHeaders, label) {
  const hasExactHeaderMatch =
    actualHeaders.length === expectedHeaders.length &&
    expectedHeaders.every((header, index) => actualHeaders[index] === header);

  if (!hasExactHeaderMatch) {
    throw createImportError(`${label} 형식이 올바르지 않아요.\n내보낸 DB 헤더와 같은 CSV 파일만 불러올 수 있어요.`);
  }
}

function isBlank(value) {
  return String(value ?? '').trim() === '';
}

function isIntegerLike(value) {
  return /^\d+$/.test(String(value ?? '').trim());
}

function isNumberLike(value) {
  return /^\d+(?:\.\d+)?$/.test(String(value ?? '').trim());
}

function isPhoneLike(value) {
  return /^[\d\s()+-]+$/.test(String(value ?? '').trim());
}

function isBinaryLike(value) {
  return /^[01]$/.test(String(value ?? '').trim());
}

function validateShipRows(rows) {
  rows.forEach((row, index) => {
    const lineNumber = index + 2;

    if (!isBlank(row['번호']) && !isIntegerLike(row['번호'])) {
      throw createImportError(`선박 DB ${lineNumber}행의 번호 형식이 올바르지 않아요.\n숫자만 입력되어 있는지 확인해 주세요.`);
    }

    if (!isBlank(row['어선총톤수']) && !isNumberLike(row['어선총톤수'])) {
      throw createImportError(`선박 DB ${lineNumber}행의 어선총톤수 형식이 올바르지 않아요.\n숫자 형식인지 확인해 주세요.`);
    }

    if (!isBlank(row['연락처']) && !isPhoneLike(row['연락처'])) {
      throw createImportError(`선박 DB ${lineNumber}행의 연락처 형식이 올바르지 않아요.\n전화번호 형식만 사용할 수 있어요.`);
    }

    if (!isBlank(row['소나']) && !isBinaryLike(row['소나'])) {
      throw createImportError(`선박 DB ${lineNumber}행의 소나 값이 올바르지 않아요.\n0 또는 1만 사용할 수 있어요.`);
    }

    if (!isBlank(row['어군 탐지기']) && !isBinaryLike(row['어군 탐지기'])) {
      throw createImportError(`선박 DB ${lineNumber}행의 어군 탐지기 값이 올바르지 않아요.\n0 또는 1만 사용할 수 있어요.`);
    }
  });
}

function getMimeTypeFromFileName(fileName) {
  const lowered = fileName.toLowerCase();

  if (lowered.endsWith('.png')) {
    return 'image/png';
  }
  if (lowered.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lowered.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (lowered.endsWith('.gif')) {
    return 'image/gif';
  }
  if (lowered.endsWith('.jpg') || lowered.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  return '';
}

function getExtensionFromMimeType(mimeType) {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}

function getExtensionFromFileName(fileName) {
  const parts = String(fileName ?? '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function getMimeTypeFromDataUrl(dataUrl) {
  const match = /^data:([^;]+);/i.exec(String(dataUrl ?? ''));
  return match?.[1] ?? 'image/jpeg';
}

function isPlaceholderImage(value) {
  return !value || value === noImagePlaceholder;
}

function sanitizeFileSegment(value, fallback) {
  const sanitized = String(value ?? '')
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || fallback;
}

function createShipRecord(row, imageEntries) {
  const registration = String(row['어선번호'] ?? '').trim();
  const matchedImage = findImageEntryForRegistration(imageEntries, registration);

  return {
    id: createId('ship'),
    rowNumber: String(row['번호'] ?? '').trim(),
    searchKey: String(row['어선명'] ?? '').trim(),
    title: String(row['어선명'] ?? '').trim(),
    registration,
    ownerName: String(row['성명'] ?? '').trim(),
    ownerPhone: formatPhoneNumber(row['연락처'] ?? ''),
    port: String(row['선적항'] ?? '').trim(),
    business: String(row['업종'] ?? '').trim(),
    tonnage: String(row['어선총톤수'] ?? '').trim(),
    image: matchedImage?.dataUrl ?? noImagePlaceholder,
    imageFileName: matchedImage?.fileName ?? '',
    imageMimeType: matchedImage?.mimeType ?? '',
    sonar: String(row['소나'] ?? '').trim() === '1',
    detector: String(row['어군 탐지기'] ?? '').trim() === '1',
    selected: false,
  };
}

function arrayBufferToDataUrl(buffer, mimeType) {
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

function dataUrlToUint8Array(dataUrl) {
  const [, payload = ''] = String(dataUrl ?? '').split(',');
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function createEmptyDatabaseState() {
  return {
    shipRecords: [],
    imageEntries: [],
    files: {
      ship: { ...DEFAULT_FILE_META.ship },
      images: { ...DEFAULT_FILE_META.images },
    },
  };
}

export function cloneDatabaseState(state) {
  return {
    shipRecords: Array.isArray(state?.shipRecords) ? state.shipRecords.map((record) => ({ ...record })) : [],
    imageEntries: Array.isArray(state?.imageEntries) ? state.imageEntries.map((entry) => ({ ...entry })) : [],
    files: {
      ship: { ...DEFAULT_FILE_META.ship, ...(state?.files?.ship ?? {}) },
      images: { ...DEFAULT_FILE_META.images, ...(state?.files?.images ?? {}) },
    },
  };
}

export function findImageEntryForRegistration(imageEntries, registration) {
  const key = String(registration ?? '').trim();
  if (!key) {
    return null;
  }

  return (
    imageEntries.find((entry) => entry.registration === key) ??
    imageEntries.find((entry) => entry.fileName.includes(key)) ??
    null
  );
}

export function applyImagesToShipRecords(shipRecords, imageEntries, options = {}) {
  const { preserveExisting = false } = options;

  return shipRecords.map((record) => {
    const matchedImage = findImageEntryForRegistration(imageEntries, record.registration);
    const hasExistingImage = !isPlaceholderImage(record.image);

    if (!matchedImage && preserveExisting && hasExistingImage) {
      return {
        ...record,
        image: record.image,
        imageFileName: record.imageFileName ?? '',
        imageMimeType: record.imageMimeType || getMimeTypeFromDataUrl(record.image),
      };
    }

    return {
      ...record,
      image: matchedImage?.dataUrl ?? noImagePlaceholder,
      imageFileName: matchedImage?.fileName ?? '',
      imageMimeType: matchedImage?.mimeType ?? (matchedImage ? getMimeTypeFromDataUrl(matchedImage.dataUrl) : ''),
    };
  });
}

export async function importShipCsvFile(file, imageEntries = []) {
  const buffer = await file.arrayBuffer();
  const { headers, rows } = parseCsvDocument(decodeCsvBuffer(buffer));

  validateHeaders(headers, SHIP_HEADERS, '선박 DB');
  validateShipRows(rows);

  return {
    fileName: file.name || 'ship.csv',
    shipRecords: rows.map((row) => createShipRecord(row, imageEntries)),
  };
}

export async function importImagesZipFile(file) {
  let zip;

  try {
    zip = await JSZip.loadAsync(file);
  } catch (error) {
    throw createImportError('이미지 압축 파일 형식이 올바르지 않아요.\nZIP 파일만 불러올 수 있어요.');
  }

  const imageEntries = [];

  await Promise.all(
    Object.values(zip.files).map(async (entry) => {
      if (entry.dir) {
        return;
      }

      const mimeType = getMimeTypeFromFileName(entry.name);
      const extension = getExtensionFromFileName(entry.name);

      if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension) || !mimeType.startsWith('image/')) {
        throw createImportError('이미지 압축 파일 형식이 올바르지 않아요.\nZIP 안에는 이미지 파일만 넣어 주세요.');
      }

      const dataUrl = arrayBufferToDataUrl(await entry.async('arraybuffer'), mimeType);

      imageEntries.push({
        id: createId('image'),
        fileName: entry.name.split('/').pop() ?? entry.name,
        registration: '',
        dataUrl,
        mimeType,
      });
    }),
  );

  imageEntries.sort((left, right) => left.fileName.localeCompare(right.fileName, 'ko'));

  return {
    fileName: file.name || 'images.zip',
    imageEntries: imageEntries.map((entry) => {
      const normalized = { ...entry };
      const registrationMatch = normalized.fileName.match(/\d{7,}-\d{7,}/);
      normalized.registration = registrationMatch?.[0] ?? '';
      return normalized;
    }),
  };
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

export function rebuildImageEntriesFromShips(shipRecords) {
  return shipRecords
    .filter((record) => !isPlaceholderImage(record.image))
    .map((record) => {
      const mimeType = record.imageMimeType || getMimeTypeFromDataUrl(record.image);
      const extension =
        getExtensionFromFileName(record.imageFileName) ||
        getExtensionFromMimeType(mimeType);
      const baseName = sanitizeFileSegment(record.registration, sanitizeFileSegment(record.title, 'ship-image'));
      const fileName =
        record.imageFileName && record.imageFileName.includes(record.registration)
          ? record.imageFileName
          : `${baseName}.${extension}`;

      return {
        id: createId('image'),
        fileName,
        registration: record.registration,
        dataUrl: record.image,
        mimeType,
      };
    });
}

export function buildManageHomeRows(files) {
  return [
    buildFileRow('선박 DB (.csv)', files.ship),
    buildFileRow('이미지 압축 파일 (.zip)', files.images),
  ];
}

function buildFileRow(label, fileMeta) {
  if (!fileMeta?.imported) {
    return { label, value: '등록하기', tone: 'blue' };
  }

  return {
    label,
    value: fileMeta.modified ? `${fileMeta.name} (수정됨)` : fileMeta.name,
    tone: 'default',
  };
}

export function buildDisplayVessels(shipRecords) {
  return shipRecords.map((record, index) => ({
    id: record.id || `ship-${index}`,
    name: record.title,
    registration: record.registration,
    port: record.port,
    business: record.business,
    tonnage: record.tonnage,
    sonar: Boolean(record.sonar),
    detector: Boolean(record.detector),
    imageWide: record.image || noImagePlaceholder,
    imageCompact: record.image || noImagePlaceholder,
  }));
}

export function buildHarborOptions(shipRecords) {
  const ports = Array.from(
    new Set(shipRecords.map((record) => record.port).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, 'ko'));

  return ['전체 항포구', ...ports];
}

export async function buildDatabaseExportBlob(databaseState) {
  const zip = new JSZip();
  const shipRows = databaseState.shipRecords.map((record, index) => ({
    번호: index + 1,
    어선번호: record.registration,
    어선명: record.title,
    어선총톤수: record.tonnage,
    성명: record.ownerName,
    연락처: compactPhoneNumber(record.ownerPhone),
    업종: record.business,
    선적항: record.port,
    소나: record.sonar ? '1' : '0',
    '어군 탐지기': record.detector ? '1' : '0',
  }));
  zip.file('ship.csv', `\uFEFF${serializeCsv(SHIP_HEADERS, shipRows)}`);

  const imagesZip = new JSZip();
  for (const entry of databaseState.imageEntries) {
    if (isPlaceholderImage(entry.dataUrl)) {
      continue;
    }

    imagesZip.file(entry.fileName, dataUrlToUint8Array(entry.dataUrl));
  }

  zip.file('images.zip', await imagesZip.generateAsync({ type: 'uint8array' }));
  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

export { noImagePlaceholder };
