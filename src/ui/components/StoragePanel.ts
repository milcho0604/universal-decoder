/**
 * Storage/Cookie 패널 컴포넌트
 */
import { StorageItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { i18n } from '../../i18n/i18n';
import { escapeHtml } from '../../utils/dom';

export class StoragePanel {
  private sectionElement: HTMLDivElement;
  private listContainer: HTMLDivElement;
  private toggleButton: HTMLButtonElement;
  private onItemClick?: (value: string) => void;

  constructor(
    sectionElement: HTMLDivElement,
    listContainer: HTMLDivElement,
    toggleButton: HTMLButtonElement
  ) {
    this.sectionElement = sectionElement;
    this.listContainer = listContainer;
    this.toggleButton = toggleButton;
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    await this.loadAutoFetchMode();
    this.setupEventListeners();
  }

  /**
   * Auto-Fetch 모드 불러오기
   */
  private async loadAutoFetchMode(): Promise<void> {
    const enabled = await StorageService.loadAutoFetchMode();
    if (enabled) {
      this.toggleButton.classList.add('active');
      this.sectionElement.style.display = 'block';
      await this.fetchData();
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.toggleButton.addEventListener('click', async () => {
      await this.toggleAutoFetch();
    });
  }

  /**
   * Auto-Fetch 토글
   */
  private async toggleAutoFetch(): Promise<void> {
    const isActive = this.toggleButton.classList.toggle('active');
    await StorageService.saveAutoFetchMode(isActive);

    if (isActive) {
      this.sectionElement.style.display = 'block';
      await this.fetchData();
    } else {
      this.sectionElement.style.display = 'none';
    }
  }

  /**
   * Storage 데이터 가져오기
   */
  private async fetchData(): Promise<void> {
    try {
      const data = await StorageService.fetchStorageData();
      if (data) {
        this.updateList(data.items);
      }
    } catch (error) {
      this.showError((error as Error).message);
    }
  }

  /**
   * Storage 리스트 UI 업데이트
   */
  private updateList(items: StorageItem[]): void {
    this.listContainer.innerHTML = '';
    this.listContainer.classList.add('visible');

    if (items.length === 0) {
      this.listContainer.innerHTML = `<div class="storage-list-empty">${i18n.t('storage.noItems')}</div>`;
      return;
    }

    items.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'storage-item';
      itemDiv.innerHTML = `
        <div class="storage-item-header">
          <span class="storage-item-key">${escapeHtml(item.key)}</span>
          <span class="storage-item-type">${item.type}</span>
        </div>
        <div class="storage-item-value">${escapeHtml(item.value)}</div>
      `;

      // 클릭 시 콜백 실행
      itemDiv.addEventListener('click', () => {
        if (this.onItemClick) {
          this.onItemClick(item.value);
        }
      });

      this.listContainer.appendChild(itemDiv);
    });
  }

  /**
   * 에러 표시
   */
  private showError(message: string): void {
    this.listContainer.innerHTML = `<div class="storage-list-empty">${escapeHtml(message)}</div>`;
    this.listContainer.classList.add('visible');
  }

  /**
   * 항목 클릭 콜백 설정
   */
  setOnItemClick(callback: (value: string) => void): void {
    this.onItemClick = callback;
  }
}
