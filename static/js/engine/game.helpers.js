// static/js/engine/game.helpers.js
// 자주 사용되는 유틸함수들

(function () {

    // 플레이어 낙하물 충돌 판정
    function circleRectIntersect(cx, cy, cr, rx, ry, rw, rh) {
        const dx = Math.abs(cx - (rx + rw / 2));
        const dy = Math.abs(cy - (ry + rh / 2));
        return dx < rw / 2 + cr && dy < rh / 2 + cr;
    }

    // 플레이어 이동범위 제한
    function clamp(v, min, max) { return Math.max(min, Math.min(v, max)); }

    window.GameHelpers = { circleRectIntersect, clamp };
})();
