// Content Script: 페이지의 Storage 데이터를 수집

interface StorageItem {
  key: string;
  value: string;
  type: 'localStorage' | 'sessionStorage' | 'cookie';
}

interface StorageData {
  items: StorageItem[];
}

// localStorage 데이터 수집
function getLocalStorageData(): StorageItem[] {
  const items: StorageItem[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          items.push({ key, value, type: 'localStorage' });
        }
      }
    }
  } catch (error) {
    console.error('Failed to read localStorage:', error);
  }
  return items;
}

// sessionStorage 데이터 수집
function getSessionStorageData(): StorageItem[] {
  const items: StorageItem[] = [];
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          items.push({ key, value, type: 'sessionStorage' });
        }
      }
    }
  } catch (error) {
    console.error('Failed to read sessionStorage:', error);
  }
  return items;
}

// Cookie 데이터 수집
function getCookieData(): StorageItem[] {
  const items: StorageItem[] = [];
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('='); // = 문자가 값에 포함될 수 있음
        if (key && value) {
          items.push({
            key: key.trim(),
            value: decodeURIComponent(value.trim()),
            type: 'cookie'
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to read cookies:', error);
  }
  return items;
}

// 모든 Storage 데이터 수집
function fetchAllStorageData(): StorageData {
  const items: StorageItem[] = [
    ...getLocalStorageData(),
    ...getSessionStorageData(),
    ...getCookieData()
  ];

  return { items };
}

// Popup으로부터 메시지 수신
chrome.runtime.onMessage.addListener(
  (
    request: any,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (request.action === 'fetchStorageData') {
      const data = fetchAllStorageData();
      sendResponse(data);
    }
    return true; // 비동기 응답을 위해 true 반환
  }
);
