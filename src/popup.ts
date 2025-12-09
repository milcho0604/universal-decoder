import { DecoderService, DecoderType } from './decoderService';
import { i18n } from './i18n/i18n';

// Storage 관련 인터페이스
interface StorageItem {
  key: string;
  value: string;
  type: 'localStorage' | 'sessionStorage' | 'cookie';
}

interface StorageData {
  items: StorageItem[];
}

// 히스토리 관련 인터페이스
interface HistoryItem {
  id: string;
  input: string;
  decoderType: DecoderType;
  result: string;
  timestamp: number;
  decoderLabel: string;
}

// DOM 요소
let decoderTypeSelect: HTMLSelectElement;
let inputTextarea: HTMLTextAreaElement;
let decodeButton: HTMLButtonElement;
let clearButton: HTMLButtonElement;
let resultContainer: HTMLDivElement;
let metadataContainer: HTMLDivElement;
let themeToggle: HTMLButtonElement;
let languageToggle: HTMLButtonElement;
let copyButton: HTMLButtonElement;
let detectedTypeBadge: HTMLSpanElement;
let autoFetchToggle: HTMLButtonElement;
let storageSection: HTMLDivElement;
let storageListContainer: HTMLDivElement;
let openSidePanelBtn: HTMLButtonElement;
let openWindowBtn: HTMLButtonElement;
let historySection: HTMLDivElement;
let historyListContainer: HTMLDivElement;
let historyRecentContainer: HTMLDivElement;
let clearHistoryBtn: HTMLButtonElement;
let selectAllCheckbox: HTMLInputElement;
let deleteSelectedBtn: HTMLButtonElement;
let selectedHistoryIds: Set<string> = new Set();

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup script loaded!');

  // DOM 요소 가져오기
  decoderTypeSelect = document.getElementById(
    'decoder-type'
  ) as HTMLSelectElement;
  inputTextarea = document.getElementById('input-text') as HTMLTextAreaElement;
  decodeButton = document.getElementById('decode-btn') as HTMLButtonElement;
  clearButton = document.getElementById('clear-btn') as HTMLButtonElement;
  resultContainer = document.getElementById(
    'result-container'
  ) as HTMLDivElement;
  metadataContainer = document.getElementById(
    'metadata-container'
  ) as HTMLDivElement;
  themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
  languageToggle = document.getElementById('language-toggle') as HTMLButtonElement;
  copyButton = document.getElementById('copy-btn') as HTMLButtonElement;
  detectedTypeBadge = document.getElementById('detected-type-badge') as HTMLSpanElement;
  autoFetchToggle = document.getElementById('auto-fetch-toggle') as HTMLButtonElement;
  storageSection = document.getElementById('storage-section') as HTMLDivElement;
  storageListContainer = document.getElementById('storage-list-container') as HTMLDivElement;
  openSidePanelBtn = document.getElementById('open-sidepanel-btn') as HTMLButtonElement;
  openWindowBtn = document.getElementById('open-window-btn') as HTMLButtonElement;
  historySection = document.getElementById('history-section') as HTMLDivElement;
  historyListContainer = document.getElementById('history-list-container') as HTMLDivElement;
  historyRecentContainer = document.getElementById('history-recent-container') as HTMLDivElement;
  clearHistoryBtn = document.getElementById('clear-history-btn') as HTMLButtonElement;
  selectAllCheckbox = document.getElementById('select-all-checkbox') as HTMLInputElement;
  deleteSelectedBtn = document.getElementById('delete-selected-btn') as HTMLButtonElement;

  console.log('DOM elements loaded');

  // 초기 상태: 복사 버튼 비활성화
  copyButton.disabled = true;
  copyButton.style.opacity = '0.5';
  copyButton.style.cursor = 'not-allowed';

  // 언어 초기화 (가장 먼저!)
  await initializeLanguage();

  // 다크모드 초기화
  initializeTheme();

  // Auto-Fetch 모드 초기화
  initializeAutoFetch();

  // 디코더 옵션 초기화 및 저장된 타입 불러오기
  await initializeDecoderOptions();
  console.log('Decoder options initialized');

  // 이벤트 리스너 등록
  decodeButton.addEventListener('click', handleDecode);
  clearButton.addEventListener('click', handleClear);
  copyButton.addEventListener('click', handleCopy);

  // 디코더 타입 변경 시 저장
  decoderTypeSelect.addEventListener('change', () => {
    console.log('Decoder type changed event fired!');
    saveDecoderType();
  });

  // 개발자 블로그 링크
  const devBlogLink = document.getElementById(
    'dev-blog-link'
  ) as HTMLButtonElement;
  devBlogLink.addEventListener('click', () => {
    window.open(
      'https://velog.io/@milcho0604/posts',
      '_blank',
      'noopener,noreferrer'
    );
  });

  console.log('Event listeners registered');
  inputTextarea.addEventListener('input', handleInputChange);
  inputTextarea.addEventListener('paste', () => {
    // 붙여넣기 후 자동 디코딩 (자동 감지 모드일 때)
    setTimeout(() => {
      if (decoderTypeSelect.value === 'auto') {
        handleDecode();
      }
    }, 100);
  });

  // Enter로 디코딩 (Shift+Enter는 줄바꿈 허용)
  inputTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDecode();
    }
  });

  // ESC로 팝업 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.close();
    }
  });

  // 다크모드 토글 버튼
  themeToggle.addEventListener('click', toggleTheme);

  // 언어 토글 버튼
  languageToggle.addEventListener('click', toggleLanguage);

  // Auto-Fetch 토글 버튼
  autoFetchToggle.addEventListener('click', toggleAutoFetch);

  // Side Panel 열기 버튼
  openSidePanelBtn.addEventListener('click', openSidePanel);

  // 새 창 열기 버튼
  openWindowBtn.addEventListener('click', openNewWindow);

  // 히스토리 초기화
  await initializeHistory();

  // 히스토리 삭제 버튼
  clearHistoryBtn.addEventListener('click', clearAllHistory);

  // 전체 선택 체크박스
  selectAllCheckbox.addEventListener('change', handleSelectAll);

  // 선택 삭제 버튼
  deleteSelectedBtn.addEventListener('click', deleteSelectedHistory);
});

