/**
 * 디코딩 서비스
 * 입력 문자열을 분석하여 적절한 디코딩 방법을 자동 감지하고 적용
 */
import {
  UrlDecoder,
  HtmlDecoder,
  Base64Decoder,
  HexDecoder,
  CharCodeDecoder,
  Rot13Decoder,
  GzipDecoder,
} from '../decoders';
import { DecoderType, DecodeResult, DecoderOption } from '../types';

export class DecoderService {
  /**
   * JSON Pretty Print
   */
  private static prettyPrintJSON(str: string): string {
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  }

  /**
   * 유효한 JSON인지 확인
   */
  private static isValidJSON(input: string): boolean {
    const trimmed = input.trim();

    // JSON은 { 또는 [로 시작해야 함
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return false;
    }

    // 최소 길이 (빈 객체/배열 이상)
    if (trimmed.length < 2) {
      return false;
    }

    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(trimmed);
      // 객체 또는 배열이어야 함 (primitive 값 제외)
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }

  /**
   * 자동 감지: 입력 문자열을 분석하여 적절한 디코더 선택
   */
  static detectDecoder(input: string): DecoderType {
    if (!input || input.trim().length === 0) {
      return 'auto';
    }

    // 우선순위 순서로 감지
    // 1. JSON Pretty (객체/배열 형태는 우선 인식)
    if (this.isValidJSON(input)) {
      return 'json-pretty';
    }

    // 2. JWT (Base64URL의 특수 케이스)
    if (Base64Decoder.canDecodeJWT(input)) {
      return 'jwt';
    }

    // 3. GZIP (Base64 + GZIP)
    if (GzipDecoder.canDecode(input)) {
      return 'gzip';
    }

    // 4. Base64URL
    if (
      (Base64Decoder.canDecodeBase64Url(input) && input.includes('_')) ||
      input.includes('-')
    ) {
      return 'base64url';
    }

    // 5. Base64
    if (Base64Decoder.canDecodeBase64(input)) {
      return 'base64';
    }

    // 6. Hex
    if (HexDecoder.canDecode(input)) {
      return 'hex';
    }

    // 7. CharCode
    if (CharCodeDecoder.canDecode(input)) {
      return 'charcode';
    }

    // 8. URL 인코딩
    if (UrlDecoder.canDecode(input)) {
      return 'url';
    }

    // 9. HTML 엔티티
    if (HtmlDecoder.canDecode(input)) {
      return 'html';
    }

    // 10. ROT13
    if (Rot13Decoder.canDecode(input)) {
      return 'rot13';
    }

    return 'auto';
  }

  /**
   * 디코딩 실행
   */
  static async decode(
    input: string,
    type: DecoderType = 'auto'
  ): Promise<DecodeResult> {
    if (!input || input.trim().length === 0) {
      return {
        success: false,
        result: '',
        type: 'auto',
        error: '입력이 비어있습니다.',
      };
    }

    // 자동 감지
    if (type === 'auto') {
      type = this.detectDecoder(input);
    }

    try {
      let result: string;
      let metadata: any = undefined;

      switch (type) {
        case 'url':
          result = UrlDecoder.decode(input);
          break;

        case 'html':
          result = HtmlDecoder.decode(input);
          break;

        case 'base64':
          result = Base64Decoder.decodeBase64(input);
          break;

        case 'base64url':
          result = Base64Decoder.decodeBase64Url(input);
          break;

        case 'jwt':
          const jwtResult = Base64Decoder.decodeJWT(input);
          result = JSON.stringify(jwtResult.payload, null, 2);
          metadata = {
            header: jwtResult.header,
            payload: jwtResult.payload,
          };
          break;

        case 'hex':
          result = HexDecoder.decode(input);
          break;

        case 'charcode':
          result = CharCodeDecoder.decode(input);
          break;

        case 'rot13':
          result = Rot13Decoder.decode(input);
          break;

        case 'gzip':
          result = await GzipDecoder.decode(input);
          break;

        case 'json-pretty':
          result = this.prettyPrintJSON(input);
          break;

        default:
          return {
            success: false,
            result: input,
            type: 'auto',
            error: '지원하지 않는 디코딩 타입입니다.',
          };
      }

      // 결과가 JSON인지 확인하고 Pretty Print 적용
      let finalResult = result;
      try {
        JSON.parse(result);
        finalResult = this.prettyPrintJSON(result);
      } catch {
        // JSON이 아니면 그대로 사용
      }

      return {
        success: true,
        result: finalResult,
        type,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        result: input,
        type,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 사용 가능한 모든 디코더 타입 목록
   */
  static getAvailableDecoders(): DecoderOption[] {
    return [
      { value: 'auto', label: '자동 감지' },
      { value: 'url', label: 'URL 디코딩' },
      { value: 'html', label: 'HTML 엔티티' },
      { value: 'base64', label: 'Base64' },
      { value: 'base64url', label: 'Base64URL' },
      { value: 'jwt', label: 'JWT' },
      { value: 'hex', label: 'Hex 문자열' },
      { value: 'charcode', label: 'CharCode 배열' },
      { value: 'rot13', label: 'ROT13' },
      { value: 'gzip', label: 'Base64 + GZIP' },
      { value: 'json-pretty', label: 'JSON Pretty Print' },
    ];
  }
}
