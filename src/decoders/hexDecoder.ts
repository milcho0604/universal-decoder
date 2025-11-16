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

  static canDecode(input: string): boolean {
    // Hex 패턴 확인 (최소 2자 이상)
    const cleaned = input
      .replace(/0x/gi, '')
      .replace(/\\x/gi, '')
      .replace(/[^0-9A-Fa-f]/g, '');

    return (
      cleaned.length >= 2 &&
      cleaned.length % 2 === 0 &&
      /^[0-9A-Fa-f]+$/.test(cleaned)
    );
  }
}
