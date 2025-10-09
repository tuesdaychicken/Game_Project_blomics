// static/js/engine/game.update.js
// 게임 규칙 함수 파일

(function () {

    // 게임 상태, 설정, 프레임, 게임 알림(게임 오버)
    function step(state, cfg, dt, ts, hooks) {

        // 게임 시작 이후 시간 누적 +1초
        state.elapsedMs += dt * 1000;

        // 플레이어 이동 (세모 아이템 효과 시 가속 1.5배)
        const baseSpeed = cfg.moveSpeed * (state.speedBoosted ? 1.5 : 1);
        const dir =
            (state.keys['ArrowRight'] || state.keys['d'] ? 1 : 0) +
            (state.keys['ArrowLeft'] || state.keys['a'] ? -1 : 0);
        state.player.x += dir * baseSpeed * dt;

        // 플레이어가 화면 밖으로 벗어나지 않도록
        state.player.x = GameHelpers.clamp(state.player.x, 0, cfg.width - cfg.playerW);

        // 지면 좌표, 전체 높이 - 지면 두께
        const groundY = cfg.height - cfg.groundH;

        // 난이도 스케일 (경과 시간 기반)
        const t = state.elapsedMs / 1000;

        //낙하물 하강속도 상향 (최대 상한 제한)
        const baseDropSpeed = Math.min(
            cfg.baseDropSpeed + cfg.difficulty.speedGrowthPerSec * t,
            cfg.difficulty.maxDropSpeed
        );

        //스폰간격 하향 (최소 하한 제한)
        const baseSpawnInterval = Math.max(
            cfg.baseSpawnInterval - cfg.difficulty.intervalShrinkPerSec * t,
            cfg.difficulty.minSpawnInterval
        );

        // 마름모 효과 있으면 낙하속도 0.55배 낮추기
        const effectiveDropSpeed = baseDropSpeed * (state.slowed ? cfg.effects.slowedSpeedFactor : 1);

        // 스폰 간격, 동그라미면 증가, 마름모면 줄이기
        let effectiveSpawnInterval = baseSpawnInterval;
        if (state.boosted) effectiveSpawnInterval *= cfg.effects.boostedIntervalFactor;
        if (state.slowed) effectiveSpawnInterval *= cfg.effects.slowedIntervalFactor;

        // 낙하물 스폰 누적 시간
        state.spawnAccMs += dt * 1000;
        //
        while (state.spawnAccMs >= effectiveSpawnInterval) {
            spawnDrop(state, cfg); // 실제 생성
            state.spawnAccMs -= effectiveSpawnInterval; //누적에서 간격만큼 차감
        }

        // 아이템 스폰 누적 시간
        state.itemAccMs += dt * 1000;

        // 아이템 스폰은 고정 간격으로 설정
        while (state.itemAccMs >= cfg.itemSpawnInterval) {
            state.itemAccMs -= cfg.itemSpawnInterval;
            if (Math.random() < cfg.itemChance) spawnItem(state, cfg);
        }

        // 낙하물 이동/충돌 처리
        const aliveDrops = [];
        for (const d of state.drops) {
            d.y += effectiveDropSpeed * dt;

            // 지면 도달 → 점수 +1
            if (d.y + d.r >= groundY) {
                state.score += 1;
                continue;
            }

            // 플레이어 충돌 → 목숨 -1
            const hit = GameHelpers.circleRectIntersect(
                d.x, d.y, d.r,
                state.player.x, groundY - cfg.playerH, cfg.playerW, cfg.playerH
            );
            if (hit) {
                state.lives = Math.max(0, state.lives - 1);
                //목숨 0개인지 체크, 0이면 게임 종료 호출
                if (state.lives <= 0) {
                    hooks?.end?.();
                    return;
                }
                continue;
            }

            // 화면 아래로 완전히 벗어나면 제거
            if (d.y - d.r > cfg.height) continue;

            // 위 조건에 해당안되면 다음 프레임으로 유지
            aliveDrops.push(d);
        }
        // 지면에 닿은 낙하물
        state.drops = aliveDrops;

        // 아이템 이동/획득 처리
        const aliveItems = [];
        for (const it of state.items) {
            //아이템 속도 고정
            it.y += 160 * dt;

            //아이템이 플레이어와 닿았는지 여부
            const caught = GameHelpers.circleRectIntersect(
                it.x, it.y, it.r,
                state.player.x, groundY - cfg.playerH, cfg.playerW, cfg.playerH
            );

            // 닿았다면 아이템 뭔지 전달
            if (caught) {
                activateItem(state, cfg, it.type, ts);
                continue;
            }

            // 아이템이 벗어나면 제거
            if (it.y - it.r > cfg.height)
                continue;

            //위 조건이 아니면 유지
            aliveItems.push(it);
        }
        state.items = aliveItems;

        // 동그라미 효과 만료처리
        if (state.boosted && ts > state.boostEndTime) state.boosted = false;
        
        // 마름모 효과 만료처리
        if (state.slowed && ts > state.slowEndTime) state.slowed = false;
        
        //세모 효과 만료처리
        if (state.speedBoosted && ts > state.speedBoostEndTime) state.speedBoosted = false;
    }

    // 낙하물 생성
    function spawnDrop(state, cfg) {
        
        // 낙하물 좌우 여백
        const pad = cfg.dropSpawnPadding;
        // 여백 제외하고 x좌표랜덤하게 낙하물
        const x = Math.random() * (cfg.width - 2 * pad) + pad;
        // 시작 y 값
        state.drops.push({x, y: -cfg.dropRadius, r: cfg.dropRadius});
    }

    // 아이템 생성
    function spawnItem(state, cfg) {
        //아이템 좌우 여백
        const pad = cfg.dropSpawnPadding;

        const x = Math.random() * (cfg.width - 2 * pad) + pad;
        //아이템 타입 4개 배열
        const types = ['circle', 'square', 'triangle', 'diamond'];
        //아이템 x좌표 랜덤 생성
        const type = types[Math.floor(Math.random() * types.length)];
        state.items.push({x, y: -cfg.itemRadius, r: cfg.itemRadius, type});
    }

    // 아이템 플레이어 접촉시 효과
    function activateItem(state, cfg, type, ts) {

        if (type === 'circle') { // 동그라미 닿으면 스폰간격이 줄어듬
            state.boosted = true;
            state.boostEndTime = ts + cfg.powerDuration;
        } else if (type === 'square') { //네모 목숨 +1
            state.lives = Math.min(cfg.maxLives, state.lives + 1);
        } else if (type === 'triangle') { //세모 속도 상승
            state.speedBoosted = true;
            state.speedBoostEndTime = ts + cfg.powerDuration;
        } else if (type === 'diamond') { // 마름모 스폰간격 상향, 낙하속도 감소
            state.slowed = true;
            state.slowEndTime = ts + cfg.powerDuration;
        }
    }

    window.GameUpdate = {step};
})();