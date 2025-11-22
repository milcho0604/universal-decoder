import { DecoderService, DecoderType } from './decoderService';

// Storage 관련 인터페이스
interface StorageItem {
  key: string;
  value: string;
  type: 'localStorage' | 'sessionStorage' | 'cookie';
}

interface StorageData {
  items: StorageItem[];
}

// DOM 요소
let decoderTypeSelect: HTMLSelectElement;
let inputTextarea: HTMLTextAreaElement;
let decodeButton: HTMLButtonElement;
let clearButton: HTMLButtonElement;
let resultContainer: HTMLDivElement;
let metadataContainer: HTMLDivElement;
let themeToggle: HTMLButtonElement;
let copyButton: HTMLButtonElement;
let detectedTypeBadge: HTMLSpanElement;
let autoFetchToggle: HTMLButtonElement;
let storageSection: HTMLDivElement;
let storageListContainer: HTMLDivElement;

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
  copyButton = document.getElementById('copy-btn') as HTMLButtonElement;
  detectedTypeBadge = document.getElementById('detected-type-badge') as HTMLSpanElement;
  autoFetchToggle = document.getElementById('auto-fetch-toggle') as HTMLButtonElement;
  storageSection = document.getElementById('storage-section') as HTMLDivElement;
  storageListContainer = document.getElementById('storage-list-container') as HTMLDivElement;

  console.log('DOM elements loaded');

  // 초기 상태: 복사 버튼 비활성화
  copyButton.disabled = true;
  copyButton.style.opacity = '0.5';
  copyButton.style.cursor = 'not-allowed';

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

  // Auto-Fetch 토글 버튼
  autoFetchToggle.addEventListener('click', toggleAutoFetch);
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
    storageListContainer.innerHTML = '<div class="storage-list-empty">Storage 항목이 없습니다.</div>';
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
  const decoders = DecoderService.getAvailableDecoders();
  decoderTypeSelect.innerHTML = '';

  decoders.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    decoderTypeSelect.appendChild(option);
  });

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
    showResult('', false, '입력이 비어있습니다.');
    return;
  }

  const decoderType = decoderTypeSelect.value as DecoderType;

  // 로딩 표시
  showResult('디코딩 중...', false);
  decodeButton.disabled = true;

  try {
    const result = await DecoderService.decode(input, decoderType);

    if (result.success) {
      showResult(result.result, true, undefined, result.metadata);

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
  resultContainer.textContent = text || '결과가 없습니다.';

  // 클래스 초기화
  resultContainer.classList.remove('empty', 'success', 'error');

  if (!text || text === '결과가 여기에 표시됩니다...') {
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
      metadataHtml += `<div class="metadata-title">JWT Header:</div>`;
      metadataHtml += `<pre style="margin: 4px 0; white-space: pre-wrap;">${JSON.stringify(
        metadata.header,
        null,
        2
      )}</pre>`;
    }

    if (metadata.payload) {
      metadataHtml += `<div class="metadata-title" style="margin-top: 8px;">JWT Payload:</div>`;
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
    resultText === '결과가 여기에 표시됩니다...' ||
    resultText === '결과가 없습니다.' ||
    resultText === '디코딩 중...' ||
    resultContainer.classList.contains('empty')
  ) {
    return;
  }

  try {
    // 클립보드에 복사
    await navigator.clipboard.writeText(resultText);

    // 복사 성공 피드백
    const originalText = copyButton.textContent;
    copyButton.textContent = '✅ 복사됨';
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
      copyButton.textContent = '✅ 복사됨';
      copyButton.classList.add('copied');

      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.classList.remove('copied');
      }, 2000);
    } catch (fallbackError) {
      console.error('Fallback 복사도 실패:', fallbackError);
      copyButton.textContent = '❌ 실패';
      setTimeout(() => {
        copyButton.textContent = '📋 복사';
      }, 2000);
    }
  }
}

/**
 * 초기화
 */
function handleClear() {
  inputTextarea.value = '';
  showResult('결과가 여기에 표시됩니다...', false);
  decoderTypeSelect.value = 'auto';
  metadataContainer.style.display = 'none';
  detectedTypeBadge.style.display = 'none';
  copyButton.textContent = '📋 복사';
  copyButton.classList.remove('copied');
  inputTextarea.focus();
}
