import { DecoderService, DecoderType } from './decoderService';

// DOM 요소
let decoderTypeSelect: HTMLSelectElement;
let inputTextarea: HTMLTextAreaElement;
let decodeButton: HTMLButtonElement;
let clearButton: HTMLButtonElement;
let resultContainer: HTMLDivElement;
let metadataContainer: HTMLDivElement;
let themeToggle: HTMLButtonElement;

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

  console.log('DOM elements loaded');

  // 다크모드 초기화
  initializeTheme();

  // 디코더 옵션 초기화 및 저장된 타입 불러오기
  await initializeDecoderOptions();
  console.log('Decoder options initialized');

  // 이벤트 리스너 등록
  decodeButton.addEventListener('click', handleDecode);
  clearButton.addEventListener('click', handleClear);

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

      // 자동 감지 모드에서 감지된 타입이 있으면 선택 표시
      if (decoderType === 'auto' && result.type !== 'auto') {
        const detectedLabel =
          DecoderService.getAvailableDecoders().find(
            (d) => d.value === result.type
          )?.label || '';
        // 선택은 유지하되, 사용자에게 알림 (선택적)
      }
    } else {
      showResult(result.error || '디코딩 실패', false, result.error);
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
  } else if (error || !success) {
    resultContainer.classList.add('error');
  } else {
    resultContainer.classList.add('success');
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
 * 초기화
 */
function handleClear() {
  inputTextarea.value = '';
  showResult('결과가 여기에 표시됩니다...', false);
  decoderTypeSelect.value = 'auto';
  metadataContainer.style.display = 'none';
  inputTextarea.focus();
}
