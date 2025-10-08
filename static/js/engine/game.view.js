// static/js/engine/game.view.js
// 게임 화면 구현

(function () {

    //게임 화면 구현 함수
    function draw(ctx, state, cfg) {
        const w = cfg.width, h = cfg.height;

        // 배경
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(0, 0, w, h);

        // 지면
        const groundY = h - cfg.groundH;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, groundY, w, cfg.groundH);

        // 물방울
        ctx.fillStyle = '#38bdf8';
        for (const d of state.drops) {
            ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        }

        // 아이템 이름이 들어오면 색 모양 만들어주는 반복문(생성아님)
        for (const it of state.items) {
            if (it.type === 'circle') ctx.fillStyle = '#facc15';        // 동그라미, 노랑
            else if (it.type === 'square') ctx.fillStyle = '#3b82f6';   // 네모, 파랑
            else if (it.type === 'triangle') ctx.fillStyle = '#22c55e'; // 세모, 초록
            else if (it.type === 'diamond') ctx.fillStyle = '#a855f7';  // 마름모, 보라

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

        // 플레이어 컬러(아이템 효과별 색상)
        let color = '#60a5fa';
        if (state.boosted) color = '#fbbf24';       // 동그라미
        if (state.speedBoosted) color = '#4ade80';  // 세모
        if (state.slowed) color = '#a855f7';        // 마름모
        ctx.fillStyle = color;
        ctx.fillRect(state.player.x, state.player.y, cfg.playerW, cfg.playerH);
    }

    // 상단 점수, 목숨
    function updateHUD(el, state) {
        el.hudScore.textContent = String(state.score);
        el.hudLives.textContent = String(state.lives);
    }

    window.GameView = { draw, updateHUD };
})();