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

  static canDecode(input: string): boolean {
    const trimmed = input.trim();

    // JSON 배열 형식 확인
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (n: any) => typeof n === 'number' && n >= 0 && n <= 65535
          )
        );
      } catch {
        return false;
      }
    }

    // 쉼표/공백으로 구분된 숫자 형식 확인
    const numbers = trimmed.split(/[,\s]+/).filter((s) => s.length > 0);
    return (
      numbers.length > 0 &&
      numbers.every((n) => {
        const num = parseInt(n, 10);
        return !isNaN(num) && num >= 0 && num <= 65535;
      })
    );
  }
}
