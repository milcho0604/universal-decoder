# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Decoder는 크롬 확장 프로그램으로, 다양한 형식(URL, Base64, JWT, Hex, ROT13 등)의 인코딩된 텍스트를 자동으로 감지하고 디코딩합니다. Manifest V3 기반으로 작성되었습니다.

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

**DecoderService** (`src/decoderService.ts`)
- 중앙 서비스로, 모든 디코더를 관리하고 자동 감지 로직을 처리
- `detectDecoder()`: 우선순위 기반 자동 감지 (JWT → GZIP → Base64URL → Base64 → Hex → CharCode → URL → HTML → ROT13)
- `decode()`: 실제 디코딩 수행 및 결과 반환

**Individual Decoders** (`src/decoders/`)
각 디코더는 독립적인 클래스로 구현되며, 다음 정적 메서드를 구현:
- `decode(input: string)`: 디코딩 로직
- `canDecode(input: string)`: 입력이 해당 형식인지 검증

**중요:** 새 디코더 추가 시:
1. `src/decoders/` 에 새 파일 생성
2. `decode()`와 `canDecode()` 정적 메서드 구현
3. `src/decoders/index.ts`에 export 추가
4. `src/decoderService.ts`에 import 및 우선순위 설정

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

**Popup** (`src/popup.ts`, `public/popup.html`)
- Chrome extension action popup UI
- 자동 감지된 디코딩 타입을 "✓ [타입명]" 뱃지로 표시 (`detectedTypeBadge`)
- 다크모드 설정을 `chrome.storage.local`에 저장
- 선택한 디코더 타입을 `chrome.storage.local`에 저장하여 다음 사용 시 복원

**Background Service Worker** (`src/background.ts`)
- Manifest V3 service worker (최소 구현)

### Build Configuration

**Vite 설정** (`vite.config.ts`)
- Multi-entry 빌드: `background.ts`, `popup.ts`
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
우선순위는 `decoderService.ts`의 `detectDecoder()` 메서드에 정의되어 있으며, 다음 순서로 검사:
1. JWT (Base64URL의 특수 케이스)
2. GZIP (Base64 + GZIP 헤더)
3. Base64URL
4. Base64
5. Hex
6. CharCode
7. URL
8. HTML
9. ROT13 (가장 낮은 우선순위)

### Chrome Extension Permissions
- `activeTab`: 현재 탭에 대한 액세스 (사용 중)
- `storage`: 사용자 설정 저장 (다크모드, 디코더 타입)
- `host_permissions`: 모든 HTTP/HTTPS (현재 미사용, 향후 콘텐츠 스크립트용)
