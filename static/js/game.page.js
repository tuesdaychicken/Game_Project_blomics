// static/js/game.page.js
// 게임 종료 여부 확인 후 모달로 결과


(async function () {

    //사용자 검증
    await ensureSignedIn({});

    // 종료 모달 요소
    const endModal   = document.getElementById('end-modal');
    const endScoreEl = document.getElementById('end-score'); // 이번 점수
    const endHighEl  = document.getElementById('end-high');  // 최고 점수
    const btnEndOk   = document.getElementById('btn-end-ok');

    // 점수 저장
    async function saveScore(score) {
        if (!window.API || typeof API.saveScore !== 'function') {
            throw new Error('API.saveScore가 없습니다. api.js 로딩을 확인하세요.');
        }
        return API.saveScore(score);
    }

    // 모달 열기/닫기
    function openEndModal({ current, high }) {
        if (endScoreEl) endScoreEl.textContent = String(current);
        if (endHighEl)  endHighEl.textContent  = String(high);
        if (endModal)   endModal.style.display = 'flex';
    }
    function closeEndModal() {
        if (endModal) endModal.style.display = 'none';
    }

    // 게임 종료 시 호출 (엔진 → GameBridge → 여기)
    async function onGameOver(score) {
        if (!Number.isFinite(score)) {
            console.warn('[play] 잘못된 score:', score);
            return;
        }
        try {
            // 서버로 점수 저장
            const saved = await saveScore(score); // { highScore, lastScore }

            const high = Number.isFinite(saved?.highScore) ? saved.highScore : score;
            const last = Number.isFinite(saved?.lastScore)  ? saved.lastScore  : score;

            // 모달로 결과 노출 (이번 점수 = last, 최고 점수 = high)
            openEndModal({ current: last, high });
        } catch (err) {
            console.error('[play] 점수 저장 실패:', err);
            const status = err?.status ?? 0;
            if (status === 401) {
                alert('세션이 만료되었습니다. 닉네임을 다시 등록해주세요.');
                location.href = '/';
            } else if (status === 400) {
                alert('점수 형식이 올바르지 않습니다.');
            } else {
                alert('점수 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    }

    // 브리지에 게임오버 핸들러 등록
    if (window.GameBridge?.setGameOverHandler) {
        window.GameBridge.setGameOverHandler(onGameOver);
    }

    // 모달 확인, 로비로 이동
    btnEndOk?.addEventListener('click', () => {
        closeEndModal();
        location.href = '/main';
    });
})();