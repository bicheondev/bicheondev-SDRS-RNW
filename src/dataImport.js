import JSZip from 'jszip';
import noImagePlaceholder from '../no-image.svg';

const SHIP_HEADERS = ['번호', '어선번호', '어선명', '어선총톤수', '성명', '연락처', '업종', '선적항', '소나', '어군 탐지기'];
const VILLAGE_HEADERS = ['어촌계', '성명', '주소', '전화번호'];
const DEFAULT_FILE_META = {
  ship: { name: 'ship.csv', imported: false, modified: false },
  village: { name: 'village.csv', imported: false, modified: false },
  images: { name: 'images.zip', imported: false, modified: false },
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

function parseCsvText(text) {
  const lines = stripBom(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
  });
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

  return 'image/jpeg';
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

function createVillageRecord(row) {
  const title = String(row['어촌계'] ?? '').trim();

  return {
    id: createId('village'),
    searchKey: title,
    title,
    leader: String(row['성명'] ?? '').trim(),
    address: String(row['주소'] ?? '').trim(),
    phone: formatPhoneNumber(row['전화번호'] ?? ''),
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
    villageRecords: [],
    imageEntries: [],
    files: {
      ship: { ...DEFAULT_FILE_META.ship },
      village: { ...DEFAULT_FILE_META.village },
      images: { ...DEFAULT_FILE_META.images },
    },
  };
}

export function cloneDatabaseState(state) {
  return {
    shipRecords: state.shipRecords.map((record) => ({ ...record })),
    villageRecords: state.villageRecords.map((record) => ({ ...record })),
    imageEntries: state.imageEntries.map((entry) => ({ ...entry })),
    files: {
      ship: { ...DEFAULT_FILE_META.ship, ...(state.files?.ship ?? {}) },
      village: { ...DEFAULT_FILE_META.village, ...(state.files?.village ?? {}) },
      images: { ...DEFAULT_FILE_META.images, ...(state.files?.images ?? {}) },
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

export function applyImagesToShipRecords(shipRecords, imageEntries) {
  return shipRecords.map((record) => {
    const matchedImage = findImageEntryForRegistration(imageEntries, record.registration);

    return {
      ...record,
      image: matchedImage?.dataUrl ?? noImagePlaceholder,
      imageFileName: matchedImage?.fileName ?? '',
      imageMimeType: matchedImage?.mimeType ?? '',
    };
  });
}

export async function importShipCsvFile(file, imageEntries = []) {
  const buffer = await file.arrayBuffer();
  const rows = parseCsvText(decodeCsvBuffer(buffer));

  return {
    fileName: file.name || 'ship.csv',
    shipRecords: rows.map((row) => createShipRecord(row, imageEntries)),
  };
}

export async function importVillageCsvFile(file) {
  const buffer = await file.arrayBuffer();
  const rows = parseCsvText(decodeCsvBuffer(buffer));

  return {
    fileName: file.name || 'village.csv',
    villageRecords: rows.map(createVillageRecord),
  };
}

export async function importImagesZipFile(file) {
  const zip = await JSZip.loadAsync(file);
  const imageEntries = [];

  await Promise.all(
    Object.values(zip.files).map(async (entry) => {
      if (entry.dir) {
        return;
      }

      const mimeType = getMimeTypeFromFileName(entry.name);
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
    buildFileRow('어촌계장 DB', files.village),
    buildFileRow('선박 DB', files.ship),
    buildFileRow('이미지 압축 파일', files.images),
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

export function getVillageByPort(villageRecords, portName) {
  const matchedVillage = villageRecords.find((record) => record.title === portName);

  if (matchedVillage) {
    return matchedVillage;
  }

  return {
    title: portName,
    leader: '',
    phone: '',
    address: '',
  };
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
  const villageRows = databaseState.villageRecords.map((record) => ({
    어촌계: record.title,
    성명: record.leader,
    주소: record.address,
    전화번호: compactPhoneNumber(record.phone),
  }));

  zip.file('ship.csv', `\uFEFF${serializeCsv(SHIP_HEADERS, shipRows)}`);
  zip.file('village.csv', `\uFEFF${serializeCsv(VILLAGE_HEADERS, villageRows)}`);

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
