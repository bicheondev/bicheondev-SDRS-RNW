# SDRS

선박 DB 조회 및 관리용 Vite + React 웹 앱입니다. 로그인 화면, 선박 DB 탐색/검색/필터, 이미지 확대, CSV/ZIP 기반 데이터 관리, DB 내보내기, 라이트/다크/시스템 모드를 제공합니다.

## 목적

- 번들된 `ship.csv` 와 `images.zip` 을 기반으로 선박 정보를 조회합니다.
- IndexedDB 에 수정된 DB 상태를 저장해 새로고침 후에도 유지합니다.
- 선박 CSV 와 이미지 ZIP 을 가져오고, 다시 `db_export.zip` 으로 내보낼 수 있습니다.

## 요구 사항

- Node.js 20 이상 권장
- npm 사용

## 설치

```bash
npm ci
```

## 개발 서버

```bash
npm run dev
```

## 프로덕션 빌드

```bash
npm run build
```

## 빌드 미리보기

```bash
npm run preview
```

## 품질 검사

```bash
npm run lint
npm run test:run
npm run format:check
```

## 데이터 가져오기/내보내기

- 선박 DB 가져오기는 현재 헤더와 동일한 `ship.csv` 형식만 허용합니다.
- 이미지 가져오기는 이미지 파일만 포함한 `images.zip` 형식을 사용합니다.
- DB 내보내기는 `db_export.zip` 을 생성하며 내부에 `ship.csv` 와 `images.zip` 이 포함됩니다.
- 기존 저장 데이터 및 현재 import/export 형식과의 호환성을 유지하도록 구현되어 있습니다.

## 브라우저 저장소

- 앱 상태는 브라우저 IndexedDB 에 저장됩니다.
- 현재 저장소 키와 스키마는 기존 버전과 호환되도록 유지됩니다.
- 브라우저 저장소를 직접 삭제하면 앱 데이터도 함께 초기화됩니다.

## 로그인 동작 참고

- 현재 로그인 화면은 로컬 진입 게이트이며, 서버 인증을 수행하지 않습니다.
- 릴리스 시 실제 인증 연동이 필요하다면 별도 제품 요구사항으로 다뤄야 합니다.

## 주요 디렉터리

- `src/app`: 앱 셸, 부트스트랩, 상위 상태 조합
- `src/features`: 인증, DB, 데이터 관리, 메뉴 기능별 화면 조합
- `src/domain`: 순수 데이터/검색/import-export 로직
- `src/services`: IndexedDB, 파일 다운로드 같은 브라우저 서비스
- `src/hooks`: 색상 모드, 네비게이션, reduced motion 같은 공통 훅
- `src/assets`: 릴리스 번들에 포함되는 로컬 UI 에셋
- `src/styles`: 스타일 엔트리와 토큰 레이어
