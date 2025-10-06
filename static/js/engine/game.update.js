// static/js/engine/game.update.js

(function () {
    function step(state, cfg, dt, ts, hooks) {
        // 1) 시간 누적
        state.elapsedMs += dt * 1000;

        // 2) 플레이어 이동 (△ 효과 시 가속)
        const baseSpeed = cfg.moveSpeed * (state.speedBoosted ? 1.5 : 1);
        const dir =
            (state.keys['ArrowRight'] || state.keys['d'] ? 1 : 0) +
            (state.keys['ArrowLeft']  || state.keys['a'] ? -1 : 0);
        state.player.x += dir * baseSpeed * dt;
        state.player.x = GameHelpers.clamp(state.player.x, 0, cfg.width - cfg.playerW);

        const groundY = cfg.height - cfg.groundH;

        // 3) 난이도 스케일 (경과 시간 기반)
        const t = state.elapsedMs / 1000;
        const baseDropSpeed = Math.min(
            cfg.baseDropSpeed + cfg.difficulty.speedGrowthPerSec * t,
            cfg.difficulty.maxDropSpeed
        );
        const baseSpawnInterval = Math.max(
            cfg.baseSpawnInterval - cfg.difficulty.intervalShrinkPerSec * t,
            cfg.difficulty.minSpawnInterval
        );

        // 4) 효과 적용
        const effectiveDropSpeed = baseDropSpeed * (state.slowed ? cfg.effects.slowedSpeedFactor : 1);
        let effectiveSpawnInterval = baseSpawnInterval;
        if (state.boosted) effectiveSpawnInterval *= cfg.effects.boostedIntervalFactor;
        if (state.slowed)  effectiveSpawnInterval *= cfg.effects.slowedIntervalFactor;

        // 5) 낙하물 스폰
        state.spawnAccMs += dt * 1000;
        while (state.spawnAccMs >= effectiveSpawnInterval) {
            spawnDrop(state, cfg);
            state.spawnAccMs -= effectiveSpawnInterval;
        }

        // 6) 아이템 스폰
        state.itemAccMs += dt * 1000;
        while (state.itemAccMs >= cfg.itemSpawnInterval) {
            state.itemAccMs -= cfg.itemSpawnInterval;
            if (Math.random() < cfg.itemChance) spawnItem(state, cfg);
        }

        // 7) 낙하물 이동/충돌 처리
        const aliveDrops = [];
        for (const d of state.drops) {
            d.y += effectiveDropSpeed * dt;

            // 지면 도달 → 점수 +1
            if (d.y + d.r >= groundY) { state.score += 1; continue; }

            // 플레이어 충돌 → 목숨 -1
            const hit = GameHelpers.circleRectIntersect(
                d.x, d.y, d.r,
                state.player.x, groundY - cfg.playerH, cfg.playerW, cfg.playerH
            );
            if (hit) {
                state.lives = Math.max(0, state.lives - 1);
                if (state.lives <= 0) { hooks?.end?.(); return; }
                continue;
            }

            // 화면 밖 하단 제거
            if (d.y - d.r > cfg.height) continue;

            aliveDrops.push(d);
        }
        state.drops = aliveDrops;

        // 8) 아이템 이동/획득 처리
        const aliveItems = [];
        for (const it of state.items) {
            it.y += 160 * dt;

            const caught = GameHelpers.circleRectIntersect(
                it.x, it.y, it.r,
                state.player.x, groundY - cfg.playerH, cfg.playerW, cfg.playerH
            );
            if (caught) { activateItem(state, cfg, it.type, ts); continue; }

            if (it.y - it.r > cfg.height) continue;
            aliveItems.push(it);
        }
        state.items = aliveItems;

        // 9) 효과 만료
        if (state.boosted && ts > state.boostEndTime) state.boosted = false;
        if (state.slowed && ts > state.slowEndTime) state.slowed = false;
        if (state.speedBoosted && ts > state.speedBoostEndTime) state.speedBoosted = false;
    }

    // --- 내부 유틸 (state만 변경, DOM 없음) ---
    function spawnDrop(state, cfg) {
        const pad = cfg.dropSpawnPadding;
        const x = Math.random() * (cfg.width - 2 * pad) + pad;
        state.drops.push({ x, y: -cfg.dropRadius, r: cfg.dropRadius });
    }

    function spawnItem(state, cfg) {
        const pad = cfg.dropSpawnPadding;
        const x = Math.random() * (cfg.width - 2 * pad) + pad;
        const types = ['circle', 'square', 'triangle', 'diamond'];
        const type = types[Math.floor(Math.random() * types.length)];
        state.items.push({ x, y: -cfg.itemRadius, r: cfg.itemRadius, type });
    }

    function activateItem(state, cfg, type, ts) {
        if (type === 'circle') {
            state.boosted = true;
            state.boostEndTime = ts + cfg.powerDuration;
        } else if (type === 'square') {
            state.lives = Math.min(cfg.maxLives, state.lives + 1);
        } else if (type === 'triangle') {
            state.speedBoosted = true;
            state.speedBoostEndTime = ts + cfg.powerDuration;
        } else if (type === 'diamond') {
            state.slowed = true;
            state.slowEndTime = ts + cfg.powerDuration;
        }
    }

    window.GameUpdate = { step };
})();