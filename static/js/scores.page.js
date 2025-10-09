// static/js/scores.page.js
// 점수 조회

(async function init() {
    const statusEl  = document.getElementById('status');
    const cardEl    = document.getElementById('score-card');
    const nickEl    = document.getElementById('nickname');
    const highEl    = document.getElementById('high');
    const lastEl    = document.getElementById('last');
    const actionsEl = document.getElementById('actions');

    try {
        // 사용자 검증
        const me = await ensureSignedIn({
            redirectTo: '/',
            message: '닉네임이 등록되어 있지 않습니다. 로비로 이동합니다.',
        });

        const scores = await API.getScores();

        if (statusEl) statusEl.textContent = '불러오기 완료';
        if (cardEl) cardEl.classList.remove('hidden');
        if (nickEl) nickEl.textContent = `반가워요, ${me.nickname} 님`;
        if (highEl) highEl.textContent = Number.isFinite(scores?.highScore) ? scores.highScore : 0;
        if (lastEl) lastEl.textContent = Number.isFinite(scores?.lastScore) ? scores.lastScore : 0;

        if (actionsEl) actionsEl.innerHTML = `<a class="btn" href="/main">게임 하러 가기</a>`;
    } catch (err) {
        // ensureSignedIn에서 NOT_SIGNED_IN이면 이미 redirect 됨
        console.error('점수 불러오기 실패 : ', err);
        if (statusEl) statusEl.textContent = '점수 정보를 불러오지 못했습니다. (개발자 콘솔 확인)';
        if (actionsEl) actionsEl.innerHTML = `<a class="btn" href="/main">다시 시도</a>`;
    }
})();
