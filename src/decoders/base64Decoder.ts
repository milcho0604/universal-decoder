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

      // UTF-8 디코딩: atob는 바이너리 문자열을 반환하므로 UTF-8로 변환
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      throw new Error('Invalid Base64 string');
    }
  }

  /**
   * Base64 인코딩
   */
  static encodeBase64(input: string): string {
    try {
      // UTF-8 인코딩: 문자열을 UTF-8 바이트로 변환
      const bytes = new TextEncoder().encode(input);
      // Uint8Array를 바이너리 문자열로 변환
      const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
    } catch (e) {
      throw new Error('Invalid text for Base64 encoding');
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

      // UTF-8 디코딩: atob는 바이너리 문자열을 반환하므로 UTF-8로 변환
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      throw new Error('Invalid Base64URL string');
    }
  }

  /**
   * Base64URL 인코딩
   */
  static encodeBase64Url(input: string): string {
    try {
      // 먼저 Base64로 인코딩
      const base64 = this.encodeBase64(input);
      // Base64를 Base64URL로 변환 (패딩 제거, + → -, / → _)
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      throw new Error('Invalid text for Base64URL encoding');
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

    // 최소 길이 체크 (8자 이상)
    if (cleaned.length < 8) {
      return false;
    }

    // Base64 패턴: A-Z, a-z, 0-9, +, /, = (패딩)
    if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
      return false;
    }

    // 길이가 4의 배수여야 함
    if (cleaned.length % 4 !== 0) {
      return false;
    }

    // 패딩은 끝에만 있어야 함
    const paddingIndex = cleaned.indexOf('=');
    if (paddingIndex !== -1 && paddingIndex < cleaned.length - 2) {
      return false;
    }

    // 실제 디코딩 시도하여 유효성 검증
    try {
      const decoded = atob(cleaned);
      // 결과가 printable 문자 또는 유효한 UTF-8인지 확인
      // 최소한 null 문자나 제어 문자가 너무 많으면 제외
      const controlCharCount = (decoded.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
      return controlCharCount < decoded.length * 0.3; // 30% 미만의 제어 문자
    } catch {
      return false;
    }
  }

  /**
   * Base64URL 형식인지 확인
   */
  static canDecodeBase64Url(input: string): boolean {
    const cleaned = input.trim();

    // 최소 길이 체크 (8자 이상)
    if (cleaned.length < 8) {
      return false;
    }

    // Base64URL 패턴: A-Z, a-z, 0-9, -, _
    if (!/^[A-Za-z0-9_-]+$/.test(cleaned)) {
      return false;
    }

    // Base64URL 특수문자(-,_)가 실제로 포함되어 있어야 함
    // 그렇지 않으면 일반 Base64나 일반 텍스트일 수 있음
    if (!/[-_]/.test(cleaned)) {
      return false;
    }

    // 실제 디코딩 시도하여 유효성 검증
    try {
      // Base64URL을 Base64로 변환
      let base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      const decoded = atob(base64);

      // 결과가 유효한지 확인 (제어 문자가 너무 많지 않아야 함)
      const controlCharCount = (decoded.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
      return controlCharCount < decoded.length * 0.3; // 30% 미만의 제어 문자
    } catch {
      return false;
    }
  }

  /**
   * JWT 형식인지 확인
   */
  static canDecodeJWT(input: string): boolean {
    const trimmed = input.trim();
    const parts = trimmed.split('.');

    // JWT는 정확히 3개 부분으로 구성
    if (parts.length !== 3) {
      return false;
    }

    // JWT header는 거의 항상 eyJ로 시작 (JSON { 의 Base64URL 인코딩)
    if (!parts[0].startsWith('eyJ')) {
      return false;
    }

    // 각 부분이 Base64URL 문자만 포함하는지 확인 (-, _ 필수 아님)
    const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
    if (!parts.every(part => part.length > 0 && base64UrlPattern.test(part))) {
      return false;
    }

    // Header와 Payload는 충분한 길이여야 함 (최소 10자)
    if (parts[0].length < 10 || parts[1].length < 10) {
      return false;
    }

    // 실제 디코딩 시도하여 JSON인지 확인
    try {
      const header = JSON.parse(this.decodeBase64Url(parts[0]));
      const payload = JSON.parse(this.decodeBase64Url(parts[1]));

      // header에 typ 또는 alg 필드가 있는지 확인
      return typeof header === 'object' && (header.typ || header.alg);
    } catch {
      return false;
    }
  }
}
