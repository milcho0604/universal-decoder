/**
 * URL 디코딩 모듈
 * 반복 디코딩 자동 처리
 */
export class UrlDecoder {
  static decode(input: string): string {
    let result = input;
    let previous = '';

    // 더 이상 디코딩되지 않을 때까지 반복
    while (result !== previous) {
      previous = result;
      try {
        result = decodeURIComponent(result);
      } catch (e) {
        // 디코딩 실패 시 이전 결과 반환
        return previous;
      }
    }

    return result;
  }

  static canDecode(input: string): boolean {
    // %로 시작하는 인코딩된 문자 패턴 확인
    return /%[0-9A-Fa-f]{2}/.test(input);
  }
}
