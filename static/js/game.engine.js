// static/js/game.engine.js
// 1단계(완): 캔버스/루프/캐릭터 이동/HUD
// 2단계(추가): 낙하물(물방울) 스폰/이동/지면 착지 시 점수 +1
// 3단계: 물방울 충돌 시 목숨 감소 + 목숨 0 시 종료
// 4단계: 동그라미 아이템 추가 (물방울 생성 속도 증가 5초 지속)
// 5단계: 네모 아이템 추가 (목숨 +1)
// 6단계: 세모 아이템 추가 (캐릭터 이동속도 증가 5초 지속)

(function () {
    const Engine = {
        cfg: {
            width: 480,
            height: 720,
            groundH: 24,
            playerW: 40,
            playerH: 40,
            moveSpeed: 280,

            // 낙하물 설정
            dropRadius: 6,
            dropSpeed: 220,
            dropSpawnInterval: 600,
            dropSpawnPadding: 8,

            // 아이템 설정
            itemRadius: 8,
            itemSpawnInterval: 3000,
            itemChance: 0.5,
            powerDuration: 5000,
            boostedSpawnInterval: 300,
            maxLives: 5,
        },

        el: { canvas: null, ctx: null, hudScore: null, hudLives: null },

        state: {
            running: false,
            lastTs: 0,
            score: 0,
            lives: 1,
            keys: Object.create(null),
            player: { x: 0, y: 0 },
            drops: [],
            items: [],

            spawnAccMs: 0,
            itemAccMs: 0,

            boosted: false,
            boostEndTime: 0,

            speedBoosted: false,
            speedBoostEndTime: 0,
        },

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

            window.addEventListener('keydown', (e) => {
                this.state.keys[e.key] = true;
                if (e.key === 'Escape') this.end();
            });
            window.addEventListener('keyup', (e) => (this.state.keys[e.key] = false));

            this.updateHUD();
            this.state.running = true;
            requestAnimationFrame(this.loop.bind(this));
        },

        loop(ts) {
            if (!this.state.running) return;
            if (!this.state.lastTs) this.state.lastTs = ts;
            const dt = Math.min((ts - this.state.lastTs) / 1000, 0.033);
            this.state.lastTs = ts;

            this.update(dt, ts);
            this.render();
            requestAnimationFrame(this.loop.bind(this));
        },

        update(dt, ts) {
            // --- 캐릭터 이동 ---
            let moveSpeed = this.cfg.moveSpeed;
            if (this.state.speedBoosted) moveSpeed *= 1.5;

            let vx = 0;
            if (this.state.keys['ArrowLeft'] || this.state.keys['a']) vx -= 1;
            if (this.state.keys['ArrowRight'] || this.state.keys['d']) vx += 1;
            this.state.player.x += vx * moveSpeed * dt;
            this.state.player.x = Math.max(0, Math.min(this.state.player.x, this.cfg.width - this.cfg.playerW));

            const groundY = this.cfg.height - this.cfg.groundH;

            // --- 물방울 스폰 ---
            this.state.spawnAccMs += dt * 1000;
            const spawnInterval = this.state.boosted ? this.cfg.boostedSpawnInterval : this.cfg.dropSpawnInterval;
            while (this.state.spawnAccMs >= spawnInterval) {
                this.spawnDrop();
                this.state.spawnAccMs -= spawnInterval;
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
                d.y += this.cfg.dropSpeed * dt;
                if (d.y + d.r >= groundY) {
                    this.addScore(1);
                    continue;
                }
                if (this.checkCollision(d)) {
                    this.damageLife(1);
                    continue;
                }
                if (d.y - d.r > this.cfg.height) continue;
                aliveDrops.push(d);
            }
            this.state.drops = aliveDrops;

            // --- 아이템 이동/충돌 ---
            const aliveItems = [];
            for (const it of this.state.items) {
                it.y += 160 * dt;
                if (this.checkCollision(it)) {
                    this.activateItem(it.type, ts);
                    continue;
                }
                if (it.y - it.r > this.cfg.height) continue;
                aliveItems.push(it);
            }
            this.state.items = aliveItems;

            // --- 효과 지속시간 종료 ---
            if (this.state.boosted && ts > this.state.boostEndTime) {
                this.state.boosted = false;
            }
            if (this.state.speedBoosted && ts > this.state.speedBoostEndTime) {
                this.state.speedBoosted = false;
            }
        },

        render() {
            const ctx = this.el.ctx;
            const w = this.cfg.width;
            const h = this.cfg.height;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0b1020';
            ctx.fillRect(0, 0, w, h);

            const groundY = h - this.cfg.groundH;
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, groundY, w, this.cfg.groundH);

            // 물방울
            ctx.fillStyle = '#38bdf8';
            for (const d of this.state.drops) {
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }

            // 아이템들
            for (const it of this.state.items) {
                if (it.type === 'circle') ctx.fillStyle = '#facc15'; // 노랑
                else if (it.type === 'square') ctx.fillStyle = '#3b82f6'; // 파랑
                else if (it.type === 'triangle') ctx.fillStyle = '#22c55e'; // 초록

                if (it.type === 'square') {
                    ctx.fillRect(it.x - it.r, it.y - it.r, it.r * 2, it.r * 2);
                } else if (it.type === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(it.x, it.y - it.r);
                    ctx.lineTo(it.x - it.r, it.y + it.r);
                    ctx.lineTo(it.x + it.r, it.y + it.r);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 캐릭터
            let color = '#60a5fa';
            if (this.state.boosted) color = '#fbbf24'; // 노란 (circle 효과)
            if (this.state.speedBoosted) color = '#4ade80'; // 초록 (triangle 효과)
            ctx.fillStyle = color;
            ctx.fillRect(this.state.player.x, this.state.player.y, this.cfg.playerW, this.cfg.playerH);

            this.updateHUD();
        },

        // ---------- 생성 ----------
        spawnDrop() {
            const pad = this.cfg.dropSpawnPadding;
            const x = Math.random() * (this.cfg.width - 2 * pad) + pad;
            this.state.drops.push({ x, y: -this.cfg.dropRadius, r: this.cfg.dropRadius });
        },

        spawnItem() {
            const pad = this.cfg.dropSpawnPadding;
            const x = Math.random() * (this.cfg.width - 2 * pad) + pad;
            const types = ['circle', 'square', 'triangle'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.state.items.push({ x, y: -this.cfg.itemRadius, r: this.cfg.itemRadius, type });
        },

        // ---------- 아이템 효과 ----------
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
            }
        },

        // ---------- 기타 ----------
        addScore(n = 1) {
            this.state.score += n;
            this.updateHUD();
        },

        updateHUD() {
            this.el.hudScore.textContent = String(this.state.score);
            this.el.hudLives.textContent = String(this.state.lives);
        },

        checkCollision(obj) {
            const p = this.state.player;
            const r = obj.r;
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
            try {
                window.gameOver && window.gameOver(this.state.score);
            } catch (e) {
                console.error('[Engine] gameOver 호출 실패:', e);
            }
        },
    };

    window.GameEngine = Engine;
    window.addEventListener('DOMContentLoaded', () => Engine.init());
})();