/**
 * 다크모드 초기화
 */
async function initializeTheme() {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const result = await chrome.storage.local.get(['darkMode']);
      if (result.darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
      } else {
        themeToggle.textContent = '🌙';
      }
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
}

/**
 * 다크모드 토글
 */
async function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  themeToggle.textContent = isDarkMode ? '☀️' : '🌙';

  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ darkMode: isDarkMode });
    }
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
}

/**
 * 언어 초기화
 */
async function initializeLanguage() {
  try {
    await i18n.loadLanguage();
    i18n.updatePageText();

    // 언어 버튼 텍스트 업데이트
    const langBtn = languageToggle.querySelector('span');
    if (langBtn) {
      langBtn.textContent = i18n.t('language.current');
    }

    // 디코더 옵션 초기화 (언어가 설정된 후)
    updateDecoderOptions();
  } catch (error) {
    console.error('Failed to initialize language:', error);
  }
}

/**
 * 언어 토글
 */
async function toggleLanguage() {
  i18n.toggleLanguage();
  await i18n.saveLanguage();
  i18n.updatePageText();

  // 언어 버튼 텍스트 업데이트
  const langBtn = languageToggle.querySelector('span');
  if (langBtn) {
    langBtn.textContent = i18n.t('language.current');
  }

  // 디코더 옵션 다시 생성
  updateDecoderOptions();

  // 히스토리 다시 로드 (번역된 라벨로 업데이트)
  await loadHistory();
}

/**
 * 디코더 옵션 업데이트 (언어 변경 시)
 */
function updateDecoderOptions() {
  const currentValue = decoderTypeSelect.value;
  const decoders = DecoderService.getAvailableDecoders();
  decoderTypeSelect.innerHTML = '';

  decoders.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    // 번역된 라벨 사용
    option.textContent = i18n.t(`decoder.${value}`);
    decoderTypeSelect.appendChild(option);
  });

  // 이전 선택값 복원
  if (decoderTypeSelect.querySelector(`option[value="${currentValue}"]`)) {
    decoderTypeSelect.value = currentValue;
  }
}

/**
 * Auto-Fetch 모드 초기화
 */
