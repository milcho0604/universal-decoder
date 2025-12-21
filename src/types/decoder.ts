/**
 * 디코더 타입 정의
 */

export type DecoderType =
  | 'url'
  | 'html'
  | 'base64'
  | 'base64url'
  | 'jwt'
  | 'hex'
  | 'charcode'
  | 'rot13'
  | 'gzip'
  | 'json-pretty'
  | 'auto';

export interface DecodeResult {
  success: boolean;
  result: string;
  type: DecoderType;
  error?: string;
  metadata?: any;
}

export interface DecoderOption {
  value: DecoderType;
  label: string;
}
