/**
 * 디코더 타입 선택 컴포넌트
 */
import { DecoderType } from '../../types';
import { DecoderService } from '../../services/decoderService';
import { i18n } from '../../i18n/i18n';
import { saveToStorage, getFromStorage } from '../../utils/chrome';

export class DecoderSelector {
  private selectElement: HTMLSelectElement;
  private badgeElement: HTMLSpanElement;

  constructor(
    selectElement: HTMLSelectElement,
    badgeElement: HTMLSpanElement
  ) {
    this.selectElement = selectElement;
    this.badgeElement = badgeElement;
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    this.updateOptions();
    await this.loadSavedType();
    this.setupEventListeners();
  }

  /**
   * 디코더 옵션 업데이트 (언어 변경 시)
   */
  updateOptions(): void {
    const currentValue = this.selectElement.value;
    const decoders = DecoderService.getAvailableDecoders();
    this.selectElement.innerHTML = '';

    decoders.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = i18n.t(`decoder.${value}`);
      this.selectElement.appendChild(option);
    });

    // 이전 선택값 복원
    if (this.selectElement.querySelector(`option[value="${currentValue}"]`)) {
      this.selectElement.value = currentValue;
    }
  }

  /**
   * 저장된 디코더 타입 불러오기
   */
  private async loadSavedType(): Promise<void> {
    const savedType = await getFromStorage<DecoderType>('decoderType');
    if (savedType && this.selectElement.querySelector(`option[value="${savedType}"]`)) {
      this.selectElement.value = savedType;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.selectElement.addEventListener('change', () => {
      this.saveSelectedType();
      this.hideBadge();
    });
  }

  /**
   * 선택된 타입 저장
   */
  private async saveSelectedType(): Promise<void> {
    await saveToStorage('decoderType', this.selectElement.value);
  }

  /**
   * 현재 선택된 타입 가져오기
   */
  getSelectedType(): DecoderType {
    return this.selectElement.value as DecoderType;
  }

  /**
   * 타입 설정
   */
  setType(type: DecoderType): void {
    this.selectElement.value = type;
  }

  /**
   * 감지된 타입 뱃지 표시
   */
  showDetectedBadge(type: DecoderType): void {
    const label = i18n.t(`decoder.${type}`);
    this.badgeElement.textContent = `✓ ${label}`;
    this.badgeElement.style.display = 'inline-block';
  }

  /**
   * 뱃지 숨기기
   */
  hideBadge(): void {
    this.badgeElement.style.display = 'none';
  }
}