async function initializeAutoFetch() {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const result = await chrome.storage.local.get(['autoFetchMode']);
      if (result.autoFetchMode) {
        autoFetchToggle.classList.add('active');
        storageSection.style.display = 'block';
        await fetchStorageData();
      }
    }
  } catch (error) {
    console.error('Failed to load auto-fetch preference:', error);
  }
}

/**
 * Auto-Fetch 모드 토글
 */
async function toggleAutoFetch() {
  const isActive = autoFetchToggle.classList.toggle('active');

  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ autoFetchMode: isActive });
    }
  } catch (error) {
    console.error('Failed to save auto-fetch preference:', error);
  }

  if (isActive) {
    storageSection.style.display = 'block';
    await fetchStorageData();
  } else {
    storageSection.style.display = 'none';
  }
}

/**
 * Content Script로부터 Storage 데이터 가져오기
 */
async function fetchStorageData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id || !tab.url) {
      showStorageError('현재 탭을 찾을 수 없습니다.');
      return;
    }

    // chrome://, edge://, about:, file:// 등 특수 페이지 체크
    const url = tab.url.toLowerCase();
    if (
      // url.startsWith('chrome://') ||
      // url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('file://') ||
      url.startsWith('view-source:')
    ) {
      showStorageError('이 페이지에서는 Storage에 접근할 수 없습니다.\n(브라우저 시스템 페이지)');
      return;
    }

    // Content script로 메시지 전송
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'fetchStorageData'
    }) as StorageData;

    if (response && response.items) {
      updateStorageList(response.items);
    } else {
      showStorageError('Storage 데이터를 가져올 수 없습니다.');
    }
  } catch (error) {
    console.error('Failed to fetch storage data:', error);
    showStorageError('Storage 데이터를 가져오는데 실패했습니다.\n페이지를 새로고침 후 다시 시도해주세요.');
  }
}

/**
 * Storage 리스트 UI 업데이트
 */
function updateStorageList(items: StorageItem[]) {
  storageListContainer.innerHTML = '';
  storageListContainer.classList.add('visible');

  if (items.length === 0) {
    storageListContainer.innerHTML = `<div class="storage-list-empty">${i18n.t('storage.noItems')}</div>`;
    return;
  }

  items.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'storage-item';
    itemDiv.innerHTML = `
      <div class="storage-item-header">
        <span class="storage-item-key">${escapeHtml(item.key)}</span>
        <span class="storage-item-type">${item.type}</span>
      </div>
      <div class="storage-item-value">${escapeHtml(item.value)}</div>
    `;

    // 클릭 시 자동으로 입력하고 디코딩
    itemDiv.addEventListener('click', () => {
      inputTextarea.value = item.value;
      handleDecode();
    });

    storageListContainer.appendChild(itemDiv);
  });
}

/**
 * Storage 에러 표시
 */
function showStorageError(message: string) {
  storageListContainer.innerHTML = `<div class="storage-list-empty">${escapeHtml(message)}</div>`;
  storageListContainer.classList.add('visible');
}

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 디코더 옵션 초기화 및 저장된 타입 불러오기
 */
async function initializeDecoderOptions() {
  // 저장된 디코더 타입 불러오기
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      console.log('Loading saved decoder type...');
      const result = await chrome.storage.local.get(['decoderType']);
      console.log('Storage result:', result);

      if (
        result.decoderType &&
        decoderTypeSelect.querySelector(`option[value="${result.decoderType}"]`)
      ) {
        decoderTypeSelect.value = result.decoderType;
        console.log('✅ Loaded decoder type:', result.decoderType);
      } else {
        console.log('No saved decoder type or invalid value');
      }
    } else {
      console.warn('❌ Chrome storage API not available');
    }
  } catch (error) {
    console.error('❌ Failed to load saved decoder type:', error);
    console.error('Error stack:', (error as Error).stack);
  }
}

/**
 * 디코더 타입 저장
 */
async function saveDecoderType() {
  const selectedValue = decoderTypeSelect.value;
  console.log('🔵 saveDecoderType called with value:', selectedValue);

  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      console.log('Setting decoder type to storage...');
      await chrome.storage.local.set({
        decoderType: selectedValue,
      });
      console.log('✅ Decoder type saved successfully:', selectedValue);
    } else {
      console.warn('❌ Chrome storage API not available');
    }
  } catch (error) {
    console.error('❌ Failed to save decoder type:', error);
    console.error('Error stack:', (error as Error).stack);
  }
}

