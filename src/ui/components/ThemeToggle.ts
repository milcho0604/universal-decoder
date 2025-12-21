/**
 * 다크모드 토글 컴포넌트
 */
import { getFromStorage, saveToStorage } from '../../utils/chrome';

export class ThemeToggle {
  private buttonElement: HTMLButtonElement;

  constructor(buttonElement: HTMLButtonElement) {
    this.buttonElement = buttonElement;
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    await this.loadTheme();
    this.setupEventListeners();
  }

  /**
   * 저장된 테마 불러오기
   */
  private async loadTheme(): Promise<void> {
    const isDarkMode = await getFromStorage<boolean>('darkMode');
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      this.buttonElement.textContent = '☀️';
    } else {
      this.buttonElement.textContent = '🌙';
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.buttonElement.addEventListener('click', () => {
      this.toggle();
    });
  }

  /**
   * 테마 토글
   */
  private async toggle(): Promise<void> {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    this.buttonElement.textContent = isDarkMode ? '☀️' : '🌙';
    await saveToStorage('darkMode', isDarkMode);
  }
}
