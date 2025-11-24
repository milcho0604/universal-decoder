# Chrome Web Store 권한 사용 이유 (Permissions Justification)

## 한국어 버전

### 1. `activeTab` 권한

**사용 목적:**

- 현재 활성 탭의 URL을 확인하여 브라우저 시스템 페이지(chrome://, edge://, about:, file:// 등)를 감지하고, 해당 페이지에서는 Storage 접근 기능을 차단합니다.
- Content Script와 통신하여 웹 페이지의 localStorage, sessionStorage, cookie 데이터를 안전하게 가져옵니다 (Auto-Fetch 기능).
- Side Panel을 열 때 현재 탭이 속한 창(windowId)을 식별합니다.

**구체적 사용 위치:**

- `src/popup.ts`의 `fetchStorageData()` 함수: 현재 탭 정보 조회 및 Content Script로 메시지 전송
- `src/popup.ts`의 `openSidePanel()` 함수: 현재 탭의 windowId 가져오기

**보안 고려사항:**

- 사용자가 확장 프로그램 아이콘을 클릭한 경우에만 활성 탭에 접근합니다.
- 시스템 페이지에서는 자동으로 기능을 차단하여 보안을 보장합니다.

---

### 2. `storage` 권한

**사용 목적:**

- 사용자 설정을 로컬에 저장하여 다음 사용 시 자동으로 복원합니다.
  - **다크모드 설정**: 사용자의 테마 선호도 저장
  - **디코더 타입 설정**: 마지막으로 선택한 디코더 타입 저장 (자동/수동 선택)
  - **Auto-Fetch 모드 설정**: Storage 자동 가져오기 기능의 활성화 상태 저장

**구체적 사용 위치:**

- `src/popup.ts`의 `initializeTheme()` / `toggleTheme()`: 다크모드 설정 저장/불러오기
- `src/popup.ts`의 `initializeAutoFetch()` / `toggleAutoFetch()`: Auto-Fetch 모드 설정 저장/불러오기
- `src/popup.ts`의 `initializeDecoderOptions()` / `saveDecoderType()`: 디코더 타입 설정 저장/불러오기

**데이터 처리:**

- 모든 데이터는 `chrome.storage.local`에 저장되며, 사용자의 로컬 기기에만 저장됩니다.
- 외부 서버로 전송되지 않으며, 완전히 오프라인에서 동작합니다.

---

### 3. `sidePanel` 권한

**사용 목적:**

- Chrome 114+ 버전에서 제공하는 Side Panel 기능을 사용하여 확장 프로그램을 사이드 패널로 열 수 있도록 합니다.
- 사용자가 팝업 대신 더 넓은 화면에서 디코딩 작업을 수행할 수 있도록 합니다.

**구체적 사용 위치:**

- `src/background.ts`: Side Panel API를 사용하여 사이드 패널 열기
- `src/popup.ts`의 `openSidePanel()` 함수: 사용자가 Side Panel 열기 버튼을 클릭할 때 호출

**사용자 경험:**

- 팝업 창의 제한된 공간 대신 더 넓은 작업 공간을 제공합니다.
- 사용자가 선택적으로 사용할 수 있는 기능입니다.

---

## English Version (for Chrome Web Store Submission)

### 1. `activeTab` Permission

**Purpose:**

- Access the currently active tab's URL to detect browser system pages (chrome://, edge://, about:, file://, etc.) and block Storage access functionality on those pages.
- Communicate with Content Scripts to safely retrieve localStorage, sessionStorage, and cookie data from web pages (Auto-Fetch feature).
- Identify the window (windowId) that the current tab belongs to when opening the Side Panel.

**Specific Usage:**

- `src/popup.ts` `fetchStorageData()` function: Query current tab information and send messages to Content Script
- `src/popup.ts` `openSidePanel()` function: Get the current tab's windowId

**Security Considerations:**

- Only accesses the active tab when the user clicks the extension icon.
- Automatically blocks functionality on system pages to ensure security.

---

### 2. `storage` Permission

**Purpose:**

- Store user preferences locally to automatically restore them on next use:
  - **Dark mode setting**: Save user's theme preference
  - **Decoder type setting**: Save the last selected decoder type (auto/manual selection)
  - **Auto-Fetch mode setting**: Save the activation state of the Storage auto-fetch feature

**Specific Usage:**

- `src/popup.ts` `initializeTheme()` / `toggleTheme()`: Save/load dark mode setting
- `src/popup.ts` `initializeAutoFetch()` / `toggleAutoFetch()`: Save/load Auto-Fetch mode setting
- `src/popup.ts` `initializeDecoderOptions()` / `saveDecoderType()`: Save/load decoder type setting

**Data Handling:**

- All data is stored in `chrome.storage.local` and only on the user's local device.
- No data is sent to external servers, and the extension operates completely offline.

---

### 3. `sidePanel` Permission

**Purpose:**

- Use the Side Panel feature available in Chrome 114+ to open the extension in a side panel.
- Allow users to perform decoding tasks in a wider screen space instead of the popup window.

**Specific Usage:**

- `src/background.ts`: Use Side Panel API to open the side panel
- `src/popup.ts` `openSidePanel()` function: Called when user clicks the Side Panel open button

**User Experience:**

- Provides a wider workspace instead of the limited popup window space.
- This is an optional feature that users can choose to use.

---

## Summary

All three permissions are essential for the core functionality of the Universal Decoder extension:

- **activeTab**: Required for accessing current tab information and communicating with web pages
- **storage**: Required for saving user preferences and settings
- **sidePanel**: Required for providing the Side Panel feature as an alternative to the popup

All permissions are used only when necessary and follow Chrome's security best practices.
