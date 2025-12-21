/**
 * DOM 조작 유틸리티
 */

/**
 * HTML 이스케이프 (XSS 방지)
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 요소 표시/숨김 토글
 */
export function toggleVisibility(element: HTMLElement, visible: boolean): void {
  element.style.display = visible ? 'block' : 'none';
}

/**
 * 클래스 토글
 */
export function toggleClass(element: HTMLElement, className: string, add: boolean): void {
  if (add) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

/**
 * 여러 클래스 제거
 */
export function removeClasses(element: HTMLElement, ...classNames: string[]): void {
  element.classList.remove(...classNames);
}

/**
 * 버튼 활성화/비활성화
 */
export function setButtonState(
  button: HTMLButtonElement,
  enabled: boolean,
  opacity: string = '1'
): void {
  button.disabled = !enabled;
  button.style.opacity = enabled ? opacity : '0.5';
  button.style.cursor = enabled ? 'pointer' : 'not-allowed';
}