/**
 * 입력 변경 시 자동 감지 업데이트
 */
function handleInputChange() {
  if (decoderTypeSelect.value === 'auto' && inputTextarea.value.trim()) {
    const detected = DecoderService.detectDecoder(inputTextarea.value);
    if (detected !== 'auto') {
      // 자동 감지된 타입을 선택 (UI 업데이트는 하지 않음)
      // 사용자가 직접 선택한 경우를 존중
    }
  }
}

/**
 * 디코딩 실행
 */
async function handleDecode() {
  const input = inputTextarea.value.trim();

  if (!input) {
    showResult('', false, i18n.t('result.inputEmpty'));
    return;
  }

  const decoderType = decoderTypeSelect.value as DecoderType;

  // 로딩 표시
  showResult(i18n.t('result.decoding'), false);
  decodeButton.disabled = true;

  try {
    const result = await DecoderService.decode(input, decoderType);

    if (result.success) {
      showResult(result.result, true, undefined, result.metadata);

      // 히스토리에 저장
      await saveToHistory(input, decoderType, result.result, result.type);

      // 자동 감지 모드에서 감지된 타입이 있으면 뱃지 표시
      if (decoderType === 'auto' && result.type !== 'auto') {
        const detectedLabel =
          DecoderService.getAvailableDecoders().find(
            (d) => d.value === result.type
          )?.label || '';
        if (detectedLabel) {
          detectedTypeBadge.textContent = `✓ ${detectedLabel}`;
          detectedTypeBadge.style.display = 'inline-block';
        }
      } else {
        detectedTypeBadge.style.display = 'none';
      }
    } else {
      showResult(result.error || '디코딩 실패', false, result.error);
      detectedTypeBadge.style.display = 'none';
    }
  } catch (error) {
    showResult('오류가 발생했습니다: ' + (error as Error).message, false);
  } finally {
    decodeButton.disabled = false;
  }
}

/**
 * 결과 표시
 */
function showResult(
  text: string,
  success: boolean,
  error?: string,
  metadata?: any
) {
  resultContainer.textContent = text || i18n.t('result.noResult');

  // 클래스 초기화
  resultContainer.classList.remove('empty', 'success', 'error');

  if (!text || text === i18n.t('result.empty')) {
    resultContainer.classList.add('empty');
    copyButton.disabled = true;
    copyButton.style.opacity = '0.5';
    copyButton.style.cursor = 'not-allowed';
  } else if (error || !success) {
    resultContainer.classList.add('error');
    // 에러 메시지도 복사 가능하도록 활성화
    copyButton.disabled = false;
    copyButton.style.opacity = '1';
    copyButton.style.cursor = 'pointer';
  } else {
    resultContainer.classList.add('success');
    copyButton.disabled = false;
    copyButton.style.opacity = '1';
    copyButton.style.cursor = 'pointer';
  }

  // 메타데이터 표시 (JWT 등)
  if (metadata) {
    metadataContainer.style.display = 'block';
    let metadataHtml = '';

    if (metadata.header) {
      metadataHtml += `<div class="metadata-title">${i18n.t('metadata.jwtHeader')}</div>`;
      metadataHtml += `<pre style="margin: 4px 0; white-space: pre-wrap;">${JSON.stringify(
        metadata.header,
        null,
        2
      )}</pre>`;
    }

    if (metadata.payload) {
      metadataHtml += `<div class="metadata-title" style="margin-top: 8px;">${i18n.t('metadata.jwtPayload')}</div>`;
      metadataHtml += `<pre style="margin: 4px 0; white-space: pre-wrap;">${JSON.stringify(
        metadata.payload,
        null,
        2
      )}</pre>`;
    }

    metadataContainer.innerHTML = metadataHtml;
  } else {
    metadataContainer.style.display = 'none';
    metadataContainer.innerHTML = '';
  }
}

/**
 * 결과 복사
 */
