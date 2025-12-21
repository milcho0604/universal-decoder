/**
 * Chrome API 래퍼 유틸리티
 */

/**
 * Chrome Storage에서 값 가져오기
 */
export async function getFromStorage<T>(key: string): Promise<T | null> {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    }
    return null;
  } catch (error) {
    console.error(`Failed to get ${key} from storage:`, error);
    return null;
  }
}

/**
 * Chrome Storage에 값 저장하기
 */
export async function saveToStorage(key: string, value: any): Promise<void> {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [key]: value });
    }
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
    throw error;
  }
}

/**
 * Side Panel 열기
 */
export async function openSidePanel(): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const windowId = tab.windowId;

    const response = await chrome.runtime.sendMessage({
      action: 'openSidePanel',
      windowId: windowId
    });

    return response && response.success;
  } catch (error) {
    console.error('Failed to open side panel:', error);
    return false;
  }
}

/**
 * 새 창 열기
 */
export async function openNewWindow(url: string, width: number, height: number): Promise<void> {
  try {
    await chrome.windows.create({
      url: chrome.runtime.getURL(url),
      type: 'popup',
      width,
      height,
    });
  } catch (error) {
    console.error('Failed to open new window:', error);
    throw error;
  }
}
