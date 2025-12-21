/**
 * History 관련 타입 정의
 */

import { DecoderType } from './decoder';

export interface HistoryItem {
  id: string;
  input: string;
  decoderType: DecoderType;
  result: string;
  timestamp: number;
  decoderLabel: string;
}
