// static/js/engine/game.helpers.js

(function () {
    /**
     * 원(낙하물/아이템)과 사각형(플레이어) 충돌 판정의 빠른 근사
     * @param {number} cx - 원 중심 x
     * @param {number} cy - 원 중심 y
     * @param {number} cr - 원 반지름
     * @param {number} rx - 사각형 x (좌상단)
     * @param {number} ry - 사각형 y (좌상단)
     * @param {number} rw - 사각형 너비
     * @param {number} rh - 사각형 높이
     * @returns {boolean} 충돌 여부
     */
    function circleRectIntersect(cx, cy, cr, rx, ry, rw, rh) {
        const dx = Math.abs(cx - (rx + rw / 2));
        const dy = Math.abs(cy - (ry + rh / 2));
        return dx < rw / 2 + cr && dy < rh / 2 + cr;
    }

    // (옵션) 범위 제한 도우미
    function clamp(v, min, max) { return Math.max(min, Math.min(v, max)); }

    // 전역 공개
    window.GameHelpers = { circleRectIntersect, clamp };
})();
