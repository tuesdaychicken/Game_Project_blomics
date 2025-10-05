// static/js/engine/game.input.js
// 키보드 이벤트를 등록/해제하고, state.keys에만 값을 기록

(function () {
    function attachInput(state) {
        // 상태의 keys만 수정하고, 게임 규칙(점수/목숨 등)은 절대 수정하지 않음
        const onKeyDown = (e) => {
            state.keys[e.key] = true;
        };
        const onKeyUp = (e) => {
            state.keys[e.key] = false;
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // 해제 함수 반환 (화면 떠날 때 정리용)
        return function detachInput() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }

    // 전역 공개
    window.GameInput = { attach: attachInput };
})();