async function handleCopy() {
  const resultText = resultContainer.textContent || '';

  // 결과가 없거나 빈 상태일 때는 복사하지 않음
  if (
    !resultText ||
    resultText === i18n.t('result.empty') ||
    resultText === i18n.t('result.noResult') ||
    resultText === i18n.t('result.decoding') ||
    resultContainer.classList.contains('empty')
  ) {
    return;
  }

  try {
    // 클립보드에 복사
    await navigator.clipboard.writeText(resultText);

    // 복사 성공 피드백
    const originalText = copyButton.textContent;
    copyButton.textContent = i18n.t('button.copied');
    copyButton.classList.add('copied');

    // 2초 후 원래 텍스트로 복원
    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('복사 실패:', error);
    // 클립보드 API가 실패하면 fallback 방법 시도
    try {
      const textArea = document.createElement('textarea');
      textArea.value = resultText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      const originalText = copyButton.textContent;
      copyButton.textContent = i18n.t('button.copied');
      copyButton.classList.add('copied');

      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.classList.remove('copied');
      }, 2000);
    } catch (fallbackError) {
      console.error('Fallback 복사도 실패:', fallbackError);
      copyButton.textContent = i18n.t('button.copyFailed');
      setTimeout(() => {
        copyButton.textContent = i18n.t('button.copy');
      }, 2000);
    }
  }
}

/**
 * 초기화
 */
function handleClear() {
  inputTextarea.value = '';
  showResult(i18n.t('result.empty'), false);
  decoderTypeSelect.value = 'auto';
  metadataContainer.style.display = 'none';
  detectedTypeBadge.style.display = 'none';
  copyButton.textContent = i18n.t('button.copy');
  copyButton.classList.remove('copied');
  inputTextarea.focus();
}

/**
 * Side Panel 열기
 */
async function openSidePanel() {
  try {
    // 현재 탭의 windowId 가져오기
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const windowId = tab.windowId;

    const response = await chrome.runtime.sendMessage({
      action: 'openSidePanel',
      windowId: windowId
    });

    if (response && response.success) {
      console.log('Side Panel opened successfully');
      // Popup 닫기 (선택사항)
      // window.close();
    } else {
      console.error('Failed to open side panel:', response?.error);
      alert('Side Panel을 열 수 없습니다.\n' + (response?.error || '알 수 없는 오류'));
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    alert('Side Panel을 열 수 없습니다.');
  }
}

/**
 * 새 창으로 열기
 */
async function openNewWindow() {
  try {
    await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 500,
      height: 620,
    });
    console.log('New window opened');
  } catch (error) {
    console.error('Failed to open new window:', error);
    alert('새 창을 열 수 없습니다.');
  }
}

/**
 * 히스토리 초기화 및 로드
 */
async function initializeHistory() {
  try {
    await loadHistory();
  } catch (error) {
    console.error('Failed to initialize history:', error);
  }
}

/**
 * 히스토리 저장
 */
async function saveToHistory(
  input: string,
  decoderType: DecoderType,
  result: string,
  actualType: DecoderType
) {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      // 기존 히스토리 가져오기
      const storageResult = await chrome.storage.local.get(['decoderHistory']);
      const history: HistoryItem[] = storageResult.decoderHistory || [];

      // 디코더 라벨 가져오기
      const targetType = actualType !== 'auto' ? actualType : decoderType;
      const decoderLabel =
        DecoderService.getAvailableDecoders().find(
          (d) => d.value === targetType
        )?.label || i18n.t('decoder.auto');

      // 새 히스토리 항목 생성
      const newItem: HistoryItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        input: input.substring(0, 200), // 최대 200자로 제한
        decoderType: actualType !== 'auto' ? actualType : decoderType,
        result: result.substring(0, 200), // 최대 200자로 제한
        timestamp: Date.now(),
        decoderLabel: decoderLabel,
      };

      // 최신 항목을 맨 앞에 추가
      history.unshift(newItem);

      // 최대 50개까지만 저장
      const maxHistory = 50;
      if (history.length > maxHistory) {
        history.splice(maxHistory);
      }

      // 저장
      await chrome.storage.local.set({ decoderHistory: history });

      // UI 업데이트
      await loadHistory();
    }
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * 히스토리 로드 및 표시
 */
