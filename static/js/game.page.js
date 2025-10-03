// game.page.js

(function () {
    const btnStart = document.getElementById('btn-start');
    const btnCheck = document.getElementById('btn-check');

    // 진입 시 계정 확인 (쿠키/세션 없으면 닉네임 등록으로)
    (async () => {
        try {
            const me = await API.me(); // { exists: boolean }
            if (!me?.exists) {
                alert('닉네임을 먼저 등록해주세요.');
                location.href = '/';
            }
        } catch (e) {
            console.error('[lobby] /me 실패:', e);
            alert('서버 연결에 문제가 있습니다.');
            location.href = '/';
        }
    })();

    //플레이 페이지로
    btnStart?.addEventListener('click', () => {
        location.href = '/play.html';
    });

    //점수 페이지로
    btnCheck?.addEventListener('click', () => {
        location.href = '/scores.html';
    });
})();