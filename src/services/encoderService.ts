/**
 * 인코딩 서비스
 * 입력 문자열을 지정된 타입으로 인코딩
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
import { DecoderType, EncodeResult } from '../types';
import { DecoderService } from './decoderService';
import { i18n } from '../i18n/i18n';

export class EncoderService {
  /**
   * 인코딩 실행
   */
  static async encode(
    input: string,
    type: DecoderType
  ): Promise<EncodeResult> {
    if (!input || input.trim().length === 0) {
      return {
        success: false,
        result: '',
        type,
        error: i18n.t('result.inputEmpty'),
      };
    }

    // 인코딩을 지원하지 않는 타입 확인
    const decoderOption = DecoderService.getAvailableDecoders().find(d => d.value === type);
    if (!decoderOption?.supportsEncode) {
      return {
        success: false,
        result: input,
        type,
        error: i18n.t('error.encodeNotSupported'),
      };
    }

    try {
      let result: string;

      switch (type) {
        case 'url':
          result = UrlDecoder.encode(input);
          break;

        case 'html':
          result = HtmlDecoder.encode(input);
          break;

        case 'base64':
          result = Base64Decoder.encodeBase64(input);
          break;

        case 'base64url':
          result = Base64Decoder.encodeBase64Url(input);
          break;

        case 'hex':
          result = HexDecoder.encode(input);
          break;

        case 'charcode':
          result = CharCodeDecoder.encode(input);
          break;

        case 'rot13':
          result = Rot13Decoder.encode(input);
          break;

        case 'gzip':
          result = await GzipDecoder.encode(input);
          break;

        default:
          return {
            success: false,
            result: input,
            type,
            error: i18n.t('error.unsupportedEncodeType'),
          };
      }

      return {
        success: true,
        result,
        type,
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
}