async function loadHistory() {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const storageResult = await chrome.storage.local.get(['decoderHistory']);
      const history: HistoryItem[] = storageResult.decoderHistory || [];

      updateHistoryList(history);
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

/**
 * 히스토리 리스트 UI 업데이트
 */
function updateHistoryList(history: HistoryItem[]) {
  historyListContainer.innerHTML = '';
  historyRecentContainer.innerHTML = '';
  selectedHistoryIds.clear();

  if (history.length === 0) {
    historySection.style.display = 'none';
    updateSelectionUI();
    return;
  }

  historySection.style.display = 'block';

  // 최근 1개 항목 표시 (드롭다운 형태)
  const recentItem = history[0];
  const recentItemDiv = createHistoryItem(recentItem, true, history.length > 1);
  historyRecentContainer.appendChild(recentItemDiv);

  // 나머지 항목들 (2개 이상일 때만)
  if (history.length > 1) {
    const remainingItems = history.slice(1);
    
    remainingItems.forEach((item) => {
      const itemDiv = createHistoryItem(item, false);
      historyListContainer.appendChild(itemDiv);
    });
    
    // 펼침 상태 초기화
    historyListContainer.classList.remove('visible');
  } else {
    historyListContainer.classList.remove('visible');
  }

  updateSelectionUI();
}

/**
 * 히스토리 항목 생성
 */
function createHistoryItem(item: HistoryItem, isRecent: boolean = false, hasMore: boolean = false): HTMLDivElement {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'history-item';
  if (isRecent) {
    itemDiv.classList.add('history-item-recent');
  }

  // 시간 포맷팅
  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 입력 텍스트 미리보기 (긴 경우 자르기)
  const inputPreview =
    item.input.length > 60
      ? item.input.substring(0, 60) + '...'
      : item.input;

  // 최근 항목이고 더 많은 항목이 있을 때 화살표 추가
  const arrowIcon = isRecent && hasMore ? '<button class="history-item-arrow" title="목록 펼치기/접기">▼</button>' : '';

  itemDiv.innerHTML = `
    <div class="history-item-checkbox">
      <input type="checkbox" class="history-checkbox" data-id="${item.id}" id="history-${item.id}">
      <label for="history-${item.id}"></label>
    </div>
    <div class="history-item-actions">
      ${arrowIcon}
      <button class="history-item-delete" data-id="${item.id}" title="삭제">🗑️</button>
    </div>
    <div class="history-item-header">
      <span class="history-item-type">${escapeHtml(item.decoderLabel)}</span>
      <span class="history-item-time">${escapeHtml(timeStr)}</span>
    </div>
    <div class="history-item-input">${escapeHtml(inputPreview)}</div>
  `;

  // 최근 항목이고 더 많은 항목이 있을 때 드롭다운 토글
  if (isRecent && hasMore) {
    itemDiv.addEventListener('click', (e) => {
      // 삭제 버튼 클릭은 무시
      if ((e.target as HTMLElement).classList.contains('history-item-delete')) {
        return;
      }
      
      // 화살표 버튼 클릭 시 드롭다운 토글
      if ((e.target as HTMLElement).classList.contains('history-item-arrow') || 
          (e.target as HTMLElement).closest('.history-item-arrow')) {
        e.stopPropagation();
        toggleHistoryExpand();
        return;
      }

      // 체크박스 클릭은 무시
      if ((e.target as HTMLElement).closest('.history-item-checkbox')) {
        return;
      }

      // 항목 클릭 시 입력 필드에 복원하고 디코딩
      inputTextarea.value = item.input;
      decoderTypeSelect.value = item.decoderType;
      handleDecode();
    });
  } else {
    // 일반 항목 클릭 시 입력 필드에 복원하고 디코딩
    itemDiv.addEventListener('click', (e) => {
      // 삭제 버튼 클릭은 무시
      if ((e.target as HTMLElement).classList.contains('history-item-delete')) {
        return;
      }

      // 체크박스 클릭은 무시
      if ((e.target as HTMLElement).closest('.history-item-checkbox')) {
        return;
      }

      inputTextarea.value = item.input;
      decoderTypeSelect.value = item.decoderType;
      handleDecode();
    });
  }

  // 삭제 버튼 이벤트
  const deleteBtn = itemDiv.querySelector(
    '.history-item-delete'
  ) as HTMLButtonElement;
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteHistoryItem(item.id);
    });
  }

  // 화살표 버튼 이벤트 (최근 항목일 때만)
  if (isRecent && hasMore) {
    const arrowBtn = itemDiv.querySelector(
      '.history-item-arrow'
    ) as HTMLButtonElement;
    if (arrowBtn) {
      arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHistoryExpand();
      });
    }
  }

  // 체크박스 이벤트
  const checkbox = itemDiv.querySelector(
    '.history-checkbox'
  ) as HTMLInputElement;
  if (checkbox) {
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const isChecked = checkbox.checked;
      if (isChecked) {
        selectedHistoryIds.add(item.id);
      } else {
        selectedHistoryIds.delete(item.id);
      }
      updateSelectionUI();
    });
  }

  return itemDiv;
}

