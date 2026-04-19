# Release Checklist

1. `npm ci`
2. `npm run lint`
3. `npm run test:run`
4. `npm run build`
5. 앱을 실행해 로그인 화면이 정상 진입하는지 확인
6. 번들된 `ship.csv` 와 `images.zip` 이 초기 로딩되는지 확인
7. DB 탐색 화면, 검색, 항포구 필터, 선박 유형 필터, compact/card 전환 확인
8. 스크롤 시 상단 바 hide/show 와 이미지 확대/닫기 확인
9. 하단 탭 이동과 메뉴, 라이트/다크/시스템 모드 전환 확인
10. 데이터 관리 홈에서 선박 CSV 가져오기 확인
11. 데이터 관리 홈에서 이미지 ZIP 가져오기 확인
12. 동일 어선번호 충돌 모달과 대체 옵션 확인
13. 선박 편집 화면에서 추가/수정/삭제/이미지 교체/길게 눌러 재정렬 확인
14. 저장/되돌리기/토스트 메시지 확인
15. `DB 및 이미지 내보내기` 로 생성된 `db_export.zip` 내부에 `ship.csv`, `images.zip` 이 있는지 확인
16. 새로고침 후 IndexedDB 저장 상태가 유지되는지 확인
17. 릴리스 전 `node_modules/`, `dist/`, 로컬 환경 파일이 git 에 포함되지 않았는지 확인
