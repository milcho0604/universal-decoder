/**
 * History 서비스
 * 디코딩 히스토리를 관리하는 서비스
 */
import { HistoryItem, DecoderType } from '../types';

export class HistoryService {
  private static readonly MAX_HISTORY = 50;
  private static readonly STORAGE_KEY = 'decoderHistory';
  private static readonly RETENTION_KEY = 'historyRetentionDays';

  static async getRetentionDays(): Promise<number> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get([this.RETENTION_KEY]);
        return result[this.RETENTION_KEY] ?? 30;
      }
    } catch {
      // ignore
    }
    return 30;
  }

  static async saveRetentionDays(days: number): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [this.RETENTION_KEY]: days });
    }
  }

  /**
   * 히스토리 저장
   */
  static async saveToHistory(
    input: string,
    decoderType: DecoderType,
    result: string,
    decoderLabel: string
  ): Promise<void> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        // 기존 히스토리 가져오기
        const storageResult = await chrome.storage.local.get([this.STORAGE_KEY]);
        const history: HistoryItem[] = storageResult[this.STORAGE_KEY] || [];

        // 새 히스토리 항목 생성
        const newItem: HistoryItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          input: input.substring(0, 2000),
          decoderType: decoderType,
          result: result.substring(0, 2000),
          timestamp: Date.now(),
          decoderLabel: decoderLabel,
        };

        // 최신 항목을 맨 앞에 추가
        history.unshift(newItem);

        // 최대 개수 제한
        if (history.length > this.MAX_HISTORY) {
          history.splice(this.MAX_HISTORY);
        }

        // 저장 (quota 초과 시 오래된 항목부터 삭제 후 재시도)
        let saved = false;
        while (!saved && history.length > 0) {
          try {
            await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
            saved = true;
          } catch (e: unknown) {
            if (
              e instanceof Error &&
              e.message?.includes('QUOTA_BYTES') &&
              history.length > 1
            ) {
              history.pop();
            } else {
              throw e;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to save history:', error);
      throw error;
    }
  }

  /**
   * 히스토리 로드
   */
  static async loadHistory(): Promise<HistoryItem[]> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const storageResult = await chrome.storage.local.get([this.STORAGE_KEY]);
        let history: HistoryItem[] = storageResult[this.STORAGE_KEY] || [];

        const retentionDays = await this.getRetentionDays();
        if (retentionDays > 0) {
          const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
          const filtered = history.filter((item) => item.timestamp >= cutoff);
          if (filtered.length !== history.length) {
            history = filtered;
            await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
          }
        }

        return history;
      }
      return [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  /**
   * 히스토리 항목 삭제
   */
  static async deleteHistoryItem(id: string): Promise<void> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const storageResult = await chrome.storage.local.get([this.STORAGE_KEY]);
        const history: HistoryItem[] = storageResult[this.STORAGE_KEY] || [];

        const filtered = history.filter((item) => item.id !== id);
        await chrome.storage.local.set({ [this.STORAGE_KEY]: filtered });
      }
    } catch (error) {
      console.error('Failed to delete history item:', error);
      throw error;
    }
  }

  /**
   * 전체 히스토리 삭제
   */
  static async clearAllHistory(): Promise<void> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        await chrome.storage.local.set({ [this.STORAGE_KEY]: [] });
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }

  /**
   * 선택된 히스토리 항목들 삭제
   */
  static async deleteSelectedHistory(ids: Set<string>): Promise<void> {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const storageResult = await chrome.storage.local.get([this.STORAGE_KEY]);
        const history: HistoryItem[] = storageResult[this.STORAGE_KEY] || [];

        const filtered = history.filter((item) => !ids.has(item.id));
        await chrome.storage.local.set({ [this.STORAGE_KEY]: filtered });
      }
    } catch (error) {
      console.error('Failed to delete selected history:', error);
      throw error;
    }
  }
}
