// static/js/engine/game.input.js
// 키보드 입력여부를 게임 상태에 반영
// 추후 확장시 마우스 조작을 추가하여 게임 컨텐츠 확장 가능

(function () {
    function attachInput(state) {

        // 키보드 키 눌렀는지 안눌렀는지 체크!
        const onKeyDown = (e) => {
            state.keys[e.key] = true;
        };
        const onKeyUp = (e) => {
            state.keys[e.key] = false;
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // 게임 종료시(엔진 종료) 연결 해제 함수
        return function detachInput() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }

    // 전역 공개
    window.GameInput = { attach: attachInput };
})();