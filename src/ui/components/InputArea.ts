/**
 * 입력 영역 컴포넌트
 */
export class InputArea {
  private textareaElement: HTMLTextAreaElement;

  constructor(textareaElement: HTMLTextAreaElement) {
    this.textareaElement = textareaElement;
  }

  /**
   * 초기화
   */
  initialize(): void {
    this.setupEventListeners();
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
  }

  /**
   * 초기화
   */
  clear(): void {
    this.textareaElement.value = '';
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
}
