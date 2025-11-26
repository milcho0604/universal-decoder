# 🔓 Universal Decoder

> 개발자를 위한 올인원 디코딩 도구 - 모든 인코딩 형식을 한 번에!

**Universal Decoder**는 다양한 인코딩 형식을 자동으로 감지하고 디코딩하는 Chrome 확장 프로그램입니다. URL, Base64, JWT, Hex, ROT13 등 10가지 이상의 형식을 지원하며, 개발자의 생산성을 높이는 강력한 도구입니다.

<div style="display:flex; gap:16px;">
  <img src="https://github.com/user-attachments/assets/3c47f758-33e1-4c15-b791-917f2a0dddcd" width="300" />
  <img src="https://github.com/user-attachments/assets/c74f47e6-0631-4332-8601-60596e48aa28" width="300" />
</div>

## ✨ 주요 기능

### 🎯 자동 감지

- 입력된 텍스트를 자동으로 분석하여 적절한 디코딩 방법을 감지
- 붙여넣기만 하면 자동으로 디코딩 (Auto mode)
- 감지된 디코딩 타입을 뱃지로 표시

### 🔄 Auto-Fetch 모드 (NEW!)

- 현재 페이지의 **localStorage**, **sessionStorage**, **Cookies**를 자동 수집
- 클릭 한 번으로 즉시 디코딩 - 복사/붙여넣기 불필요
- 개발자의 반복 작업을 획기적으로 단축

### 🪟 3가지 사용 모드

1. **Popup 모드** (기본) - 확장 프로그램 아이콘 클릭 시 팝업 표시
2. **Side Panel 모드** (📋 버튼) - 브라우저 옆에 고정된 패널, 페이지와 동시 작업 가능
3. **독립 창 모드** (🗗 버튼) - 자유롭게 이동/크기 조정 가능, 듀얼 모니터 환경에 최적

> **Chrome 114+** 에서 Side Panel을 지원합니다. 독립 창은 모든 버전에서 사용 가능합니다.

### 📋 지원하는 디코딩 형식

| 형식          | 설명                              | 예시                             |
| ------------- | --------------------------------- | -------------------------------- |
| **URL**       | URL 인코딩된 문자열 디코딩        | `%ED%95%9C%EA%B8%80` → `한글`    |
| **HTML**      | HTML 엔티티 디코딩                | `&lt;div&gt;` → `<div>`          |
| **Base64**    | Base64 인코딩 디코딩 (UTF-8 지원) | `7ZWc6riA` → `한글`              |
| **Base64URL** | URL-safe Base64 디코딩            | `7ZWc6riA` (- \_ 포함)           |
| **JWT**       | JSON Web Token 헤더/페이로드 분리 | `eyJ...` → Header + Payload      |
| **Hex**       | 16진수 문자열 → 텍스트            | `48656c6c6f` → `Hello`           |
| **CharCode**  | 문자 코드 배열 → 텍스트           | `[72,101,108,108,111]` → `Hello` |
| **ROT13**     | ROT13 암호화 디코딩               | `Uryyb` → `Hello`                |
| **GZIP**      | Base64 + GZIP 압축 해제           | `H4sIAAAAAAAA...`                |
| **JSON**      | JSON Pretty Print                 | Minified JSON → Formatted        |

### 🎨 편리한 기능

- 🌙 **다크모드 지원** - 눈의 피로 감소
- ⌨️ **키보드 단축키** - Enter로 디코딩, ESC로 닫기, Shift+Enter로 줄바꿈
- 📋 **결과 복사** - 원클릭 복사 버튼
- 💾 **설정 저장** - 다크모드, 디코더 타입, Auto-Fetch 설정 유지
- 🔒 **완전한 로컬 처리** - 데이터 외부 전송 없음

### 📜 히스토리 기능

- **자동 저장** - 디코딩 성공 시 자동으로 히스토리에 저장 (최대 50개)
- **빠른 재사용** - 히스토리 항목 클릭 한 번으로 즉시 재디코딩
- **드롭다운 UI** - 최근 항목만 표시하고, 화살표 클릭으로 전체 목록 확인
- **선택 삭제** - 체크박스로 여러 항목 선택 후 한 번에 삭제
- **전체 선택** - 한 번에 모든 항목 선택/해제
- **개별 삭제** - 각 항목의 삭제 버튼으로 즉시 삭제
- **스마트 관리** - 오래된 항목 자동 삭제, 최신 항목 우선 표시(최대 50개)

## 🚀 설치 방법

### Chrome 웹 스토어에서 설치 (사용자용)

_Coming soon - 스토어 출시 예정_

### 개발자 모드로 설치

1. 이 저장소를 클론합니다

   ```bash
   git clone https://github.com/yourusername/universal-decoder.git
   cd universal-decoder
   ```

2. 의존성을 설치합니다

   ```bash
   npm install
   ```

3. 프로젝트를 빌드합니다

   ```bash
   npm run build
   ```

4. Chrome에서 확장 프로그램을 로드합니다
   - `chrome://extensions/` 접속
   - 우측 상단의 "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `dist/` 폴더 선택

## 📖 사용 방법

### 기본 사용법

1. 확장 프로그램 아이콘 클릭
2. 디코딩할 텍스트 입력 또는 붙여넣기
3. 자동으로 감지되어 디코딩됨
4. 필요 시 디코딩 타입 수동 선택 가능

### Auto-Fetch 모드

