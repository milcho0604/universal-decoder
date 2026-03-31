export interface Translation {
  [key: string]: string;
}

export interface Translations {
  ko: Translation;
  en: Translation;
}

export const translations: Translations = {
  ko: {
    // 헤더
    'header.title': '🔓 Universal Decoder',
    'header.darkMode': '다크모드 토글',
    'header.autoFetch': 'Auto-Fetch 모드 (Storage/Cookie 자동 가져오기)',
    'header.chainDecode': '체인 디코딩 (중첩 인코딩 자동 해제)',
    'header.sidePanel': 'Side Panel로 열기',
    'header.newWindow': '새 창으로 열기',
    'header.devBlog': '개발자 블로그',

    // 디코딩 방식
    'decoder.label': '디코딩 방식',
    'decoder.auto': '자동 감지',
    'decoder.url': 'URL',
    'decoder.base64': 'Base64',
    'decoder.base64url': 'Base64URL',
    'decoder.hex': 'Hex',
    'decoder.jwt': 'JWT',
    'decoder.html': 'HTML',
    'decoder.rot13': 'ROT13',
    'decoder.gzip': 'GZIP',
    'decoder.charcode': 'CharCode',
    'decoder.json-pretty': 'JSON Pretty',

    // 모드
    'mode.decode': '디코딩',
    'mode.encode': '인코딩',

    // Storage 섹션
    'storage.title': 'Storage / Cookie 목록',
    'storage.empty': 'Auto-Fetch 모드를 활성화하면 현재 페이지의 Storage와 Cookie를 가져옵니다.',
    'storage.noItems': 'Storage 항목이 없습니다.',
    'storage.error.noTab': '현재 탭을 찾을 수 없습니다.',
    'storage.error.restricted': '이 페이지에서는 Storage에 접근할 수 없습니다.\n(브라우저 시스템 페이지)',
    'storage.error.fetch': 'Storage 데이터를 가져올 수 없습니다.',
    'storage.error.failed': 'Storage 데이터를 가져오는데 실패했습니다.\n페이지를 새로고침 후 다시 시도해주세요.',

    // 히스토리 섹션
    'history.title': '디코딩 히스토리',
    'history.selectAll': '전체 선택',
    'history.deleteSelected': '선택 삭제',
    'history.deleteAll': '전체 삭제',
    'history.empty': '히스토리가 없습니다.',
    'history.toggleExpand': '목록 펼치기/접기',
    'history.toggleCollapse': '목록 접기',
    'history.delete': '삭제',
    'history.confirmDeleteAll': '모든 히스토리를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
    'history.confirmDeleteSelected': '개의 히스토리를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
    'history.selectFirst': '삭제할 항목을 선택해주세요.',
    'history.deleteFailed': '히스토리 삭제에 실패했습니다.',
    'history.retention.label': '보관 기간',
    'history.retention.1day': '1일',
    'history.retention.7days': '7일',
    'history.retention.30days': '30일',
    'history.retention.90days': '90일',
    'history.retention.unlimited': '무제한',

    // 입력 텍스트
    'input.label': '입력 텍스트',
    'input.placeholder': '디코딩할 텍스트를 입력하세요...',

    // 버튼
    'button.decode': '디코딩',
    'button.clear': '초기화',
    'button.copy': '📋 복사',
    'button.copied': '✅ 복사됨',
    'button.copyFailed': '❌ 실패',
    'button.download': '💾 다운로드',
    'button.downloaded': '✅ 저장됨',
    'button.downloadFailed': '❌ 실패',

    // 결과
    'result.label': '결과',
    'result.empty': '결과가 여기에 표시됩니다...',
    'result.noResult': '결과가 없습니다.',
    'result.decoding': '디코딩 중...',
    'result.inputEmpty': '입력이 비어있습니다.',
    'result.error': '오류가 발생했습니다: ',
    'result.decodeFailed': '디코딩 실패',
    
    // 에러 메시지
    'error.encodeNotSupported': '이 타입은 인코딩을 지원하지 않습니다.',
    'error.unsupportedEncodeType': '지원하지 않는 인코딩 타입입니다.',
    'error.unsupportedDecodeType': '지원하지 않는 디코딩 타입입니다.',
    'error.cannotDetectFormat': '인코딩 형식을 감지할 수 없습니다.',
    'error.encodeFailed': '인코딩 실패',

    // 메타데이터
    'metadata.jwtHeader': 'JWT Header:',
    'metadata.jwtPayload': 'JWT Payload:',

    // 알림
    'alert.sidePanelFailed': 'Side Panel을 열 수 없습니다.',
    'alert.newWindowFailed': '새 창을 열 수 없습니다.',

    // 언어 전환
    'language.current': 'KO',
    'language.switch': '언어 전환 (한국어/English)',

    // 체인 디코딩
    'chain.title': '디코딩 단계',
    'chain.step': '단계',
    'chain.steps': '총 {{count}}단계',
    'chain.finalResult': '최종 결과',
  },
  en: {
    // Header
    'header.title': '🔓 Universal Decoder',
    'header.darkMode': 'Toggle Dark Mode',
    'header.autoFetch': 'Auto-Fetch Mode (Fetch Storage/Cookie automatically)',
    'header.chainDecode': 'Chain Decoding (Auto-decode nested encodings)',
    'header.sidePanel': 'Open in Side Panel',
    'header.newWindow': 'Open in New Window',
    'header.devBlog': 'Developer Blog',

    // Decoder type
    'decoder.label': 'Decoder Type',
    'decoder.auto': 'Auto Detect',
    'decoder.url': 'URL',
    'decoder.base64': 'Base64',
    'decoder.base64url': 'Base64URL',
    'decoder.hex': 'Hex',
    'decoder.jwt': 'JWT',
    'decoder.html': 'HTML',
    'decoder.rot13': 'ROT13',
    'decoder.gzip': 'GZIP',
    'decoder.charcode': 'CharCode',
    'decoder.json-pretty': 'JSON Pretty',

    // Mode
    'mode.decode': 'Decode',
    'mode.encode': 'Encode',

    // Storage section
    'storage.title': 'Storage / Cookie List',
    'storage.empty': 'Enable Auto-Fetch mode to fetch Storage and Cookie from the current page.',
    'storage.noItems': 'No storage items.',
    'storage.error.noTab': 'Current tab not found.',
    'storage.error.restricted': 'Cannot access Storage on this page.\n(Browser system page)',
    'storage.error.fetch': 'Failed to fetch storage data.',
    'storage.error.failed': 'Failed to fetch storage data.\nPlease refresh the page and try again.',

    // History section
    'history.title': 'Decoding History',
    'history.selectAll': 'Select All',
    'history.deleteSelected': 'Delete Selected',
    'history.deleteAll': 'Delete All',
    'history.empty': 'No history.',
    'history.toggleExpand': 'Expand/Collapse list',
    'history.toggleCollapse': 'Collapse list',
    'history.delete': 'Delete',
    'history.confirmDeleteAll': 'Delete all history?\nThis action cannot be undone.',
    'history.confirmDeleteSelected': ' items will be deleted.\nThis action cannot be undone.',
    'history.selectFirst': 'Please select items to delete.',
    'history.deleteFailed': 'Failed to delete history.',
    'history.retention.label': 'Retention',
    'history.retention.1day': '1 day',
    'history.retention.7days': '7 days',
    'history.retention.30days': '30 days',
    'history.retention.90days': '90 days',
    'history.retention.unlimited': 'Unlimited',

    // Input text
    'input.label': 'Input Text',
    'input.placeholder': 'Enter text to decode...',

    // Buttons
    'button.decode': 'Decode',
    'button.clear': 'Clear',
    'button.copy': '📋 Copy',
    'button.copied': '✅ Copied',
    'button.copyFailed': '❌ Failed',
    'button.download': '💾 Download',
    'button.downloaded': '✅ Saved',
    'button.downloadFailed': '❌ Failed',

    // Result
    'result.label': 'Result',
    'result.empty': 'Result will be displayed here...',
    'result.noResult': 'No result.',
    'result.decoding': 'Decoding...',
    'result.inputEmpty': 'Input is empty.',
    'result.error': 'Error occurred: ',
    'result.decodeFailed': 'Decode failed',
    
    // Error messages
    'error.encodeNotSupported': 'This type does not support encoding.',
    'error.unsupportedEncodeType': 'Unsupported encoding type.',
    'error.unsupportedDecodeType': 'Unsupported decoding type.',
    'error.cannotDetectFormat': 'Cannot detect encoding format.',
    'error.encodeFailed': 'Encoding failed',

    // Metadata
    'metadata.jwtHeader': 'JWT Header:',
    'metadata.jwtPayload': 'JWT Payload:',

    // Alerts
    'alert.sidePanelFailed': 'Failed to open Side Panel.',
    'alert.newWindowFailed': 'Failed to open new window.',

    // Language switch
    'language.current': 'EN',
    'language.switch': 'Switch Language (한국어/English)',

    // Chain Decoding
    'chain.title': 'Decoding Steps',
    'chain.step': 'Step',
    'chain.steps': 'Total {{count}} steps',
    'chain.finalResult': 'Final Result',
  },
};
