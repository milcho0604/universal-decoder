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

  static encode(input: string): string {
    // ROT13은 대칭 암호이므로 encode = decode
    return this.decode(input);
  }

  static canDecode(input: string): boolean {
    // ROT13은 매우 드물게 사용되므로 엄격하게 검증
    // 최소 길이 체크
    if (input.length < 10) {
      return false;
    }

    // 알파벳이 포함되어 있어야 함
    if (!/[a-zA-Z]/.test(input)) {
      return false;
    }

    // ROT13 특징: 대부분 알파벳으로 구성되고, 공백이 있을 수 있음
    // 다른 특수문자가 많으면 ROT13이 아님
    const alphaSpaceCount = (input.match(/[a-zA-Z\s]/g) || []).length;
    if (alphaSpaceCount < input.length * 0.8) {
      return false; // 80% 이상이 알파벳+공백이어야 함
    }

    // 실제 디코딩 결과가 의미있는 텍스트인지 간단히 확인
    // (이 부분은 완벽하지 않지만, 명확한 ROT13 패턴을 찾는 데 도움)
    const decoded = this.decode(input);

    // 디코딩 결과에 일반적인 영어 단어 패턴이 있는지 확인
    // 완벽하지 않으므로, ROT13은 우선순위를 가장 낮게 유지
    const commonWords = /\b(the|is|are|was|were|have|has|had|hello|world|test|data)\b/i;
    return commonWords.test(decoded);
  }
}
