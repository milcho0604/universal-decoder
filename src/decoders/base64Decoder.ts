/**
 * Base64 계열 디코딩 모듈
 * Base64, Base64URL, JWT 지원
 */
export class Base64Decoder {
  /**
   * Base64 디코딩
   */
  static decodeBase64(input: string): string {
    try {
      // 공백 제거
      const cleaned = input.trim().replace(/\s/g, '');
      const decoded = atob(cleaned);
      return decoded;
    } catch (e) {
      throw new Error('Invalid Base64 string');
    }
  }

  /**
   * Base64URL 디코딩
   */
  static decodeBase64Url(input: string): string {
    try {
      // Base64URL을 Base64로 변환
      let base64 = input.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      const decoded = atob(base64);
      return decoded;
    } catch (e) {
      throw new Error('Invalid Base64URL string');
    }
  }

  /**
   * JWT 디코딩 (header.payload.signature)
   */
  static decodeJWT(input: string): { header: any; payload: any; raw: string } {
    const parts = input.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    try {
      const header = JSON.parse(this.decodeBase64Url(parts[0]));
      const payload = JSON.parse(this.decodeBase64Url(parts[1]));

      return {
        header,
        payload,
        raw:
          this.decodeBase64Url(parts[0]) +
          '.' +
          this.decodeBase64Url(parts[1]) +
          '.' +
          parts[2],
      };
    } catch (e) {
      throw new Error('Failed to decode JWT');
    }
  }

  /**
   * Base64 형식인지 확인
   */
  static canDecodeBase64(input: string): boolean {
    const cleaned = input.trim().replace(/\s/g, '');
    // Base64 패턴: A-Z, a-z, 0-9, +, /, = (패딩)
    return /^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length % 4 === 0;
  }

  /**
   * Base64URL 형식인지 확인
   */
  static canDecodeBase64Url(input: string): boolean {
    // Base64URL 패턴: A-Z, a-z, 0-9, -, _
    return /^[A-Za-z0-9_-]+$/.test(input.trim());
  }

  /**
   * JWT 형식인지 확인
   */
  static canDecodeJWT(input: string): boolean {
    const parts = input.trim().split('.');
    return (
      parts.length === 3 && parts.every((part) => this.canDecodeBase64Url(part))
    );
  }
}
