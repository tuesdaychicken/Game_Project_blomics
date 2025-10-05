// static/js/game.engine.js
// 1단계(완): 캔버스/루프/캐릭터 이동/HUD
// 2단계(추가): 낙하물(물방울) 스폰/이동/지면 착지 시 점수 +1
// 3단계: 물방울 충돌 시 목숨 감소 + 목숨 0 시 종료
// 4단계: 동그라미 아이템 추가 (물방울 생성 속도 증가 5초 지속)
// 5단계: 네모 아이템 추가 (목숨 +1)
// 6단계: 세모 아이템 추가 (캐릭터 이동속도 증가 5초 지속)
// 7단계: 마름모 아이템 추가 (물방울 속도/양 감소 5초 지속)
// 8단계: 난이도 스케일링(경과 시간에 따라 낙하 속도↑, 스폰 간격↓) + 4종 아이템 유지

(function () {
    const Engine = {

        // 설정/상태는 분리된 전역 모듈 참조
        cfg: window.GameSettings,

        el: { canvas: null, ctx: null, hudScore: null, hudLives: null },

        state: window.GameStateFactory.create(),
        detachInput: null, // 입력 해제 함수 보관

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

            // ✅ 입력 모듈로 키 이벤트 등록(상태의 keys만 갱신)
            //    기존의 window.addEventListener('keydown'/'keyup')는 제거
            this.detachInput = window.GameInput && window.GameInput.attach
                ? window.GameInput.attach(this.state)
                : null;

            // ESC 즉시 종료(선택): keys와는 별개로 종료 핫키만 연결
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.end();
            });

            this.updateHUD();
            this.state.running = true;
            requestAnimationFrame(this.loop.bind(this));
        },

        loop(ts) {
            if (!this.state.running) return;
            if (!this.state.lastTs) this.state.lastTs = ts;
            const dt = Math.min((ts - this.state.lastTs) / 1000, 0.033);
            this.state.lastTs = ts;
            this.state.elapsedMs += dt * 1000;

            this.update(dt, ts);
            this.render();
            requestAnimationFrame(this.loop.bind(this));
        },

        update(dt, ts) {
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

            // --- 아이템 스폰 ---
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
                if (this.checkCollision(d)) { this.damageLife(1); continue; }
                if (d.y - d.r > this.cfg.height) continue;
                aliveDrops.push(d);
            }
            this.state.drops = aliveDrops;

            // --- 아이템 이동/충돌 ---
            const aliveItems = [];
            for (const it of this.state.items) {
                it.y += 160 * dt; // 아이템은 비교적 천천히
                if (this.checkCollision(it)) { this.activateItem(it.type, ts); continue; }
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
            const ctx = this.el.ctx;
            const w = this.cfg.width, h = this.cfg.height;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0b1020';
            ctx.fillRect(0, 0, w, h);

            const groundY = h - this.cfg.groundH;
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, groundY, w, this.cfg.groundH);

            // 물방울
            ctx.fillStyle = '#38bdf8';
            for (const d of this.state.drops) {
                ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
            }

            // 아이템들
            for (const it of this.state.items) {
                if (it.type === 'circle') ctx.fillStyle = '#facc15';     // ○ 노랑
                else if (it.type === 'square') ctx.fillStyle = '#3b82f6';// □ 파랑
                else if (it.type === 'triangle') ctx.fillStyle = '#22c55e'; // △ 초록
                else if (it.type === 'diamond') ctx.fillStyle = '#a855f7';  // ◇ 보라

                if (it.type === 'square') {
                    ctx.fillRect(it.x - it.r, it.y - it.r, it.r * 2, it.r * 2);
                } else if (it.type === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(it.x, it.y - it.r);
                    ctx.lineTo(it.x - it.r, it.y + it.r);
                    ctx.lineTo(it.x + it.r, it.y + it.r);
                    ctx.closePath();
                    ctx.fill();
                } else if (it.type === 'diamond') {
                    ctx.beginPath();
                    ctx.moveTo(it.x, it.y - it.r);
                    ctx.lineTo(it.x + it.r, it.y);
                    ctx.lineTo(it.x, it.y + it.r);
                    ctx.lineTo(it.x - it.r, it.y);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.beginPath(); ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2); ctx.fill();
                }
            }

            // 캐릭터(효과별 색상)
            let color = '#60a5fa';
            if (this.state.boosted) color = '#fbbf24';       // ○
            if (this.state.speedBoosted) color = '#4ade80';  // △
            if (this.state.slowed) color = '#a855f7';        // ◇
            ctx.fillStyle = color;
            ctx.fillRect(this.state.player.x, this.state.player.y, this.cfg.playerW, this.cfg.playerH);

            this.updateHUD();
        },

        // --- 스폰/아이템/효과 ---
        spawnDrop() {
            const pad = this.cfg.dropSpawnPadding;
            const x = Math.random() * (this.cfg.width - 2 * pad) + pad;
            this.state.drops.push({ x, y: -this.cfg.dropRadius, r: this.cfg.dropRadius });
        },

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
                this.updateHUD();
            } else if (type === 'triangle') {
                this.state.speedBoosted = true;
                this.state.speedBoostEndTime = ts + this.cfg.powerDuration;
            } else if (type === 'diamond') {
                this.state.slowed = true;
                this.state.slowEndTime = ts + this.cfg.powerDuration;
            }
        },

        // --- 유틸 ---
        addScore(n = 1) { this.state.score += n; this.updateHUD(); },

        updateHUD() {
            this.el.hudScore.textContent = String(this.state.score);
            this.el.hudLives.textContent = String(this.state.lives);
        },

        checkCollision(obj) {
            const p = this.state.player, r = obj.r;
            const px = p.x + this.cfg.playerW / 2;
            const py = p.y + this.cfg.playerH / 2;
            const dx = Math.abs(obj.x - px);
            const dy = Math.abs(obj.y - py);
            return dx < this.cfg.playerW / 2 + r && dy < this.cfg.playerH / 2 + r;
        },

        damageLife(n = 1) {
            this.state.lives = Math.max(0, this.state.lives - n);
            this.updateHUD();
            if (this.state.lives <= 0) this.end();
        },

        end() {
            if (!this.state.running) return;
            this.state.running = false;

            // 입력 이벤트 정리
            try { this.detachInput && this.detachInput(); } catch {}

            try { window.gameOver && window.gameOver(this.state.score); }
            catch (e) { console.error('[Engine] gameOver 호출 실패:', e); }
        },
    };

    window.GameEngine = Engine;
    window.addEventListener('DOMContentLoaded', () => Engine.init());
})();