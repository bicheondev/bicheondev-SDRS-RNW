import { describe, expect, it } from 'vitest';

import { decodeCsvBuffer, parseCsvDocument, serializeCsv } from './csv.js';
import {
  compactPhoneNumber,
  formatPhoneNumber,
  SHIP_HEADERS,
  validateHeaders,
  validateShipRows,
} from './shipCsv.js';

describe('csv parsing', () => {
  it('parses BOM, quoted commas, Korean text, and ignores empty lines', () => {
    const document =
      '\uFEFF번호,어선명,선적항\r\n1,"갈치, 1호",제주\r\n\r\n2,"홍길동 ""선장""",부산\r\n';
    const parsed = parseCsvDocument(document);

    expect(parsed.headers).toEqual(['번호', '어선명', '선적항']);
    expect(parsed.rows).toEqual([
      { 번호: '1', 어선명: '갈치, 1호', 선적항: '제주' },
      { 번호: '2', 어선명: '홍길동 "선장"', 선적항: '부산' },
    ]);
  });

  it('serializes CSV values with escaping', () => {
    const csv = serializeCsv(
      ['이름', '메모'],
      [
        { 이름: '테스트', 메모: '줄1\n줄2' },
        { 이름: '쉼표', 메모: '어선, 메모' },
        { 이름: '따옴표', 메모: '홍길동 "선장"' },
      ],
    );

    expect(csv).toBe(
      '이름,메모\r\n테스트,"줄1\n줄2"\r\n쉼표,"어선, 메모"\r\n따옴표,"홍길동 ""선장"""',
    );
  });

  it('decodes utf-8 csv buffers', () => {
    const text = '\uFEFF번호,어선명\r\n1,한글어선';
    const decoded = decodeCsvBuffer(new TextEncoder().encode(text));

    expect(decoded).toBe('번호,어선명\r\n1,한글어선');
  });
});

describe('ship csv validation', () => {
  it('formats and compacts phone numbers compatibly', () => {
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    expect(formatPhoneNumber('0511234567')).toBe('051-123-4567');
    expect(compactPhoneNumber('010-1234-5678')).toBe('01012345678');
  });

  it('rejects invalid ship row values with current messages', () => {
    expect(() =>
      validateShipRows([
        { 번호: 'A', 어선총톤수: '1', 연락처: '01012345678', 소나: '1', '어군 탐지기': '0' },
      ]),
    ).toThrow('선박 DB 2행의 번호 형식이 올바르지 않아요.\n숫자만 입력되어 있는지 확인해 주세요.');

    expect(() =>
      validateShipRows([
        { 번호: '1', 어선총톤수: '1', 연락처: '전화번호', 소나: '1', '어군 탐지기': '0' },
      ]),
    ).toThrow('선박 DB 2행의 연락처 형식이 올바르지 않아요.\n전화번호 형식만 사용할 수 있어요.');
  });

  it('validates ship headers exactly', () => {
    expect(() => validateHeaders(SHIP_HEADERS, SHIP_HEADERS, '선박 DB')).not.toThrow();
    expect(() => validateHeaders(['번호'], SHIP_HEADERS, '선박 DB')).toThrow(
      '선박 DB 형식이 올바르지 않아요.\n내보낸 DB 헤더와 같은 CSV 파일만 불러올 수 있어요.',
    );
  });
});
