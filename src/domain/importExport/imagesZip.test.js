import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { getMimeTypeFromFileName, importImagesZipFile } from './imagesZip.js';

async function createZipFile(entries, name = 'images.zip') {
  const zip = new JSZip();

  for (const [entryName, content] of entries) {
    zip.file(entryName, content);
  }

  const buffer = await zip.generateAsync({ type: 'uint8array' });
  return new File([buffer], name, { type: 'application/zip' });
}

describe('images zip import', () => {
  it('validates supported image extensions', async () => {
    const file = await createZipFile([['bad.txt', 'not-an-image']]);

    await expect(importImagesZipFile(file)).rejects.toThrow(
      '이미지 압축 파일 형식이 올바르지 않아요.\nZIP 안에는 이미지 파일만 넣어 주세요.',
    );
  });

  it('extracts registrations from image file names and preserves sort order', async () => {
    const file = await createZipFile([
      ['folder/2024001-1234567.png', 'png-content'],
      ['folder/2023001-1234567.jpg', 'jpg-content'],
    ]);

    const result = await importImagesZipFile(file);

    expect(result.fileName).toBe('images.zip');
    expect(result.imageEntries.map((entry) => entry.fileName)).toEqual([
      '2023001-1234567.jpg',
      '2024001-1234567.png',
    ]);
    expect(result.imageEntries.map((entry) => entry.registration)).toEqual([
      '2023001-1234567',
      '2024001-1234567',
    ]);
  });

  it('maps file names to mime types', () => {
    expect(getMimeTypeFromFileName('sample.jpeg')).toBe('image/jpeg');
    expect(getMimeTypeFromFileName('sample.png')).toBe('image/png');
    expect(getMimeTypeFromFileName('sample.txt')).toBe('');
  });
});
