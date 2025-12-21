/**
 * Popup 메인 컨트롤러
 * 모든 UI 컴포넌트를 조율하고 디코딩 로직을 처리
 */
import {
  DecoderSelector,
  InputArea,
  ResultArea,
  HistoryPanel,
  StoragePanel,
  ThemeToggle,
  LanguageToggle,
} from '../components';
import { DecoderService } from '../../services/decoderService';
import { HistoryService } from '../../services/historyService';
import { i18n } from '../../i18n/i18n';
import { openSidePanel, openNewWindow } from '../../utils/chrome';
import { DecoderType } from '../../types';

export class PopupController {
  // 컴포넌트들
  private decoderSelector: DecoderSelector;
  private inputArea: InputArea;
  private resultArea: ResultArea;
  private historyPanel: HistoryPanel;
  private storagePanel: StoragePanel;
  private themeToggle: ThemeToggle;
  private languageToggle: LanguageToggle;

  // 버튼들
  private decodeButton: HTMLButtonElement;
  private clearButton: HTMLButtonElement;
  private openSidePanelBtn: HTMLButtonElement;
  private openWindowBtn: HTMLButtonElement;

  constructor() {
    // 버튼 요소 가져오기
    this.decodeButton = document.getElementById('decode-btn') as HTMLButtonElement;
    this.clearButton = document.getElementById('clear-btn') as HTMLButtonElement;
    this.openSidePanelBtn = document.getElementById('open-sidepanel-btn') as HTMLButtonElement;
    this.openWindowBtn = document.getElementById('open-window-btn') as HTMLButtonElement;

    // 컴포넌트 초기화
    this.decoderSelector = new DecoderSelector(
      document.getElementById('decoder-type') as HTMLSelectElement,
      document.getElementById('detected-type-badge') as HTMLSpanElement
    );

    this.inputArea = new InputArea(
      document.getElementById('input-text') as HTMLTextAreaElement
    );

    this.resultArea = new ResultArea(
      document.getElementById('result-container') as HTMLDivElement,
      document.getElementById('metadata-container') as HTMLDivElement,
      document.getElementById('copy-btn') as HTMLButtonElement
    );

    this.historyPanel = new HistoryPanel(
      document.getElementById('history-section') as HTMLDivElement,
      document.getElementById('history-list-container') as HTMLDivElement,
      document.getElementById('history-recent-container') as HTMLDivElement,
      document.getElementById('clear-history-btn') as HTMLButtonElement,
      document.getElementById('delete-selected-btn') as HTMLButtonElement,
      document.getElementById('select-all-checkbox') as HTMLInputElement
    );

    this.storagePanel = new StoragePanel(
      document.getElementById('storage-section') as HTMLDivElement,
      document.getElementById('storage-list-container') as HTMLDivElement,
      document.getElementById('auto-fetch-toggle') as HTMLButtonElement
    );

    this.themeToggle = new ThemeToggle(
      document.getElementById('theme-toggle') as HTMLButtonElement
    );

    this.languageToggle = new LanguageToggle(
      document.getElementById('language-toggle') as HTMLButtonElement
    );
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    console.log('Popup controller initializing...');

    // 언어 초기화 (가장 먼저!)
    await this.languageToggle.initialize();
    i18n.updatePageText();

    // 컴포넌트 초기화
    await this.decoderSelector.initialize();
    this.inputArea.initialize();
    this.resultArea.initialize();
    await this.historyPanel.initialize();
    await this.storagePanel.initialize();
    await this.themeToggle.initialize();

    // 이벤트 리스너 설정
    this.setupEventListeners();

    console.log('Popup controller initialized');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 디코딩 버튼
    this.decodeButton.addEventListener('click', () => this.handleDecode());

    // 초기화 버튼
    this.clearButton.addEventListener('click', () => this.handleClear());

    // Side Panel 열기
    this.openSidePanelBtn.addEventListener('click', async () => {
      const success = await openSidePanel();
      if (!success) {
        alert(i18n.t('alert.sidePanelFailed'));
      }
    });

    // 새 창 열기
    this.openWindowBtn.addEventListener('click', async () => {
      try {
        await openNewWindow('popup.html', 500, 620);
      } catch (error) {
        alert(i18n.t('alert.newWindowFailed'));
      }
    });

    // 언어 변경 시 컴포넌트 업데이트
    this.languageToggle.setOnLanguageChange(() => {
      this.decoderSelector.updateOptions();
      this.historyPanel.loadHistory();
    });

    // 입력 영역 이벤트
    this.inputArea.onInput(() => this.handleInputChange());
    this.inputArea.onPaste(() => {
      if (this.decoderSelector.getSelectedType() === 'auto') {
        this.handleDecode();
      }
    });
    this.inputArea.onDecodeRequested(() => this.handleDecode());

    // Storage 패널 - 항목 클릭 시 자동 디코딩
    this.storagePanel.setOnItemClick((value) => {
      this.inputArea.setValue(value);
      this.handleDecode();
    });

    // History 패널 - 항목 클릭 시 복원 및 디코딩
    this.historyPanel.setOnItemClick((input, decoderType) => {
      this.inputArea.setValue(input);
      this.decoderSelector.setType(decoderType as DecoderType);
      this.handleDecode();
    });

    // ESC로 팝업 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });

    // 개발자 블로그 링크
    const devBlogLink = document.getElementById('dev-blog-link') as HTMLAnchorElement;
    devBlogLink.addEventListener('click', () => {
      window.open(
        'https://velog.io/@milcho0604/posts',
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  /**
   * 입력 변경 시 처리
   */
  private handleInputChange(): void {
    if (this.decoderSelector.getSelectedType() === 'auto' && this.inputArea.getValue()) {
      const detected = DecoderService.detectDecoder(this.inputArea.getValue());
      // 자동 감지 정보 업데이트 (실제 디코딩은 하지 않음)
    }
  }

  /**
   * 디코딩 실행
   */
  private async handleDecode(): Promise<void> {
    const input = this.inputArea.getValue();

    if (!input) {
      this.resultArea.showResult('', false, i18n.t('result.inputEmpty'));
      return;
    }

    const decoderType = this.decoderSelector.getSelectedType();

    // 로딩 표시
    this.resultArea.showResult(i18n.t('result.decoding'), false);
    this.decodeButton.disabled = true;

    try {
      const result = await DecoderService.decode(input, decoderType);

      if (result.success) {
        this.resultArea.showResult(result.result, true, undefined, result.metadata);

        // 히스토리에 저장
        const decoderLabel =
          DecoderService.getAvailableDecoders().find((d) => d.value === result.type)
            ?.label || i18n.t('decoder.auto');

        await HistoryService.saveToHistory(
          input,
          result.type,
          result.result,
          decoderLabel
        );

        // 히스토리 패널 갱신
        await this.historyPanel.loadHistory();

        // 자동 감지 모드에서 감지된 타입 표시
        if (decoderType === 'auto' && result.type !== 'auto') {
          this.decoderSelector.showDetectedBadge(result.type);
        } else {
          this.decoderSelector.hideBadge();
        }
      } else {
        this.resultArea.showResult(
          result.error || i18n.t('result.decodeFailed'),
          false,
          result.error
        );
        this.decoderSelector.hideBadge();
      }
    } catch (error) {
      this.resultArea.showResult(
        i18n.t('result.error') + (error as Error).message,
        false
      );
    } finally {
      this.decodeButton.disabled = false;
    }
  }

  /**
   * 초기화
   */
  private handleClear(): void {
    this.inputArea.clear();
    this.resultArea.clear();
    this.decoderSelector.setType('auto');
    this.decoderSelector.hideBadge();
    this.inputArea.focus();
  }
}
