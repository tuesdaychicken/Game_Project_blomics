// main.page.js
// 게임 메인 페이지

(async function () {
    const btnStart = document.getElementById('btn-start');
    const btnCheck = document.getElementById('btn-check');
    const nickEl   = document.getElementById('current-nickname');

    //사용자 검증
    await ensureSignedIn({});

    const me = await API.me();
    nickEl.textContent = me.nickname ?? '(닉네임 없음)';

    //게임 페이지로
    btnStart?.addEventListener('click', () => {
        location.href = '/game';
    });

    //점수 페이지로
    btnCheck?.addEventListener('click', () => {
        location.href = '/scores';
    });
})();