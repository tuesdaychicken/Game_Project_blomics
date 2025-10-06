// static/js/engine/game.bridge.js

(function () {
    let gameOverHandler = null; // 페이지 쪽에서 등록할 콜백

    function setGameOverHandler(fn) {
        if (typeof fn === 'function') gameOverHandler = fn;
    }

    function gameOver(score) {
        try {
            if (gameOverHandler) return gameOverHandler(score);
            if (typeof window.gameOver === 'function') return window.gameOver(score); // fallback
            console.warn('[GameBridge] No gameOver handler set.');
        } catch (e) {
            console.error('[GameBridge] gameOver handler error:', e);
        }
    }

    window.GameBridge = { setGameOverHandler, gameOver };
})();