/**
 * 언어 전환 컴포넌트
 */
import { i18n } from '../../i18n/i18n';

export class LanguageToggle {
  private buttonElement: HTMLButtonElement;
  private onLanguageChange?: () => void;

  constructor(buttonElement: HTMLButtonElement) {
    this.buttonElement = buttonElement;
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    await i18n.loadLanguage();
    this.updateButtonText();
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.buttonElement.addEventListener('click', async () => {
      await this.toggle();
    });
  }

  /**
   * 언어 토글
   */
  private async toggle(): Promise<void> {
    i18n.toggleLanguage();
    await i18n.saveLanguage();
    i18n.updatePageText();
    this.updateButtonText();

    // 콜백 실행
    if (this.onLanguageChange) {
      this.onLanguageChange();
    }
  }

  /**
   * 버튼 텍스트 업데이트
   */
  private updateButtonText(): void {
    const langBtn = this.buttonElement.querySelector('span');
    if (langBtn) {
      langBtn.textContent = i18n.t('language.current');
    }
  }

  /**
   * 언어 변경 콜백 설정
   */
  setOnLanguageChange(callback: () => void): void {
    this.onLanguageChange = callback;
  }
}
