/**
 * Storage 서비스
 * Storage/Cookie 데이터를 관리하는 서비스
 */
import { StorageItem, StorageData } from '../types';

export class StorageService {
  /**
   * Content Script로부터 Storage 데이터 가져오기
   */
  static async fetchStorageData(): Promise<StorageData | null> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id || !tab.url) {
        throw new Error('storage.error.noTab');
      }

      // chrome://, edge://, about:, file:// 등 특수 페이지 체크
      const url = tab.url.toLowerCase();
      if (
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url.startsWith('file://') ||
        url.startsWith('view-source:')
      ) {
        throw new Error('storage.error.restricted');
      }

      // Content script로 메시지 전송
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'fetchStorageData'
      }) as StorageData;

      if (response && response.items) {
        return response;
      } else {
        throw new Error('storage.error.fetch');
      }
    } catch (error) {
      console.error('Failed to fetch storage data:', error);
      throw error;
    }
  }

  /**
   * Auto-Fetch 모드 설정 저장
   */
  static async saveAutoFetchMode(enabled: boolean): Promise<void> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        await chrome.storage.local.set({ autoFetchMode: enabled });
      }
    } catch (error) {
      console.error('Failed to save auto-fetch preference:', error);
      throw error;
    }
  }

  /**
   * Auto-Fetch 모드 설정 불러오기
   */
  static async loadAutoFetchMode(): Promise<boolean> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(['autoFetchMode']);
        return result.autoFetchMode || false;
      }
      return false;
    } catch (error) {
      console.error('Failed to load auto-fetch preference:', error);
      return false;
    }
  }
}
