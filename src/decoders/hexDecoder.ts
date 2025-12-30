/**
 * Hex 문자열 디코딩 모듈
 */
export class HexDecoder {
  static decode(input: string): string {
    // 공백, 0x, \x 등 제거
    const cleaned = input
      .replace(/0x/gi, '')
      .replace(/\\x/gi, '')
      .replace(/[^0-9A-Fa-f]/g, '');

    if (cleaned.length % 2 !== 0) {
      throw new Error('Hex string length must be even');
    }

    let result = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      const hex = cleaned.substr(i, 2);
      const charCode = parseInt(hex, 16);
      result += String.fromCharCode(charCode);
    }

    return result;
  }

  static encode(input: string): string {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      const hex = input.charCodeAt(i).toString(16).padStart(2, '0');
      result += hex;
    }
    return result.toUpperCase();
  }

  static canDecode(input: string): boolean {
    // Hex 패턴 확인
    const cleaned = input
      .replace(/0x/gi, '')
      .replace(/\\x/gi, '')
      .replace(/[^0-9A-Fa-f]/g, '');

    // 최소 길이 체크 (10자 이상 = 5바이트)
    if (cleaned.length < 10) {
      return false;
    }

    // 짝수 길이여야 함
    if (cleaned.length % 2 !== 0) {
      return false;
    }

    // Hex 문자만 포함
    if (!/^[0-9A-Fa-f]+$/.test(cleaned)) {
      return false;
    }

    // 실제 디코딩 시도하여 유효성 검증
    try {
      let result = '';
      for (let i = 0; i < cleaned.length; i += 2) {
        const hex = cleaned.substr(i, 2);
        const charCode = parseInt(hex, 16);
        result += String.fromCharCode(charCode);
      }

      // 결과가 대부분 printable 문자인지 확인
      const printableCount = (result.match(/[ -~\n\r\t\u0080-\uFFFF]/g) || []).length;
      return printableCount >= result.length * 0.7; // 70% 이상이 printable
    } catch {
      return false;
    }
  }
}
