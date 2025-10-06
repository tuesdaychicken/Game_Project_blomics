// static/js/game.engine.js

(function () {
    const Engine = {

        cfg: window.GameSettings,

        el: {canvas: null, ctx: null, hudScore: null, hudLives: null},

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
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.end();
            });

            // HUD 초기 표시
            window.GameView.updateHUD(this.el, this.state);

            // 실행 시작 + 루프 가동
            this.state.running = true;
            this.stopLoop = window.GameLoop.start({
                update: this.update.bind(this),
                render: this.render.bind(this),
                isRunning: () => this.state.running,
                maxDt: 0.033,
            });
        },

        update(dt, ts) {
            // 규칙 처리 위임 (state만 바꿈, DOM/브리지 접근 없음)
            window.GameUpdate.step(this.state, this.cfg, dt, ts, {
                end: this.end.bind(this),
            });
        },

        render() {
            // 화면 그리기 전담
            window.GameView.draw(this.el.ctx, this.state, this.cfg);
            // HUD 반영
            window.GameView.updateHUD(this.el, this.state);
        },

        end() {
            if (!this.state.running) return;
            this.state.running = false;

            // 루프 정지
            try {
                this.stopLoop && this.stopLoop();
            } catch {
            }
            // 입력 이벤트 정리
            try {
                this.detachInput && this.detachInput();
            } catch {
            }

            // 바운더리: 게임오버를 브리지에 통지
            try {
                window.GameBridge && window.GameBridge.gameOver(this.state.score);
            } catch (e) {
                console.error('[Engine] GameBridge.gameOver failed:', e);
            }
        },
    };

    window.GameEngine = Engine;
    window.addEventListener('DOMContentLoaded', () => Engine.init());
})();