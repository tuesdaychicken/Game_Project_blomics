// static/js/engine/game.settings.js

(function () {
    window.GameSettings = {
        // 캔버스/플레이어 기본
        width: 480,
        height: 720,
        groundH: 24,
        playerW: 40,
        playerH: 40,
        moveSpeed: 280,

        // 낙하물 기본값(난이도 스케일의 기준점)
        baseDropSpeed: 220,          // px/s (t=0)
        baseSpawnInterval: 600,      // ms (t=0)
        dropRadius: 6,
        dropSpawnPadding: 8,

        // 난이도 스케일 파라미터
        difficulty: {
            speedGrowthPerSec: 1.2,    // 초당 속도 +1.2
            intervalShrinkPerSec: 2.5, // 초당 간격 -2.5ms
            maxDropSpeed: 720,         // 속도 상한
            minSpawnInterval: 160      // 간격 하한
        },

        // 아이템/효과
        itemRadius: 8,
        itemSpawnInterval: 3000,
        itemChance: 0.5,
        powerDuration: 5000,         // 각 효과 지속(ms)

        // 효과 계수(스케일된 값에 곱해 적용)
        effects: {
            boostedIntervalFactor: 0.5,  // ○ 스폰 간격 절반
            slowedIntervalFactor: 1.6,   // ◇ 스폰 간격 1.6배
            slowedSpeedFactor: 0.55      // ◇ 낙하 속도 55%
        },

        maxLives: 5,
    };
})();