// game.page.js (정리 버전)

(function () {
    // 섹션/버튼
    const secLobby  = document.getElementById('lobby');
    const secPlay   = document.getElementById('play');
    const btnStart  = document.getElementById('btn-start');
    const btnCheck  = document.getElementById('btn-check');
    const btnFinish = document.getElementById('btn-finish'); // 예시용: 실제 게임 종료 시점에 score 확정

    // 섹션 전환 도우미
    function show(section) {
        if (secLobby) secLobby.style.display = section === 'lobby' ? '' : 'none';
        if (secPlay)  secPlay.style.display  = section === 'play'  ? '' : 'none';
    }

    // 진입 시 유저 확인(쿠키/세션 없으면 닉네임 등록 페이지로)
    (async () => {
        try {
            const me = await API.me();       // { exists: boolean, nickname?, ... }
            if (!me?.exists) {
                alert('닉네임을 먼저 등록해주세요.');
                location.href = '/';
                return;
            }
        } catch (e) {
            console.error('[game] /me 호출 실패:', e);
            alert('서버 연결에 문제가 있습니다.');
            location.href = '/';
            return;
        }
    })();

    // 게임 시작 → 플레이 섹션으로 전환 (여기서 실제 게임 로직 시작)
    btnStart?.addEventListener('click', () => {
        show('play');
        // TODO: 여기에서 실제 게임 시작 로직 호출
    });

    // 점수 확인 → 별도 점수 페이지로 이동 (조회는 scores.html에서만)
    btnCheck?.addEventListener('click', () => {
        location.href = '/scores.html';
    });

    // 게임 종료 시 점수 저장 → 점수 페이지로 이동
    async function onGameOver(score) {
        if (!Number.isFinite(score)) {
            console.warn('[game] 잘못된 score 값:', score);
            return;
        }
        try {
            // 서버에 점수 저장 (응답은 따로 화면에 표시하지 않음)
            await API.saveScore(score);  // 내부적으로 POST /api/scores
            // 저장 성공 → 점수 페이지로 이동
            location.href = '/scores.html';
        } catch (err) {
            console.error('[game] 점수 저장 실패:', err);
            if (err?.status === 401) {
                alert('세션이 만료되었습니다. 닉네임을 다시 등록해주세요.');
                location.href = '/';
            } else if (err?.status === 400) {
                alert('점수 형식이 올바르지 않습니다.');
            } else {
                alert('점수 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            // 필요하면 로비로 되돌리는 로직을 유지할 수 있음
            show('lobby');
        }
    }

    // 예시: 데모 버튼으로 랜덤 점수 저장
    btnFinish?.addEventListener('click', () => {
        const score = Math.floor(Math.random() * 20);
        onGameOver(score);
    });

    // 실제 게임 로직에서 최종 점수로 호출할 수 있도록 전역 공개
    window.gameOver = onGameOver;

    // 기본은 로비
    show('lobby');
})();