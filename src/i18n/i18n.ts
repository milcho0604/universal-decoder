import { translations, Translation } from './translations';

export type Language = 'ko' | 'en';

export class I18n {
  private currentLanguage: Language = 'ko';
  private translations: Record<Language, Translation>;

  constructor() {
    this.translations = translations;
  }

  /**
   * 현재 언어 설정
   */
  setLanguage(lang: Language) {
    this.currentLanguage = lang;
  }

  /**
   * 현재 언어 가져오기
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 번역 텍스트 가져오기
   */
  t(key: string): string {
    const translation = this.translations[this.currentLanguage][key];
    if (!translation) {
      console.warn(`Translation key not found: "${key}" (language: ${this.currentLanguage})`);
      return key;
    }
    return translation;
  }

  /**
   * 모든 data-i18n 속성을 가진 요소들의 텍스트를 업데이트
   */
  updatePageText() {
    // data-i18n 속성을 가진 모든 요소 찾기
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translation = this.t(key);

        // 일반 텍스트 콘텐츠
        if (element.tagName === 'OPTION') {
          element.textContent = translation;
        } else if (element.tagName === 'BUTTON' || element.tagName === 'LABEL' || element.tagName === 'SPAN') {
          // 버튼/라벨/스팬의 경우 textContent 업데이트
          element.textContent = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // data-i18n-title 속성을 가진 모든 요소의 title 업데이트
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach((element) => {
      const titleKey = element.getAttribute('data-i18n-title');
      if (titleKey) {
        element.setAttribute('title', this.t(titleKey));
      }
    });

    // data-i18n-placeholder 속성을 가진 모든 요소의 placeholder 업데이트
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach((element) => {
      const placeholderKey = element.getAttribute('data-i18n-placeholder');
      if (placeholderKey) {
        (element as HTMLInputElement | HTMLTextAreaElement).placeholder = this.t(placeholderKey);
      }
    });

    // HTML lang 속성 업데이트
    document.documentElement.lang = this.currentLanguage;
  }

  /**
   * Chrome Storage에 언어 설정 저장
   */
  async saveLanguage() {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        await chrome.storage.local.set({ language: this.currentLanguage });
        console.log('Language saved:', this.currentLanguage);
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }

  /**
   * Chrome Storage에서 언어 설정 불러오기
   */
  async loadLanguage() {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(['language']);
        if (result.language && (result.language === 'ko' || result.language === 'en')) {
          this.currentLanguage = result.language;
          console.log('Language loaded:', this.currentLanguage);
        } else {
          // 브라우저 언어 감지
          const browserLang = navigator.language.toLowerCase();
          if (browserLang.startsWith('ko')) {
            this.currentLanguage = 'ko';
          } else {
            this.currentLanguage = 'en';
          }
          console.log('Language detected from browser:', this.currentLanguage);
        }
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  }

  /**
   * 언어 토글 (한국어 ↔ 영어)
   */
  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'ko' ? 'en' : 'ko';
  }
}

// 싱글톤 인스턴스
export const i18n = new I18n();
