/**
 * 포맷팅 유틸리티
 */
import { i18n } from '../i18n/i18n';

/**
 * 날짜를 현재 언어 설정에 맞게 포맷
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const language = i18n.getLanguage();
  const locale = language === 'ko' ? 'ko-KR' : 'en-US';
  
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 텍스트를 지정된 길이로 자르고 ... 추가
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * 텍스트가 비어있는지 확인
 */
export function isEmpty(text: string): boolean {
  return !text || text.trim().length === 0;
}
