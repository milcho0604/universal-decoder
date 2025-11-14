// Background service worker for Chrome extension
console.log('Background service worker loaded');

// Example: Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

