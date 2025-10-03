// static/js/game.js

// 게임 종료 시: window.dispatchEvent(new CustomEvent('game:over', { detail: { score } }));

(function () {
    const elNickname = document.getElementById('nickname-label');
    const elHigh = document.getElementById('high-score');
    const elLast = document.getElementById('last-score');

    function renderScores({ highScore, lastScore }) {
        if (elHigh) elHigh.textContent = String(highScore ?? '-');
        if (elLast) elLast.textContent = String(lastScore ?? '-');
    }

    function renderNickname(nickname) {
        if (elNickname) elNickname.textContent = nickname || '-';
    }

    async function initScoresIfLoggedIn() {
        try {
            const me = await API.me();
            if (!me.exists) return; // 닉네임 미등록
            renderNickname(me.nickname);
            // 점수 조회 시 401이면 닉네임 다시 등록 유도
            try {
                const scores = await API.getScores();
                renderScores(scores);
            } catch (err) {
                if (err.status === 401) {
                    console.info('쿠키 만료: 닉네임을 다시 등록하세요.');
                } else {
                    console.error('점수 조회 실패:', err);
                }
            }
        } catch (err) {
            console.error('/me 호출 실패:', err);
        }
    }

    // 게임 오버 이벤트를 받아 점수 저장
    async function onGameOver(e) {
        const score = Number(e.detail?.score ?? NaN);
        if (!Number.isFinite(score)) return;

        try {
            const saved = await API.saveScore(score); // { highScore, lastScore } 예상
            renderScores(saved);
        } catch (err) {
            if (err.status === 401) {
                alert('닉네임을 먼저 등록해주세요!');
            } else if (err.status === 400) {
                alert('점수 형식이 올바르지 않습니다.');
            } else {
                alert('점수 저장 중 오류가 발생했어요.');
                console.error('saveScore error:', err);
            }
        }
    }

    // 닉네임 등록/준비 이벤트와 연동
    window.addEventListener('user:registered', (e) => {
        renderNickname(e.detail?.nickname);
        renderScores({ highScore: e.detail?.highScore ?? 0, lastScore: e.detail?.lastScore ?? 0 });
    });
    window.addEventListener('user:ready', (e) => {
        renderNickname(e.detail?.nickname);
        renderScores({ highScore: e.detail?.highScore ?? 0, lastScore: e.detail?.lastScore ?? 0 });
    });

    window.addEventListener('game:over', onGameOver);

    // 초기 진입 시 상태 동기화
    initScoresIfLoggedIn();

    // 전역 유틸,개발 편의: 콘솔에서 saveScore(숫자) 호출 가능
    window.saveScore = async (score) => {
        await onGameOver({ detail: { score } });
    };
})();