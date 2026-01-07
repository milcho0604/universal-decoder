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
import { DecoderType, DecodeResult, DecoderOption, ChainDecodeResult, DecodingStep } from '../types';

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
   * 체인 디코딩: 중첩된 인코딩을 자동으로 여러 번 디코딩
   * 예: Base64(URL(원본)) → 2단계 디코딩
   */
  static async decodeChain(
    input: string,
    maxDepth: number = 10
  ): Promise<ChainDecodeResult> {
    if (!input || input.trim().length === 0) {
      return {
        success: false,
        steps: [],
        finalResult: '',
        totalSteps: 0,
        error: '입력이 비어있습니다.',
      };
    }

    const steps: DecodingStep[] = [];
    let currentInput = input;
    let stepCount = 0;

    // 순환 디코딩 방지: 이미 본 값들을 추적
    const seenValues = new Set<string>();
    seenValues.add(currentInput);

    // 연속으로 같은 타입이 나오는지 추적 (ROT13->ROT13 방지)
    let previousType: DecoderType | null = null;

    try {
      while (stepCount < maxDepth) {
        // 현재 입력의 타입 자동 감지
        const detectedType = this.detectDecoder(currentInput);

        // 감지된 타입이 없거나 auto면 종료
        if (detectedType === 'auto') {
          // 첫 단계에서 감지 실패한 경우
          if (stepCount === 0) {
            return {
              success: false,
              steps: [],
              finalResult: input,
              totalSteps: 0,
              error: '인코딩 형식을 감지할 수 없습니다.',
            };
          }
          // 이미 디코딩을 했다면 성공적으로 종료
          break;
        }

        // JSON Pretty는 체인에서 제외 (변환이지 디코딩이 아님)
        if (detectedType === 'json-pretty') {
          break;
        }

        // 연속으로 같은 타입이 감지되면 중단 (무한 루프 방지)
        // 예외: URL은 중첩 가능 (encodeURIComponent를 여러 번 할 수 있음)
        if (previousType === detectedType && detectedType !== 'url') {
          break;
        }

        // 디코딩 시도
        const result = await this.decode(currentInput, detectedType);

        // 디코딩 실패 시
        if (!result.success) {
          // 첫 단계에서 실패한 경우
          if (stepCount === 0) {
            return {
              success: false,
              steps: [],
              finalResult: input,
              totalSteps: 0,
              error: result.error || '디코딩에 실패했습니다.',
            };
          }
          // 이미 일부 디코딩에 성공했다면 여기까지의 결과 반환
          break;
        }

        // 디코딩 결과가 입력과 동일하면 더 이상 디코딩할 게 없음
        if (result.result === currentInput) {
          break;
        }

        // 순환 디코딩 감지: 이미 본 값이 다시 나타나면 중단
        if (seenValues.has(result.result)) {
          // 단계는 기록하되, 순환이므로 여기서 중단
          steps.push({
            step: stepCount + 1,
            type: detectedType,
            input: currentInput,
            output: result.result,
            success: true,
          });
          break;
        }

        // 단계 기록
        steps.push({
          step: stepCount + 1,
          type: detectedType,
          input: currentInput,
          output: result.result,
          success: true,
        });

        // 결과가 너무 짧으면 중단 (오감지 방지, 최소 3자 이상)
        if (result.result.trim().length < 3) {
          break;
        }

        // 다음 단계 준비
        seenValues.add(result.result);
        previousType = detectedType;
        currentInput = result.result;
        stepCount++;
      }

      // 최종 결과
      const finalResult = steps.length > 0 ? steps[steps.length - 1].output : input;

      return {
        success: true,
        steps,
        finalResult,
        totalSteps: steps.length,
      };
    } catch (error) {
      return {
        success: false,
        steps,
        finalResult: input,
        totalSteps: steps.length,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 사용 가능한 모든 디코더 타입 목록
   */
  static getAvailableDecoders(): DecoderOption[] {
    return [
      { value: 'auto', label: '자동 감지', supportsEncode: false },
      { value: 'url', label: 'URL 디코딩', supportsEncode: true },
      { value: 'html', label: 'HTML 엔티티', supportsEncode: true },
      { value: 'base64', label: 'Base64', supportsEncode: true },
      { value: 'base64url', label: 'Base64URL', supportsEncode: true },
      { value: 'jwt', label: 'JWT', supportsEncode: false },
      { value: 'hex', label: 'Hex 문자열', supportsEncode: true },
      { value: 'charcode', label: 'CharCode 배열', supportsEncode: true },
      { value: 'rot13', label: 'ROT13', supportsEncode: true },
      { value: 'gzip', label: 'Base64 + GZIP', supportsEncode: true },
      { value: 'json-pretty', label: 'JSON Pretty Print', supportsEncode: false },
    ];
  }
}
