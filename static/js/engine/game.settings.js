// static/js/engine/game.settings.js
//게임에 사용되는 모든 설정
// 추후 확장한다면 기본설정, 낙하물_설정, 아이템_설정, 아이템효과_설정 이렇게 분리

(function () {
    window.GameSettings = {

        width: 480, height: 720, // 캔버스 크기
        groundH: 24,    // 하단 지면 두께
        playerW: 40, playerH: 40, // 플레이어 크기
        moveSpeed: 280, // 플레이어 속도

        // 낙하물 기본값
        baseDropSpeed: 220, // px/s (t=0) 낙하물 떨어진느 속도
        baseSpawnInterval: 600, // ms (t=0) 기본 스폰 간격
        dropRadius: 6, // 낙하물 크키
        dropSpawnPadding: 8, // 스폰시 좌우 padding값

        // 난이도 스케일 파라미터
        difficulty: {
            speedGrowthPerSec: 1.2, // 초당 하강속도 +1.2
            intervalShrinkPerSec: 2.5, // 초당 스폰간격 -2.5ms
            maxDropSpeed: 1000, // 하강속도 최대값
            minSpawnInterval: 160 // 스폰속도 최소값
        },

        // 아이템
        itemRadius: 8, // 아이템 크기 기준
        itemSpawnInterval: 3000, //아이템 스폰 주기
        itemChance: 0.5, // 주기에 맞게 50% 확률로 생성
        powerDuration: 5000, // 아이템 효과 만료시간(ms)

        // 아이템 효과 계수값
        effects: {
            boostedIntervalFactor: 0.5,  // 동그라미 효과, 스폰 간격 절반, 낙하물 생성 스폰 증가
            slowedIntervalFactor: 1.6,   // 마름모 효과, 스폰 간격 1.6배, 낙하물 생성 스폰 감소
            slowedSpeedFactor: 0.55      // 마름모 효과, 낙하 속도 55%, 낙하물 하강 속도 감소
        },

        // 플레이어 최대 목숨
        maxLives: 5,
    };
})();