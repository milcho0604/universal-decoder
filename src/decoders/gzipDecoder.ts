/**
 * Base64 + GZIP 압축 해제 모듈
 */
export class GzipDecoder {
  /**
   * Base64로 인코딩된 GZIP 데이터 디코딩
   */
  static async decode(input: string): Promise<string> {
    try {
      // Base64 디코딩
      const base64Decoded = atob(input.trim().replace(/\s/g, ''));

      // Uint8Array로 변환
      const bytes = new Uint8Array(base64Decoded.length);
      for (let i = 0; i < base64Decoded.length; i++) {
        bytes[i] = base64Decoded.charCodeAt(i);
      }

      // DecompressionStream 사용 (Chrome 80+)
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(bytes);
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      // 모든 청크를 하나로 합치기
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      // UTF-8 문자열로 변환
      return new TextDecoder().decode(result);
    } catch (e) {
      throw new Error('Failed to decompress GZIP data: ' + (e as Error).message);
    }
  }

  /**
   * GZIP 압축 후 Base64 인코딩
   */
  static async encode(input: string): Promise<string> {
    try {
      // UTF-8 바이트로 변환
      const bytes = new TextEncoder().encode(input);

      // CompressionStream 사용 (Chrome 80+)
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(bytes);
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      // 모든 청크를 하나로 합치기
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const compressed = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      // Base64 인코딩
      const binaryString = Array.from(compressed, byte => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
    } catch (e) {
      throw new Error('Failed to compress GZIP data: ' + (e as Error).message);
    }
  }
  
  static canDecode(input: string): boolean {
    // Base64 형식이고, GZIP 헤더 확인 (1F 8B)
    try {
      const cleaned = input.trim().replace(/\s/g, '');
      if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
        return false;
      }
      
      const decoded = atob(cleaned);
      if (decoded.length < 2) {
        return false;
      }
      
      // GZIP 매직 넘버 확인 (0x1F 0x8B)
      return decoded.charCodeAt(0) === 0x1F && decoded.charCodeAt(1) === 0x8B;
    } catch {
      return false;
    }
  }
}

