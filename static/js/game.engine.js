// static/js/game.engine.js

(function () {
    const Engine = {

        cfg: window.GameSettings,

        el: { canvas: null, ctx: null, hudScore: null, hudLives: null },

        state: window.GameStateFactory.create(),
        detachInput: null,   // 입력 해제 함수
        stopLoop: null,      // 루프 정지 함수

        init() {
            this.el.canvas = document.getElementById('game-canvas');
            this.el.ctx = this.el.canvas?.getContext('2d');
            this.el.hudScore = document.getElementById('hud-score');
            this.el.hudLives = document.getElementById('hud-lives');
            if (!this.el.canvas || !this.el.ctx) return;

            this.el.canvas.width = this.cfg.width;
            this.el.canvas.height = this.cfg.height;

            const groundY = this.cfg.height - this.cfg.groundH;
            this.state.player.x = (this.cfg.width - this.cfg.playerW) / 2;
            this.state.player.y = groundY - this.cfg.playerH;

            // 입력(키 스냅샷)
            this.detachInput = window.GameInput && window.GameInput.attach
                ? window.GameInput.attach(this.state)
                : null;

            // ESC 종료
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.end(); });

            // HUD 초기 표시
            window.GameView.updateHUD(this.el, this.state);

            // 실행 시작 + 🔁 루프 가동
            this.state.running = true;
            this.stopLoop = window.GameLoop.start({
                update: this.update.bind(this),
                render: this.render.bind(this),
                isRunning: () => this.state.running,
                maxDt: 0.033,
            });
        },

        update(dt, ts) {
            // 누적 경과시간(ms)
            this.state.elapsedMs += dt * 1000;

            // --- 플레이어 이동(△ 효과 시 가속) ---
            let moveSpeed = this.cfg.moveSpeed;
            if (this.state.speedBoosted) moveSpeed *= 1.5;
            const dir =
                (this.state.keys['ArrowRight'] || this.state.keys['d'] ? 1 : 0) +
                (this.state.keys['ArrowLeft'] || this.state.keys['a'] ? -1 : 0);
            this.state.player.x += dir * moveSpeed * dt;
            this.state.player.x = Math.max(0, Math.min(this.state.player.x, this.cfg.width - this.cfg.playerW));

            const groundY = this.cfg.height - this.cfg.groundH;

            // --- 난이도 스케일 계산(경과 시간 기반) ---
            const t = this.state.elapsedMs / 1000; // s
            const baseSpeed = Math.min(
                this.cfg.baseDropSpeed + this.cfg.difficulty.speedGrowthPerSec * t,
                this.cfg.difficulty.maxDropSpeed
            );
            const baseInterval = Math.max(
                this.cfg.baseSpawnInterval - this.cfg.difficulty.intervalShrinkPerSec * t,
                this.cfg.difficulty.minSpawnInterval
            );

            // 아이템 효과 적용
            const effectiveDropSpeed = baseSpeed * (this.state.slowed ? this.cfg.effects.slowedSpeedFactor : 1);
            let effectiveSpawnInterval = baseInterval;
            if (this.state.boosted) effectiveSpawnInterval *= this.cfg.effects.boostedIntervalFactor; // ○
            if (this.state.slowed)  effectiveSpawnInterval *= this.cfg.effects.slowedIntervalFactor;  // ◇

            // --- 물방울 스폰 ---
            this.state.spawnAccMs += dt * 1000;
            while (this.state.spawnAccMs >= effectiveSpawnInterval) {
                this.spawnDrop();
                this.state.spawnAccMs -= effectiveSpawnInterval;
            }

            // --- 아이템 스폰 (확률) ---
            this.state.itemAccMs += dt * 1000;
            while (this.state.itemAccMs >= this.cfg.itemSpawnInterval) {
                this.state.itemAccMs -= this.cfg.itemSpawnInterval;
                if (Math.random() < this.cfg.itemChance) this.spawnItem();
            }

            // --- 물방울 이동/충돌 ---
            const aliveDrops = [];
            for (const d of this.state.drops) {
                d.y += effectiveDropSpeed * dt;
                if (d.y + d.r >= groundY) { this.addScore(1); continue; }

                // 🔁 충돌 판정: GameHelpers 사용
                const rx = this.state.player.x;
                const ry = groundY - this.cfg.playerH;
                const hitPlayer = window.GameHelpers.circleRectIntersect(
                    d.x, d.y, d.r, rx, ry, this.cfg.playerW, this.cfg.playerH
                );
                if (hitPlayer) { this.damageLife(1); continue; }

                if (d.y - d.r > this.cfg.height) continue;
                aliveDrops.push(d);
            }
            this.state.drops = aliveDrops;

            // --- 아이템 이동/충돌 ---
            const aliveItems = [];
            for (const it of this.state.items) {
                it.y += 160 * dt; // 아이템은 비교적 천천히

                // 🔁 충돌 판정: GameHelpers 사용
                const rx = this.state.player.x;
                const ry = groundY - this.cfg.playerH;
                const caught = window.GameHelpers.circleRectIntersect(
                    it.x, it.y, it.r, rx, ry, this.cfg.playerW, this.cfg.playerH
                );
                if (caught) { this.activateItem(it.type, ts); continue; }

                if (it.y - it.r > this.cfg.height) continue;
                aliveItems.push(it);
            }
            this.state.items = aliveItems;

            // --- 효과 만료 처리 ---
            if (this.state.boosted && ts > this.state.boostEndTime) this.state.boosted = false;
            if (this.state.slowed && ts > this.state.slowEndTime) this.state.slowed = false;
            if (this.state.speedBoosted && ts > this.state.speedBoostEndTime) this.state.speedBoosted = false;
        },

        render() {
            // 🎨 화면 그리기 전담
            window.GameView.draw(this.el.ctx, this.state, this.cfg);
            // HUD 반영
            window.GameView.updateHUD(this.el, this.state);
        },

        // --- 낙하물(물방울) ---
        spawnDrop() {
            const pad = this.cfg.dropSpawnPadding;
            const x = Math.random() * (this.cfg.width - 2 * pad) + pad;
            this.state.drops.push({ x, y: -this.cfg.dropRadius, r: this.cfg.dropRadius });
        },

        // --- 아이템(스폰/효과) ---
        spawnItem() {
            const pad = this.cfg.dropSpawnPadding;
            const x = Math.random() * (this.cfg.width - 2 * pad) + pad;
            const types = ['circle', 'square', 'triangle', 'diamond'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.state.items.push({ x, y: -this.cfg.itemRadius, r: this.cfg.itemRadius, type });
        },

        activateItem(type, ts) {
            if (type === 'circle') {
                this.state.boosted = true;
                this.state.boostEndTime = ts + this.cfg.powerDuration;
            } else if (type === 'square') {
                this.state.lives = Math.min(this.cfg.maxLives, this.state.lives + 1);
            } else if (type === 'triangle') {
                this.state.speedBoosted = true;
                this.state.speedBoostEndTime = ts + this.cfg.powerDuration;
            } else if (type === 'diamond') {
                this.state.slowed = true;
                this.state.slowEndTime = ts + this.cfg.powerDuration;
            }
            window.GameView.updateHUD(this.el, this.state);
        },

        // --- 유틸/HUD/경계 ---
        addScore(n = 1) { this.state.score += n; window.GameView.updateHUD(this.el, this.state); },

        damageLife(n = 1) {
            this.state.lives = Math.max(0, this.state.lives - n);
            window.GameView.updateHUD(this.el, this.state);
            if (this.state.lives <= 0) this.end();
        },

        end() {
            if (!this.state.running) return;
            this.state.running = false;

            // 🔁 루프 정지
            try { this.stopLoop && this.stopLoop(); } catch {}
            // 입력 이벤트 정리
            try { this.detachInput && this.detachInput(); } catch {}

            try { window.gameOver && window.gameOver(this.state.score); }
            catch (e) { console.error('[Engine] gameOver 호출 실패:', e); }
        },
    };

    window.GameEngine = Engine;
    window.addEventListener('DOMContentLoaded', () => Engine.init());
})();