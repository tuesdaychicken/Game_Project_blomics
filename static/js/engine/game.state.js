// static/js/engine/game.state.js
// 게임 시작시 초기 상태 생성 및 초기화
// 추후 확장한다면 게임의 상태를 변환하는 기능 또는 게임의 상태 변환(예시, 스테이지2)

(function () {

    // 게임 상태 생성
    function createGameState() {
        return {
            // 실행 제어
            running: false,
            lastTs: 0,
            elapsedMs: 0,

            // HUD 데이터
            score: 0,
            lives: 1,

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
            boosted: false, boostEndTime: 0,        // 동그라미, 낙하물 스폰 간격 단축
            slowed: false,  slowEndTime: 0,         // 마름모, 낙하물 속도 속도/스폰 간격 증가
            speedBoosted: false, speedBoostEndTime: 0, // 세모, 플레이어 이동속도 증가
        };
    }

    // 전역 공개
    window.GameStateFactory = {
        create: createGameState,
    };
})();