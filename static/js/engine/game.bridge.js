// static/js/engine/game.bridge.js
// 게임 엔진과 페이지 연결 (종료 여부를 브리지에서 확인)

(function () {
    let gameOverHandler = null; // 페이지 쪽에서 등록할 콜백

    // 게임 종료되면 페이지js에서 함수 호출
    function setGameOverHandler(fn) {
        if (typeof fn === 'function') gameOverHandler = fn;
    }

    // 종료 되면 값 저장 함수 호출
    function gameOver(score) {
        try {
            if (gameOverHandler) return gameOverHandler(score);
            console.warn('[GameBridge] No gameOver handler set.');
        } catch (e) {
            console.error('[GameBridge] gameOver handler error:', e);
        }
    }

    window.GameBridge = { setGameOverHandler, gameOver };
})();