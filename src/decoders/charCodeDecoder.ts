/**
 * CharCode 배열 디코딩 모듈
 */
export class CharCodeDecoder {
  static decode(input: string): string {
    try {
      // JSON 배열 형식 파싱 시도
      let codes: number[];

      if (input.trim().startsWith('[') && input.trim().endsWith(']')) {
        codes = JSON.parse(input);
      } else {
        // 쉼표로 구분된 숫자 문자열 파싱
        codes = input
          .split(/[,\s]+/)
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));
      }

      if (codes.length === 0) {
        throw new Error('No valid character codes found');
      }

      return codes.map((code) => String.fromCharCode(code)).join('');
    } catch (e) {
      throw new Error('Invalid CharCode format');
    }
  }

  static encode(input: string): string {
    try {
      // 각 문자를 charCode로 변환하여 JSON 배열로 반환
      const codes = Array.from(input).map((char) => char.charCodeAt(0));
      return JSON.stringify(codes);
    } catch (e) {
      throw new Error('Invalid text for CharCode encoding');
    }
  }

  static canDecode(input: string): boolean {
    const trimmed = input.trim();

    // JSON 배열 형식 확인
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        // 최소 3개 이상의 문자 코드
        if (!Array.isArray(parsed) || parsed.length < 3) {
          return false;
        }

        // 모든 요소가 유효한 문자 코드인지 확인
        const isValidCharCodes = parsed.every(
          (n: any) => typeof n === 'number' && n >= 32 && n <= 65535
        );

        if (!isValidCharCodes) {
          return false;
        }

        // ASCII 인쇄 가능 문자 범위(32-126) 또는 확장 ASCII(128-255)가 대부분이어야 함
        const printableCount = parsed.filter(
          (n: any) => (n >= 32 && n <= 126) || (n >= 128 && n <= 65535)
        ).length;

        return printableCount >= parsed.length * 0.8; // 80% 이상
      } catch {
        return false;
      }
    }

    // 쉼표/공백으로 구분된 숫자 형식 확인
    const numbers = trimmed.split(/[,\s]+/).filter((s) => s.length > 0);

    // 최소 3개 이상
    if (numbers.length < 3) {
      return false;
    }

    // 모든 요소가 유효한 숫자인지 확인
    const validNumbers = numbers.every((n) => {
      const num = parseInt(n, 10);
      return !isNaN(num) && num >= 32 && num <= 65535;
    });

    if (!validNumbers) {
      return false;
    }

    // 대부분이 인쇄 가능한 문자 코드 범위여야 함
    const printableCount = numbers.filter((n) => {
      const num = parseInt(n, 10);
      return (num >= 32 && num <= 126) || (num >= 128 && num <= 65535);
    }).length;

    return printableCount >= numbers.length * 0.8; // 80% 이상
  }
}
