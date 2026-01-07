/**
 * 히스토리 패널 컴포넌트
 */
import { HistoryItem } from '../../types';
import { HistoryService } from '../../services/historyService';
import { i18n } from '../../i18n/i18n';
import { escapeHtml } from '../../utils/dom';
import { formatDate, truncateText } from '../../utils/format';

export class HistoryPanel {
  private sectionElement: HTMLDivElement;
  private listContainer: HTMLDivElement;
  private recentContainer: HTMLDivElement;
  private clearAllBtn: HTMLButtonElement;
  private deleteSelectedBtn: HTMLButtonElement;
  private selectAllCheckbox: HTMLInputElement;
  private selectedIds: Set<string> = new Set();
  private onItemClick?: (input: string, decoderType: string) => void;

  constructor(
    sectionElement: HTMLDivElement,
    listContainer: HTMLDivElement,
    recentContainer: HTMLDivElement,
    clearAllBtn: HTMLButtonElement,
    deleteSelectedBtn: HTMLButtonElement,
    selectAllCheckbox: HTMLInputElement
  ) {
    this.sectionElement = sectionElement;
    this.listContainer = listContainer;
    this.recentContainer = recentContainer;
    this.clearAllBtn = clearAllBtn;
    this.deleteSelectedBtn = deleteSelectedBtn;
    this.selectAllCheckbox = selectAllCheckbox;
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    await this.loadHistory();
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.clearAllBtn.addEventListener('click', () => this.clearAll());
    this.deleteSelectedBtn.addEventListener('click', () => this.deleteSelected());
    this.selectAllCheckbox.addEventListener('change', () => this.handleSelectAll());
  }

  /**
   * 히스토리 로드 및 표시
   */
  async loadHistory(): Promise<void> {
    const history = await HistoryService.loadHistory();
    this.updateList(history);
  }

  /**
   * 히스토리 리스트 UI 업데이트
   */
  private updateList(history: HistoryItem[]): void {
    this.listContainer.innerHTML = '';
    this.recentContainer.innerHTML = '';
    this.selectedIds.clear();

    if (history.length === 0) {
      this.sectionElement.style.display = 'none';
      this.updateSelectionUI();
      return;
    }

    this.sectionElement.style.display = 'block';

    // 최근 1개 항목 표시
    const recentItem = history[0];
    const recentItemDiv = this.createHistoryItem(recentItem, true, history.length > 1);
    this.recentContainer.appendChild(recentItemDiv);

    // 나머지 항목들
    if (history.length > 1) {
      const remainingItems = history.slice(1);

      remainingItems.forEach((item) => {
        const itemDiv = this.createHistoryItem(item, false);
        this.listContainer.appendChild(itemDiv);
      });

      this.listContainer.classList.remove('visible');
    } else {
      this.listContainer.classList.remove('visible');
    }

    this.updateSelectionUI();
  }

  /**
   * 히스토리 항목 생성
   */
  private createHistoryItem(
    item: HistoryItem,
    isRecent: boolean = false,
    hasMore: boolean = false
  ): HTMLDivElement {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';
    if (isRecent) {
      itemDiv.classList.add('history-item-recent');
    }

    const timeStr = formatDate(item.timestamp);
    const inputPreview = truncateText(item.input, 60);
    const arrowIcon =
      isRecent && hasMore
        ? `<button class="history-item-arrow" title="${i18n.t('history.toggleExpand')}">▼</button>`
        : '';

    itemDiv.innerHTML = `
      <div class="history-item-checkbox">
        <input type="checkbox" class="history-checkbox" data-id="${item.id}" id="history-${item.id}">
        <label for="history-${item.id}"></label>
      </div>
      <div class="history-item-actions">
        ${arrowIcon}
        <button class="history-item-delete" data-id="${item.id}" title="${i18n.t('history.delete')}">🗑️</button>
      </div>
      <div class="history-item-header">
        <span class="history-item-type">${escapeHtml(item.decoderLabel)}</span>
        <span class="history-item-time">${escapeHtml(timeStr)}</span>
      </div>
      <div class="history-item-input">${escapeHtml(inputPreview)}</div>
    `;

    // 항목 클릭 이벤트
    itemDiv.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('history-item-delete')) {
        return;
      }

      if ((e.target as HTMLElement).classList.contains('history-item-arrow') ||
          (e.target as HTMLElement).closest('.history-item-arrow')) {
        e.stopPropagation();
        this.toggleHistoryExpand();
        return;
      }

      if ((e.target as HTMLElement).closest('.history-item-checkbox')) {
        return;
      }

