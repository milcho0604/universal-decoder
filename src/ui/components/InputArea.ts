/**
 * 입력 영역 컴포넌트
 */
import { i18n } from '../../i18n/i18n';

export class InputArea {
  private textareaElement: HTMLTextAreaElement;
  private copyButton: HTMLButtonElement | null = null;

  constructor(textareaElement: HTMLTextAreaElement, copyButton?: HTMLButtonElement) {
    this.textareaElement = textareaElement;
    this.copyButton = copyButton || null;
  }

  /**
   * 초기화
   */
  initialize(): void {
    this.setupEventListeners();
    if (this.copyButton) {
      this.setupCopyButton();
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // Enter로 디코딩 (Shift+Enter는 줄바꿈 허용)
    this.textareaElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.textareaElement.dispatchEvent(new CustomEvent('decode-requested'));
      }
    });
  }

  /**
   * 입력 값 가져오기
   */
  getValue(): string {
    return this.textareaElement.value.trim();
  }

  /**
   * 입력 값 설정
   */
  setValue(value: string): void {
    this.textareaElement.value = value;
    this.updateCopyButtonState();
  }

  /**
   * 초기화
   */
  clear(): void {
    this.textareaElement.value = '';
    this.updateCopyButtonState();
  }

  /**
   * 포커스
   */
  focus(): void {
    this.textareaElement.focus();
  }

  /**
   * 입력 변경 이벤트 리스너 추가
   */
  onInput(callback: () => void): void {
    this.textareaElement.addEventListener('input', callback);
  }

  /**
   * 붙여넣기 이벤트 리스너 추가
   */
  onPaste(callback: () => void): void {
    this.textareaElement.addEventListener('paste', () => {
      setTimeout(callback, 100);
    });
  }

  /**
   * 디코딩 요청 이벤트 리스너 추가
   */
  onDecodeRequested(callback: () => void): void {
    this.textareaElement.addEventListener('decode-requested', callback);
  }

  /**
   * 복사 버튼 설정
   */
  private setupCopyButton(): void {
    if (!this.copyButton) return;

    this.copyButton.addEventListener('click', async () => {
      await this.copyInput();
    });

    // 입력 변경 시 버튼 상태 업데이트
    this.textareaElement.addEventListener('input', () => {
      this.updateCopyButtonState();
    });

    // 초기 상태 설정
    this.updateCopyButtonState();
  }

  /**
   * 복사 버튼 상태 업데이트
   */
  private updateCopyButtonState(): void {
    if (!this.copyButton) return;

    const hasText = this.getValue().length > 0;
    this.copyButton.disabled = !hasText;
  }

  /**
   * 입력 텍스트 복사
   */
  private async copyInput(): Promise<void> {
    const inputText = this.getValue();

    if (!inputText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inputText);
      this.showCopyFeedback(true);
    } catch (error) {
      console.error('복사 실패:', error);
      // Fallback 방법 시도
      try {
        this.fallbackCopy(inputText);
        this.showCopyFeedback(true);
      } catch (fallbackError) {
        console.error('Fallback 복사도 실패:', fallbackError);
        this.showCopyFeedback(false);
      }
    }
  }

  /**
   * Fallback 복사 (구형 브라우저 지원)
   */
  private fallbackCopy(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  /**
   * 복사 피드백 표시
   */
  private showCopyFeedback(success: boolean): void {
    if (!this.copyButton) return;

    const originalText = this.copyButton.textContent;

    if (success) {
      this.copyButton.textContent = '✅';
      this.copyButton.classList.add('copied');
    } else {
      this.copyButton.textContent = '❌';
    }

    setTimeout(() => {
      if (this.copyButton) {
        this.copyButton.textContent = originalText;
        this.copyButton.classList.remove('copied');
      }
    }, 2000);
  }
}
