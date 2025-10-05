// static/js/engine/game.state.js
// 게임 상태 파일, 생성/초기화만

(function () {
    // 상태 객체를 만들어 반환한다.
    function createGameState() {
        return {
            // 실행 제어
            running: false,
            lastTs: 0,
            elapsedMs: 0,     // 시작 이후 누적 ms

            // HUD 데이터
            score: 0,
            lives: 1,         // 요구사항: 시작 목숨 1

            // 입력 스냅샷
            keys: Object.create(null),

            // 플레이어 위치(초기 x는 중앙, y는 엔진 init()에서 지면 기준으로 배치)
            player: { x: 0, y: 0 },

            // 엔티티 컨테이너
            drops: [],        // 낙하물들
            items: [],        // 아이템들

            // 타이머들
            spawnAccMs: 0,    // 낙하물 스폰 누적(ms)
            itemAccMs: 0,     // 아이템 스폰 누적(ms)

            // 아이템 효과(버프/디버프) 상태
            boosted: false, boostEndTime: 0,        // ○ 스폰 간격 단축
            slowed: false,  slowEndTime: 0,         // ◇ 속도↓/스폰 간격↑
            speedBoosted: false, speedBoostEndTime: 0, // △ 이동속도↑
        };
    }

    // 필요 시 전체 상태를 공장 초기값으로 덮어써서 리셋하는 도우미
    function resetGameState(state) {
        const fresh = createGameState();
        // 얕은 복사로 기존 참조를 유지하면서 필드만 초기화
        for (const k in state) {
            // 배열은 비우기
            if (Array.isArray(state[k])) {
                state[k].length = 0;
            } else {
                state[k] = fresh[k];
            }
        }
    }

    // 전역 공개
    window.GameStateFactory = {
        create: createGameState,
        reset: resetGameState,
    };
})();