      if (this.onItemClick) {
        this.onItemClick(item.input, item.decoderType);
      }
    });

    // 삭제 버튼 이벤트
    const deleteBtn = itemDiv.querySelector('.history-item-delete') as HTMLButtonElement;
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.deleteItem(item.id);
      });
    }

    // 화살표 버튼 이벤트
    if (isRecent && hasMore) {
      const arrowBtn = itemDiv.querySelector('.history-item-arrow') as HTMLButtonElement;
      if (arrowBtn) {
        arrowBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleHistoryExpand();
        });
      }
    }

    // 체크박스 이벤트
    const checkbox = itemDiv.querySelector('.history-checkbox') as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('click', (e) => e.stopPropagation());
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
          this.selectedIds.add(item.id);
        } else {
          this.selectedIds.delete(item.id);
        }
        this.updateSelectionUI();
      });
    }

    return itemDiv;
  }

  /**
   * 히스토리 펼치기/접기 토글
   */
  private toggleHistoryExpand(): void {
    const isExpanded = this.listContainer.classList.contains('visible');
    const arrow = this.recentContainer.querySelector('.history-item-arrow') as HTMLButtonElement;

    if (isExpanded) {
      this.listContainer.classList.remove('visible');
      if (arrow) {
        arrow.textContent = '▼';
        arrow.classList.remove('expanded');
        arrow.title = i18n.t('history.toggleExpand');
      }
    } else {
      this.listContainer.classList.add('visible');
      if (arrow) {
        arrow.textContent = '▲';
        arrow.classList.add('expanded');
        arrow.title = i18n.t('history.toggleCollapse');
      }
    }
  }

  /**
   * 히스토리 항목 삭제
   */
  private async deleteItem(id: string): Promise<void> {
    await HistoryService.deleteHistoryItem(id);
    await this.loadHistory();
  }

  /**
   * 전체 히스토리 삭제
   */
  private async clearAll(): Promise<void> {
    if (!confirm(i18n.t('history.confirmDeleteAll'))) {
      return;
    }

    await HistoryService.clearAllHistory();
    this.selectedIds.clear();
    await this.loadHistory();
  }

  /**
   * 전체 선택/해제
   */
  private handleSelectAll(): void {
    const isChecked = this.selectAllCheckbox.checked;
    const allCheckboxes = document.querySelectorAll('.history-checkbox') as NodeListOf<HTMLInputElement>;

    allCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
      const id = checkbox.getAttribute('data-id');
      if (id) {
        if (isChecked) {
          this.selectedIds.add(id);
        } else {
          this.selectedIds.delete(id);
        }
      }
    });

    this.updateSelectionUI();
  }

  /**
   * 선택된 히스토리 삭제
   */
  private async deleteSelected(): Promise<void> {
    if (this.selectedIds.size === 0) {
      alert(i18n.t('history.selectFirst'));
      return;
    }

    if (
      !confirm(
        `${i18n.t('history.deleteSelected')} ${this.selectedIds.size}${i18n.t('history.confirmDeleteSelected')}`
      )
    ) {
      return;
    }

    await HistoryService.deleteSelectedHistory(this.selectedIds);
    this.selectedIds.clear();
    await this.loadHistory();
  }

  /**
   * 선택 UI 업데이트
   */
  private updateSelectionUI(): void {
    const totalCount = document.querySelectorAll('.history-checkbox').length;
    const selectedCount = this.selectedIds.size;

    // 전체 선택 체크박스 상태 업데이트
    if (totalCount === 0) {
      this.selectAllCheckbox.checked = false;
      this.selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === totalCount) {
      this.selectAllCheckbox.checked = true;
      this.selectAllCheckbox.indeterminate = false;
    } else if (selectedCount > 0) {
      this.selectAllCheckbox.checked = false;
      this.selectAllCheckbox.indeterminate = true;
    } else {
      this.selectAllCheckbox.checked = false;
      this.selectAllCheckbox.indeterminate = false;
    }

    // 선택 삭제 버튼 상태 업데이트
    if (selectedCount > 0) {
      this.deleteSelectedBtn.disabled = false;
      this.deleteSelectedBtn.textContent = `${i18n.t('history.deleteSelected')} (${selectedCount})`;
      this.deleteSelectedBtn.style.opacity = '1';
    } else {
      this.deleteSelectedBtn.disabled = true;
      this.deleteSelectedBtn.textContent = i18n.t('history.deleteSelected');
      this.deleteSelectedBtn.style.opacity = '0.5';
    }
  }

  /**
   * 항목 클릭 콜백 설정
   */
  setOnItemClick(callback: (input: string, decoderType: string) => void): void {
    this.onItemClick = callback;
  }
}
