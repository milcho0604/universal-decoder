# Chrome Web Store 권한 설명 (간결 버전)

## 한국어 (Chrome Web Store 제출용)

### activeTab

현재 활성 탭의 URL을 확인하여 시스템 페이지를 감지하고, Content Script와 통신하여 웹 페이지의 Storage 데이터(localStorage, sessionStorage, cookie)를 안전하게 가져옵니다. 또한 Side Panel을 열 때 현재 탭이 속한 창을 식별합니다.

### storage

사용자 설정(다크모드, 디코더 타입, Auto-Fetch 모드)을 로컬에 저장하여 다음 사용 시 자동으로 복원합니다. 모든 데이터는 사용자의 기기에만 저장되며 외부 서버로 전송되지 않습니다.

### sidePanel

Chrome 114+ 버전의 Side Panel 기능을 사용하여 확장 프로그램을 사이드 패널로 열 수 있도록 합니다. 팝업 대신 더 넓은 화면에서 디코딩 작업을 수행할 수 있습니다.

---

## English (for Chrome Web Store Submission)

### activeTab

Accesses the currently active tab's URL to detect system pages and communicates with Content Scripts to safely retrieve Storage data (localStorage, sessionStorage, cookies) from web pages. Also identifies the window containing the current tab when opening the Side Panel.

### storage

Stores user preferences (dark mode, decoder type, Auto-Fetch mode) locally to automatically restore them on next use. All data is stored only on the user's device and is never sent to external servers.

### sidePanel

Uses Chrome 114+ Side Panel feature to open the extension in a side panel, providing a wider workspace for decoding tasks instead of the limited popup window.
