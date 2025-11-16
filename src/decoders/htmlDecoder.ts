/**
 * HTML 엔티티 디코딩 모듈
 */
export class HtmlDecoder {
  private static entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };
  
  static decode(input: string): string {
    // 숫자 엔티티 디코딩 (&#123; 또는 &#x1F;)
    let result = input.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // 이름 엔티티 디코딩
    for (const [entity, char] of Object.entries(this.entityMap)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }
    
    return result;
  }
  
  static canDecode(input: string): boolean {
    // HTML 엔티티 패턴 확인
    return /&(#?\w+);/.test(input);
  }
}

