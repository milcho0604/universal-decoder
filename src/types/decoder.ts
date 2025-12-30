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

export type ProcessMode = 'decode' | 'encode';

export interface DecodeResult {
  success: boolean;
  result: string;
  type: DecoderType;
  error?: string;
  metadata?: any;
}

export interface EncodeResult {
  success: boolean;
  result: string;
  type: DecoderType;
  error?: string;
}

export interface DecoderOption {
  value: DecoderType;
  label: string;
  supportsEncode: boolean;
}

export interface DecodingStep {
  step: number;
  type: DecoderType;
  input: string;
  output: string;
  success: boolean;
}

export interface ChainDecodeResult {
  success: boolean;
  steps: DecodingStep[];
  finalResult: string;
  totalSteps: number;
  error?: string;
}
