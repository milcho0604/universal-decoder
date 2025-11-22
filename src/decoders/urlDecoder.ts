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
    // 최소 길이 체크
    if (input.length < 6) {
      return false;
    }

    // %XX 패턴이 있는지 확인
    const encodedChars = input.match(/%[0-9A-Fa-f]{2}/g);
    if (!encodedChars || encodedChars.length === 0) {
      return false;
    }

    // URL 인코딩된 문자가 최소 2개 이상 있어야 함
    if (encodedChars.length < 2) {
      return false;
    }

    // 전체 문자열 대비 인코딩된 부분의 비율 확인
    // (너무 적으면 우연히 %XX 패턴이 포함된 일반 텍스트일 수 있음)
    const encodedLength = encodedChars.reduce((sum, match) => sum + match.length, 0);
    const encodingRatio = encodedLength / input.length;

    // 최소 15% 이상이 인코딩되어 있어야 함
    if (encodingRatio < 0.15) {
      return false;
    }

    // 실제 디코딩 시도하여 의미있는 결과가 나오는지 확인
    try {
      const decoded = decodeURIComponent(input);
      // 디코딩 결과가 원본과 달라야 함 (실제로 인코딩된 것)
      if (decoded === input) {
        return false;
      }

      // 디코딩 결과가 대부분 printable 문자여야 함
      const printableCount = (decoded.match(/[ -~\n\r\t\u0080-\uFFFF]/g) || []).length;
      return printableCount >= decoded.length * 0.8; // 80% 이상
    } catch {
      return false;
    }
  }
}