1. 확장 프로그램 팝업 열기
2. 헤더의 🔄 버튼 클릭 (Auto-Fetch 활성화)
3. 현재 페이지의 Storage/Cookie 목록 자동 표시
4. 원하는 항목 클릭 → 자동 디코딩

> **Tip**: 처음 사용 시 페이지를 새로고침해야 Content Script가 로드됩니다.

### Side Panel 모드

1. Popup 열기 (확장 프로그램 아이콘 클릭)
2. 헤더의 📋 버튼 클릭
3. 브라우저 우측에 Side Panel이 열림
4. 페이지를 보면서 동시에 디코딩 작업 가능
<img width="1512" height="814" alt="스크린샷 2025-11-24 오후 9 01 39" src="https://github.com/user-attachments/assets/8b846878-4ab0-45d4-b27c-97543375da62" />

**장점:**

- 개발자 도구처럼 고정된 위치
- 페이지 전환해도 유지됨
- Auto-Fetch와 조합하면 최고의 생산성

### 독립 창 모드

1. Popup 또는 Side Panel 열기
2. 헤더의 🗗 버튼 클릭
3. 새 창으로 열림 (500x620 크기)
4. 자유롭게 드래그하고 크기 조정 가능
<img width="876" height="612" alt="스크린샷 2025-11-24 오후 9 01 59" src="https://github.com/user-attachments/assets/2f667af0-6a53-4fe6-a53d-e137a8ac95b0" />

**장점:**

- 듀얼 모니터 환경에 최적
- 복잡한 데이터 분석 시 큰 화면 활용
- 여러 탭을 비교하면서 작업

## 🛠️ 개발 가이드

### 프로젝트 구조

```
Decoding/
├── public/              # 정적 파일
│   ├── manifest.json    # Chrome Extension manifest
│   ├── popup.html       # Popup UI
│   └── icons/           # 아이콘 파일
├── src/
│   ├── popup.ts         # Popup 로직
│   ├── content.ts       # Content Script (Storage 수집)
│   ├── background.ts    # Background Service Worker
│   ├── decoderService.ts # 디코더 서비스 (자동 감지)
│   └── decoders/        # 개별 디코더 클래스
│       ├── base64Decoder.ts
│       ├── jwtDecoder.ts
│       └── ...
├── dist/                # 빌드 출력 (gitignore)
└── vite.config.ts       # Vite 설정
```

### 빌드 명령어

```bash
# 프로덕션 빌드
npm run build

# 개발 모드 (watch mode)
npm run dev
```

### 새로운 디코더 추가하기

1. `src/decoders/` 에 새 파일 생성 (예: `myDecoder.ts`)
2. `decode()`와 `canDecode()` 정적 메서드 구현

   ```typescript
   export class MyDecoder {
     static decode(input: string): string {
       // 디코딩 로직
       return result;
     }

     static canDecode(input: string): boolean {
       // 이 형식인지 검증
       return true / false;
     }
   }
   ```

3. `src/decoders/index.ts`에 export 추가
4. `src/decoderService.ts`에 import 및 우선순위 설정

## 🔧 기술 스택

- **TypeScript** - 타입 안전성
- **Vite** - 빠른 빌드 도구
- **Chrome Extension Manifest V3** - 최신 표준
- **Vanilla JavaScript** - 프레임워크 없는 경량화

## 🎯 디자인 원칙

1. **정확도 우선** - 오인식 방지를 위한 엄격한 검증

   - 최소 길이 요구사항
   - 실제 디코딩 테스트
   - 패턴 및 비율 검증

2. **사용자 경험** - 개발자 친화적 UX

   - 자동 감지로 수동 선택 최소화
   - Auto-Fetch로 반복 작업 제거
   - 키보드 단축키 지원

3. **보안 및 프라이버시**
   - 모든 데이터 로컬 처리
   - XSS 방지 (HTML 이스케이프)
   - 최소 권한 원칙

## 📝 권한 설명

| 권한               | 사용 목적                                              |
| ------------------ | ------------------------------------------------------ |
| `storage`          | 다크모드, 디코더 타입, Auto-Fetch 설정 저장            |
| `cookies`          | Auto-Fetch 모드에서 쿠키 데이터 읽기                   |
| `activeTab`        | 현재 탭의 URL 확인 (시스템 페이지 차단용)              |
| `sidePanel`        | Side Panel 모드 제어 (Chrome 114+)                     |
| `host_permissions` | Content Script 주입 (localStorage/sessionStorage 접근) |

> **보안**: Content Script는 사용자가 Auto-Fetch를 활성화할 때만 데이터를 수집하며, 모든 데이터는 로컬에서만 처리됩니다.

## 🤝 기여하기

기여를 환영합니다! 다음과 같은 방법으로 참여할 수 있습니다:

1. 이슈 등록 - 버그 리포트, 기능 제안
2. Pull Request - 코드 개선, 새로운 디코더 추가
3. 문서화 - README, 코드 주석 개선

### 기여 가이드라인

- 커밋 메시지는 명확하게 작성 (feat:, fix:, docs:, refactor: 등)
- TypeScript strict mode 준수
- 새로운 디코더는 테스트 케이스 포함

## 📄 라이센스

Creative Commons NonCommercial (CC BY-NC) - 상업적 이용 금지

## 🙏 크레딧

개발자: [milcho](https://velog.io/@milcho0604/posts)

---

**Universal Decoder로 모든 인코딩 형식을 쉽고 빠르게 디코딩하세요!** 🚀
