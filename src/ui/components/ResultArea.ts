/**
 * 결과 표시 영역 컴포넌트
 */
import { i18n } from '../../i18n/i18n';
import { setButtonState, removeClasses } from '../../utils/dom';

export class ResultArea {
  private containerElement: HTMLDivElement;
  private metadataElement: HTMLDivElement;
  private copyButton: HTMLButtonElement;
  private downloadButton: HTMLButtonElement;

  constructor(
    containerElement: HTMLDivElement,
    metadataElement: HTMLDivElement,
    copyButton: HTMLButtonElement,
    downloadButton: HTMLButtonElement
  ) {
    this.containerElement = containerElement;
    this.metadataElement = metadataElement;
    this.copyButton = copyButton;
    this.downloadButton = downloadButton;
  }

  /**
   * 초기화
   */
  initialize(): void {
    setButtonState(this.copyButton, false);
    setButtonState(this.downloadButton, false);
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.copyButton.addEventListener('click', async () => {
      await this.copyResult();
    });

    this.downloadButton.addEventListener('click', () => {
      this.downloadResult();
    });
  }

  /**
   * 결과 표시
   */
  showResult(text: string, success: boolean, error?: string, metadata?: any): void {
    this.containerElement.textContent = text || i18n.t('result.noResult');

    // 클래스 초기화
    removeClasses(this.containerElement, 'empty', 'success', 'error');

    if (!text || text === i18n.t('result.empty')) {
      this.containerElement.classList.add('empty');
      setButtonState(this.copyButton, false);
      setButtonState(this.downloadButton, false);
    } else if (error || !success) {
      this.containerElement.classList.add('error');
      setButtonState(this.copyButton, true);
      setButtonState(this.downloadButton, true);
    } else {
      this.containerElement.classList.add('success');
      setButtonState(this.copyButton, true);
      setButtonState(this.downloadButton, true);
    }

    // 메타데이터 표시 (JWT 등)
    if (metadata) {
      this.showMetadata(metadata);
    } else {
      this.hideMetadata();
    }
  }

  /**
   * 메타데이터 표시
   */
  private showMetadata(metadata: any): void {
    this.metadataElement.style.display = 'block';
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

    this.metadataElement.innerHTML = metadataHtml;
  }

  /**
   * 메타데이터 숨기기
   */
  private hideMetadata(): void {
    this.metadataElement.style.display = 'none';
    this.metadataElement.innerHTML = '';
  }

  /**
   * 결과 복사
   */
  private async copyResult(): Promise<void> {
    const resultText = this.containerElement.textContent || '';

    // 결과가 없거나 빈 상태일 때는 복사하지 않음
    if (
      !resultText ||
      resultText === i18n.t('result.empty') ||
      resultText === i18n.t('result.noResult') ||
      resultText === i18n.t('result.decoding') ||
      this.containerElement.classList.contains('empty')
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resultText);
      this.showCopyFeedback(true);
    } catch (error) {
      console.error('복사 실패:', error);
      // Fallback 방법 시도
      try {
        this.fallbackCopy(resultText);
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
    const originalText = this.copyButton.textContent;

    if (success) {
      this.copyButton.textContent = '✅';
      this.copyButton.classList.add('copied');
    } else {
      this.copyButton.textContent = '❌';
    }

    setTimeout(() => {
      this.copyButton.textContent = originalText;
      this.copyButton.classList.remove('copied');
    }, 2000);
  }

  /**
   * 결과 다운로드
   */
  private downloadResult(): void {
    const resultText = this.containerElement.textContent || '';

    // 결과가 없거나 빈 상태일 때는 다운로드하지 않음
    if (
      !resultText ||
      resultText === i18n.t('result.empty') ||
      resultText === i18n.t('result.noResult') ||
      resultText === i18n.t('result.decoding') ||
      this.containerElement.classList.contains('empty')
    ) {
      return;
    }

    try {
      // Blob 생성
      const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // 다운로드 링크 생성
      const a = document.createElement('a');
      a.href = url;
      a.download = `decoded_${this.getTimestamp()}.txt`;
      document.body.appendChild(a);
      a.click();

      // 정리
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showDownloadFeedback(true);
    } catch (error) {
      console.error('다운로드 실패:', error);
      this.showDownloadFeedback(false);
    }
  }

  /**
   * 타임스탬프 생성 (파일명용)
   */
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * 다운로드 피드백 표시
   */
  private showDownloadFeedback(success: boolean): void {
    const originalText = this.downloadButton.textContent;

    if (success) {
      this.downloadButton.textContent = '✅';
      this.downloadButton.classList.add('copied');
    } else {
      this.downloadButton.textContent = '❌';
    }

    setTimeout(() => {
      this.downloadButton.textContent = originalText;
      this.downloadButton.classList.remove('copied');
    }, 2000);
  }

  /**
   * 결과 초기화
   */
  clear(): void {
    this.showResult(i18n.t('result.empty'), false);
    this.copyButton.textContent = '📋';
    this.copyButton.classList.remove('copied');
    this.downloadButton.textContent = '💾';
    this.downloadButton.classList.remove('copied');
  }

  /**
   * 결과 텍스트 가져오기
   */
  getResultText(): string {
    return this.containerElement.textContent || '';
  }
}
