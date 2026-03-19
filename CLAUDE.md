# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Decoder는 크롬 확장 프로그램으로, 다양한 형식(URL, Base64, JWT, Hex, ROT13 등)의 인코딩된 텍스트를 자동으로 감지해 디코딩하고, 지원되는 타입은 인코딩도 수행합니다. Manifest V3 기반으로 작성되었습니다.

## Build & Development Commands

```bash
# 프로덕션 빌드 (dist/ 폴더에 생성, public/ 파일 복사 포함)
npm run build

# 개발 모드 (watch 모드로 파일 변경 시 자동 빌드)
npm run dev
```

**빌드 후 크롬에서 테스트:**
1. Chrome에서 `chrome://extensions/` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `dist/` 폴더 선택

## Architecture

### Core Components

**PopupController** (`src/ui/controllers/PopupController.ts`)
- 팝업 UI의 실질적인 오케스트레이터
- 컴포넌트 초기화, 모드 전환, 디코딩/인코딩 실행, history/storage 패널 연동을 담당

**DecoderService** (`src/services/decoderService.ts`)
- 중앙 서비스로, 모든 디코더를 관리하고 자동 감지 로직을 처리
- `detectDecoder()`: 우선순위 기반 자동 감지 (JSON Pretty → JWT → GZIP → Base64URL → Base64 → Hex → CharCode → URL → HTML → ROT13)
- `decode()`: 실제 디코딩 수행 및 결과 반환
- `decodeChain()`: 중첩 인코딩을 반복 디코딩하며 안전장치로 루프 방지

**EncoderService** (`src/services/encoderService.ts`)
- URL, HTML, Base64, Base64URL, Hex, CharCode, ROT13, GZIP 인코딩 지원

**Individual Decoders** (`src/decoders/`)
각 디코더는 독립적인 클래스로 구현되며, 다음 정적 메서드를 구현:
- `decode(input: string)`: 디코딩 로직
- `canDecode(input: string)`: 입력이 해당 형식인지 검증

**중요:** 새 디코더 추가 시:
1. `src/decoders/` 에 새 파일 생성
2. `decode()`와 `canDecode()` 정적 메서드 구현
3. `src/decoders/index.ts`에 export 추가
4. `src/services/decoderService.ts`에 import 및 우선순위 설정
5. 인코딩 지원 시 `src/services/encoderService.ts`에도 연결

### Detection Accuracy

각 디코더의 `canDecode()` 메서드는 정확도를 높이기 위해 다음을 검증:
- **최소 길이 요구사항**: 짧은 텍스트의 오인식 방지
- **실제 디코딩 테스트**: 디코딩 결과가 유효한 문자인지 확인
- **패턴 검증**: 형식 특유의 문자/패턴 존재 여부 확인
- **비율 검증**: printable 문자 비율, 인코딩 비율 등

예시:
- Base64URL: `-` 또는 `_` 특수문자가 반드시 포함되어야 함
- URL: 전체 문자열의 최소 15% 이상이 `%XX` 패턴이어야 함
- Hex: 디코딩 결과의 70% 이상이 printable 문자여야 함

### UI Components

**Popup UI** (`src/popup.ts`, `src/ui/controllers/PopupController.ts`, `src/ui/components/*`, `public/popup.html`)
- `src/popup.ts`는 엔트리 포인트만 담당하고, 실제 로직은 `PopupController`와 컴포넌트 레이어에 분리되어 있음
- 자동 감지된 디코딩 타입을 뱃지로 표시
- 다크모드, 언어, 선택한 디코더 타입, Auto-Fetch 상태를 `chrome.storage.local`에 저장
- 같은 `popup.html`을 기본 popup, side panel, 독립 창에서 재사용

**Background Service Worker** (`src/background.ts`)
- Manifest V3 service worker
- Side Panel open 요청 처리

**Content Script** (`src/content.ts`)
- 현재 페이지의 `localStorage`, `sessionStorage`, `document.cookie` 값을 수집
- Auto-Fetch 기능에서 `StorageService`의 요청을 받아 응답

### Build Configuration

**Vite 설정** (`vite.config.ts`)
- Multi-entry 빌드: `background.ts`, `popup.ts`, `content.ts`
- `minify: false`: 디버깅 용이성을 위해 minify 비활성화
- `public/` 폴더의 파일들(manifest.json, popup.html, icons)은 빌드 스크립트에서 수동으로 `dist/`로 복사

## Key Technical Details

### UTF-8 Support in Base64/Base64URL
Base64 디코딩 시 한글 등 멀티바이트 문자 지원을 위해 `atob()` 결과를 `TextDecoder('utf-8')`로 변환:
```typescript
const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
return new TextDecoder('utf-8').decode(bytes);
```

### Auto-Detection Priority Order
우선순위는 `src/services/decoderService.ts`의 `detectDecoder()` 메서드에 정의되어 있으며, 다음 순서로 검사:
1. JSON Pretty
2. JWT (Base64URL의 특수 케이스)
3. GZIP (Base64 + GZIP 헤더)
4. Base64URL
5. Base64
6. Hex
7. CharCode
8. URL
9. HTML
10. ROT13 (가장 낮은 우선순위)

### Chrome Extension Permissions
- `activeTab`: 현재 탭 조회, 시스템 페이지 차단, side panel open 대상 창 식별
- `storage`: 사용자 설정과 히스토리 저장
- `sidePanel`: side panel 열기
- `host_permissions`: 모든 HTTP/HTTPS 페이지에 content script를 주입해 Storage/`document.cookie` 값 수집
