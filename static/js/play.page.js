// play.page.js

(function () {
    const btnFinish = document.getElementById('btn-finish');
    const btnCancel = document.getElementById('btn-cancel');

    // 페이지 진입 시에도 계정 확인
    (async () => {
        try {
            const me = await API.me();
            if (!me?.exists) {
                alert('세션이 만료되었거나 닉네임이 없습니다. 로비로 이동합니다.');
                location.href = '/';
            }
            // TODO: 여기에서 실제 게임 시작 로직을 불러오세요. 네
        } catch (e) {
            console.error('[play] /me 실패:', e);
            alert('서버 연결에 문제가 있습니다.');
            location.href = '/';
        }
    })();

    // 실제 게임에서 최종 점수를 확정하면 이 함수만 호출하면 됨
    async function onGameOver(score) {
        if (!Number.isFinite(score)) {
            console.warn('[play] 잘못된 score:', score);
            return;
        }
        try {
            await API.saveScore(score);          // POST /api/scores
            location.href = '/scores.html';      // 저장 성공 → 점수 페이지
        } catch (err) {
            console.error('[play] 점수 저장 실패:', err);
            if (err?.status === 401) {
                alert('세션이 만료되었습니다. 닉네임을 다시 등록해주세요.');
                location.href = '/';
            } else if (err?.status === 400) {
                alert('점수 형식이 올바르지 않습니다.');
            } else {
                alert('점수 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    }

    // 데모: 종료 버튼은 랜덤 점수 저장
    btnFinish?.addEventListener('click', () => {
        const score = Math.floor(Math.random() * 20);
        onGameOver(score);
    });

    // 취소 → 로비로
    btnCancel?.addEventListener('click', () => {
        location.href = '/game.html';
    });

    // 실제 게임 엔진에서 호출할 수 있도록 전역 공개
    window.gameOver = onGameOver;
})();