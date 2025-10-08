// static/js/engine/game.loop.js
// 상태에 따른 화면 변화 반복(loop) <- 없으면 그림만 그려지고 움직이지 않음

(function () {
    // 게임 규칙, 그리기, 게임 종료 여부, 프레임 상한선
    function start({ update, render, isRunning, maxDt = 0.033 }) {
        let frameId = null;
        let lastTs = 0;

        function frame(ts) {
            if (!isRunning || !isRunning()) return; // 엔진에서 running=false면 즉시 중단

            if (!lastTs) lastTs = ts;
            let dt = (ts - lastTs) / 1000;  // 초 단위
            if (dt > maxDt) dt = maxDt;             // 급정지/탭 전환 등으로 dt 과도해지는 것 방지
            lastTs = ts;

            try {
                update(dt, ts);  // 규칙/상태 갱신
                render();        // 화면 그리기
            } catch (e) {
                console.error('[GameLoop] frame error:', e);
            }
            frameId = requestAnimationFrame(frame);
        }

        frameId = requestAnimationFrame(frame);

        // 루프 정지 함수 반환
        return function stop() {
            if (frameId) cancelAnimationFrame(frameId);
            lastTs = 0;
            frameId = null;
        };
    }

    window.GameLoop = { start };
})();