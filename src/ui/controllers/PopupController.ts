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
import { EncoderService } from '../../services/encoderService';
import { HistoryService } from '../../services/historyService';
import { i18n } from '../../i18n/i18n';
import { openSidePanel, openNewWindow } from '../../utils/chrome';
import { DecoderType, ProcessMode } from '../../types';

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
  private modeDecodeBtn: HTMLButtonElement;
  private modeEncodeBtn: HTMLButtonElement;
  private chainDecodeToggle: HTMLButtonElement;

  // 체인 단계 표시 컨테이너
  private chainStepsContainer: HTMLDivElement;

  // 현재 모드
  private currentMode: ProcessMode = 'decode';
  private chainDecodeEnabled: boolean = false;

  constructor() {
    // 버튼 요소 가져오기
    this.decodeButton = document.getElementById('decode-btn') as HTMLButtonElement;
    this.clearButton = document.getElementById('clear-btn') as HTMLButtonElement;
    this.openSidePanelBtn = document.getElementById('open-sidepanel-btn') as HTMLButtonElement;
    this.openWindowBtn = document.getElementById('open-window-btn') as HTMLButtonElement;
    this.modeDecodeBtn = document.getElementById('mode-decode-btn') as HTMLButtonElement;
    this.modeEncodeBtn = document.getElementById('mode-encode-btn') as HTMLButtonElement;
    this.chainDecodeToggle = document.getElementById('chain-decode-toggle') as HTMLButtonElement;

    // 체인 단계 컨테이너
    this.chainStepsContainer = document.getElementById('chain-steps-container') as HTMLDivElement;

    // 컴포넌트 초기화
    this.decoderSelector = new DecoderSelector(
      document.getElementById('decoder-type') as HTMLSelectElement,
      document.getElementById('detected-type-badge') as HTMLSpanElement
    );

    this.inputArea = new InputArea(
      document.getElementById('input-text') as HTMLTextAreaElement,
      document.getElementById('copy-input-btn') as HTMLButtonElement
    );

    this.resultArea = new ResultArea(
      document.getElementById('result-container') as HTMLDivElement,
      document.getElementById('metadata-container') as HTMLDivElement,
      document.getElementById('copy-btn') as HTMLButtonElement,
      document.getElementById('download-btn') as HTMLButtonElement
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
    // 모드 토글 버튼
    this.modeDecodeBtn.addEventListener('click', () => this.handleModeChange('decode'));
    this.modeEncodeBtn.addEventListener('click', () => this.handleModeChange('encode'));

    // 체인 디코딩 토글
    this.chainDecodeToggle.addEventListener('click', () => this.handleChainToggle());

    // 디코딩 버튼
    this.decodeButton.addEventListener('click', () => this.handleProcess());

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
      if (this.currentMode === 'decode' && this.decoderSelector.getSelectedType() === 'auto') {
        this.handleProcess();
      }
    });
    this.inputArea.onDecodeRequested(() => this.handleProcess());

    // Storage 패널 - 항목 클릭 시 자동 디코딩
    this.storagePanel.setOnItemClick((value) => {
      this.inputArea.setValue(value);
      this.handleProcess();
    });

    // History 패널 - 항목 클릭 시 복원 및 디코딩
    this.historyPanel.setOnItemClick((input, decoderType) => {
      this.inputArea.setValue(input);
      this.decoderSelector.setType(decoderType as DecoderType);
      this.handleProcess();
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
   * 체인 디코딩 토글
   */
  private handleChainToggle(): void {
    this.chainDecodeEnabled = !this.chainDecodeEnabled;

    if (this.chainDecodeEnabled) {
      this.chainDecodeToggle.classList.add('active');
      // 체인 모드에서는 자동 감지 강제
      this.decoderSelector.setType('auto');
    } else {
      this.chainDecodeToggle.classList.remove('active');
      this.hideChainSteps();
    }
  }

  /**
   * 체인 디코딩 단계 표시
   */
  private showChainSteps(steps: any[], totalSteps: number): void {
    const stepsHtml = steps.map((step, index) => {
      const decoderLabel = i18n.t(`decoder.${step.type}`) || step.type;

      const truncatedOutput = step.output.length > 100
        ? step.output.substring(0, 100) + '...'
        : step.output;

      return `
        <div class="chain-step-item">
          <div class="chain-step-header">
            <span class="chain-step-arrow">${index === 0 ? '📥' : '↓'}</span>
            <span>${i18n.t('chain.step')} ${step.step}</span>
            <span class="chain-step-type">${decoderLabel}</span>
          </div>
          <div class="chain-step-output">${this.escapeHtml(truncatedOutput)}</div>
        </div>
      `;
    }).join('');

    const header = `
      <div class="chain-steps-header">
        🔗 ${i18n.t('chain.title')} (${i18n.t('chain.steps').replace('{{count}}', totalSteps.toString())})
      </div>
    `;

    this.chainStepsContainer.innerHTML = header + stepsHtml;
    this.chainStepsContainer.style.display = 'block';
  }

  /**
   * 체인 단계 숨기기
   */
  private hideChainSteps(): void {
    this.chainStepsContainer.style.display = 'none';
    this.chainStepsContainer.innerHTML = '';
  }

  /**
   * HTML 이스케이프
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 모드 변경 처리 (디코딩/인코딩)
   */
  private handleModeChange(mode: ProcessMode): void {
    this.currentMode = mode;

    // 버튼 활성화 상태 업데이트
    if (mode === 'decode') {
      this.modeDecodeBtn.classList.add('active');
      this.modeEncodeBtn.classList.remove('active');
      this.decodeButton.textContent = i18n.t('button.decode');
    } else {
      this.modeDecodeBtn.classList.remove('active');
      this.modeEncodeBtn.classList.add('active');
      this.decodeButton.textContent = i18n.t('mode.encode');

      // 인코딩 모드에서는 체인 디코딩 비활성화
      if (this.chainDecodeEnabled) {
        this.chainDecodeEnabled = false;
        this.chainDecodeToggle.classList.remove('active');
        this.hideChainSteps();
      }
    }

    // 인코딩 모드에서는 자동 감지 비활성화
    const decoderSelect = this.decoderSelector['selectElement'] as HTMLSelectElement;
    const autoOption = Array.from(decoderSelect.options).find(opt => opt.value === 'auto');
    if (autoOption) {
      autoOption.disabled = mode === 'encode';
    }

    // 현재 auto가 선택되어 있고 인코딩 모드로 변경하면 첫 번째 지원 타입으로 변경
    if (mode === 'encode' && this.decoderSelector.getSelectedType() === 'auto') {
      const firstSupportedType = DecoderService.getAvailableDecoders()
        .find(d => d.supportsEncode);
      if (firstSupportedType) {
        this.decoderSelector.setType(firstSupportedType.value);
      }
    }

    // 배지 숨기기
    this.decoderSelector.hideBadge();
  }

  /**
   * 입력 변경 시 처리
   */
  private handleInputChange(): void {
    if (this.currentMode === 'decode' && this.decoderSelector.getSelectedType() === 'auto' && this.inputArea.getValue()) {
      const detected = DecoderService.detectDecoder(this.inputArea.getValue());
      // 자동 감지 정보 업데이트 (실제 디코딩은 하지 않음)
    }
  }

  /**
   * 디코딩/인코딩 실행
   */
  private async handleProcess(): Promise<void> {
    const input = this.inputArea.getValue();

    if (!input) {
      this.resultArea.showResult('', false, i18n.t('result.inputEmpty'));
      return;
    }

    const decoderType = this.decoderSelector.getSelectedType();

    // 로딩 표시
    const loadingText = this.currentMode === 'decode' ? i18n.t('result.decoding') : i18n.t('mode.encode') + '...';
    this.resultArea.showResult(loadingText, false);
    this.decodeButton.disabled = true;

    try {
      if (this.currentMode === 'decode') {
        // 체인 디코딩 모드
        if (this.chainDecodeEnabled) {
          const chainResult = await DecoderService.decodeChain(input);

          if (chainResult.success && chainResult.steps.length > 0) {
            // 체인 단계 표시
            this.showChainSteps(chainResult.steps, chainResult.totalSteps);

            // 최종 결과 표시
            this.resultArea.showResult(chainResult.finalResult, true);

            // 히스토리에 저장 (최종 결과만)
            const lastStep = chainResult.steps[chainResult.steps.length - 1];
            const decoderLabel = i18n.t(`decoder.${lastStep.type}`) || i18n.t('decoder.auto');

            await HistoryService.saveToHistory(
              input,
              lastStep.type,
              chainResult.finalResult,
              `🔗 ${decoderLabel}`
            );

            // 히스토리 패널 갱신
            await this.historyPanel.loadHistory();

            // 배지 숨김
            this.decoderSelector.hideBadge();
          } else {
            this.hideChainSteps();
            this.resultArea.showResult(
              chainResult.error || i18n.t('result.decodeFailed'),
              false,
              chainResult.error
            );
          }
        } else {
          // 일반 디코딩 모드
          this.hideChainSteps();
          const result = await DecoderService.decode(input, decoderType);

          if (result.success) {
            this.resultArea.showResult(result.result, true, undefined, result.metadata);

            // 히스토리에 저장
            const decoderLabel = i18n.t(`decoder.${result.type}`) || i18n.t('decoder.auto');

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
        }
      } else {
        // 인코딩 모드
        this.hideChainSteps();
        const result = await EncoderService.encode(input, decoderType);

        if (result.success) {
          this.resultArea.showResult(result.result, true);
          this.decoderSelector.hideBadge();
        } else {
          this.resultArea.showResult(
            result.error || i18n.t('error.encodeFailed'),
            false,
            result.error
          );
        }
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
    this.hideChainSteps();
    this.inputArea.focus();
  }
}
