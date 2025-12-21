/**
 * Storage 관련 타입 정의
 */

export interface StorageItem {
  key: string;
  value: string;
  type: 'localStorage' | 'sessionStorage' | 'cookie';
}

export interface StorageData {
  items: StorageItem[];
}
