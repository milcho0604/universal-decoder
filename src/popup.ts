/**
 * Popup 엔트리 포인트
 * 리팩토링된 구조: 컨트롤러 패턴 사용
 */
import { PopupController } from './ui/controllers/PopupController';

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup script loaded!');

  try {
    const controller = new PopupController();
    await controller.initialize();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
});
