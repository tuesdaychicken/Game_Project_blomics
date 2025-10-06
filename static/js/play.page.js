// play.page.js
(function () {
    const btnFinish = document.getElementById('btn-finish');
    const btnCancel = document.getElementById('btn-cancel');

    // 종료 모달 요소
    const endModal   = document.getElementById('end-modal');
    const endScoreEl = document.getElementById('end-score'); // 이번 점수
    const endHighEl  = document.getElementById('end-high');  // 최고 점수
    const btnEndOk   = document.getElementById('btn-end-ok');

    // 진입 시 계정 확인
    (async () => {
        try {
            const me = await API.me();
            if (!me?.exists) {
                alert('세션이 만료되었거나 닉네임이 없습니다. 로비로 이동합니다.');
                location.href = '/';
            }
            // 실제게임 로직 여기
        } catch (e) {
            console.error('[play] /me 실패:', e);
            alert('서버 연결에 문제가 있습니다.');
            location.href = '/';
        }
    })();

    // /api/scores 저장 호출 (API.saveScore 있으면 사용, 없으면 fetch fallback)
    async function saveScore(score) {
        if (window.API && typeof API.saveScore === 'function') {
            return await API.saveScore(score); // 기대 응답: { highScore, lastScore }
        }
        // 직접 호출
        const res = await fetch('/api/board/scores', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ score })
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            const err = new Error(`HTTP ${res.status}: ${text.slice(0,120)}`);
            err.status = res.status;
            throw err;
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            const text = await res.text().catch(() => '');
            throw new Error(`NON_JSON 응답: ${text.slice(0,120)}`);
        }
        return res.json(); // { highScore, lastScore }
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

            // 응답 기준으로 표시값 결정 (없으면 안전한 대체값)
            const high = Number.isFinite(saved?.highScore) ? saved.highScore : score;
            const last = Number.isFinite(saved?.lastScore)  ? saved.lastScore  : score;

            // 모달로 결과 노출 (이번 점수 = last, 최고 점수 = high)
            openEndModal({ current: last, high });
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

    // 브리지에 게임오버 핸들러 등록
    if (window.GameBridge?.setGameOverHandler) {
        window.GameBridge.setGameOverHandler(onGameOver);
    }

    // 랜덤 점수 저장/표시 (테스트 버튼)
    btnFinish?.addEventListener('click', () => {
        const randomScore = Math.floor(Math.random() * 100); // 0~99 임의 점수
        onGameOver(randomScore);
    });

    // 취소
    btnCancel?.addEventListener('click', () => {
        location.href = '/game';
    });

    // 모달 확인, 로비로 이동
    btnEndOk?.addEventListener('click', () => {
        closeEndModal();
        location.href = '/game';
    });

})();