/**
 * 히스토리 펼치기/접기 토글
 */
function toggleHistoryExpand() {
  const isExpanded = historyListContainer.classList.contains('visible');
  const arrow = historyRecentContainer.querySelector('.history-item-arrow') as HTMLButtonElement;
  
  if (isExpanded) {
    historyListContainer.classList.remove('visible');
    if (arrow) {
      arrow.textContent = '▼';
      arrow.classList.remove('expanded');
      arrow.title = '목록 펼치기';
    }
  } else {
    historyListContainer.classList.add('visible');
    if (arrow) {
      arrow.textContent = '▲';
      arrow.classList.add('expanded');
      arrow.title = '목록 접기';
    }
  }
}

/**
 * 히스토리 항목 삭제
 */
async function deleteHistoryItem(id: string) {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const storageResult = await chrome.storage.local.get(['decoderHistory']);
      const history: HistoryItem[] = storageResult.decoderHistory || [];

      const filtered = history.filter((item) => item.id !== id);
      await chrome.storage.local.set({ decoderHistory: filtered });

      await loadHistory();
    }
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
}

/**
 * 전체 히스토리 삭제
 */
async function clearAllHistory() {
  if (
    !confirm(i18n.t('history.confirmDeleteAll'))
  ) {
    return;
  }

  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ decoderHistory: [] });
      selectedHistoryIds.clear();
      await loadHistory();
    }
  } catch (error) {
    console.error('Failed to clear history:', error);
    alert(i18n.t('history.deleteFailed'));
  }
}

/**
 * 전체 선택/해제
 */
function handleSelectAll() {
  const isChecked = selectAllCheckbox.checked;
  const allCheckboxes = document.querySelectorAll('.history-checkbox') as NodeListOf<HTMLInputElement>;
  
  allCheckboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
    const id = checkbox.getAttribute('data-id');
    if (id) {
      if (isChecked) {
        selectedHistoryIds.add(id);
      } else {
        selectedHistoryIds.delete(id);
      }
    }
  });
  
  updateSelectionUI();
}

/**
 * 선택된 히스토리 삭제
 */
async function deleteSelectedHistory() {
  if (selectedHistoryIds.size === 0) {
    alert(i18n.t('history.selectFirst'));
    return;
  }

  if (
    !confirm(`${i18n.t('history.deleteSelected')} ${selectedHistoryIds.size}${i18n.t('history.confirmDeleteSelected')}`)
  ) {
    return;
  }

  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const storageResult = await chrome.storage.local.get(['decoderHistory']);
      const history: HistoryItem[] = storageResult.decoderHistory || [];

      const filtered = history.filter((item) => !selectedHistoryIds.has(item.id));
      await chrome.storage.local.set({ decoderHistory: filtered });

      selectedHistoryIds.clear();
      await loadHistory();
    }
  } catch (error) {
    console.error('Failed to delete selected history:', error);
    alert(i18n.t('history.deleteFailed'));
  }
}

/**
 * 선택 UI 업데이트
 */
function updateSelectionUI() {
  const totalCount = document.querySelectorAll('.history-checkbox').length;
  const selectedCount = selectedHistoryIds.size;
  
  // 전체 선택 체크박스 상태 업데이트
  if (totalCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (selectedCount === totalCount) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else if (selectedCount > 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  }

  // 선택 삭제 버튼 상태 업데이트
  if (selectedCount > 0) {
    deleteSelectedBtn.disabled = false;
    deleteSelectedBtn.textContent = `${i18n.t('history.deleteSelected')} (${selectedCount})`;
    deleteSelectedBtn.style.opacity = '1';
  } else {
    deleteSelectedBtn.disabled = true;
    deleteSelectedBtn.textContent = i18n.t('history.deleteSelected');
    deleteSelectedBtn.style.opacity = '0.5';
  }
}
