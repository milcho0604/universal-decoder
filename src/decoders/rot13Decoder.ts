/**
 * ROT13 디코딩 모듈
 */
export class Rot13Decoder {
  static decode(input: string): string {
    return input.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      let base: number;

      if (code >= 65 && code <= 90) {
        // 대문자 A-Z
        base = 65;
      } else if (code >= 97 && code <= 122) {
        // 소문자 a-z
        base = 97;
      } else {
        return char;
      }

      const rotated = ((code - base + 13) % 26) + base;
      return String.fromCharCode(rotated);
    });
  }

  static canDecode(input: string): boolean {
    // 알파벳이 포함되어 있으면 ROT13 가능
    return /[a-zA-Z]/.test(input);
  }
}
