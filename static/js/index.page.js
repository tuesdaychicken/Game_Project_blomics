// index.page.js

(function () {
    const form = document.getElementById('nickname-form');
    if (!form) return;

    const input = document.getElementById('nickname-input');
    const help  = document.getElementById('nickname-help');
    const submitBtn = document.getElementById('nickname-submit');

    // 이미 쿠키가 있으면 안내만 하고 사용자가 '게임으로 이동'을 누르게 두거나 자동 리다이렉트도 가능
    (async () => {
        try {
            const me = await API.me();
            if (me.exists) help.textContent = `이미 등록됨: ${me.nickname}`;
        } catch { /* 무시 */ }
    })();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = (input.value || '').trim();
        if (!nickname) {
            help.textContent = '닉네임을 입력해주세요.';
            return;
        }

        submitBtn.disabled = true;
        help.textContent = '등록 중...';

        try {
            await API.register(nickname); // uid 쿠키 발급
            help.textContent = '등록 완료! 게임 화면으로 이동합니다.';
            location.href = '/game.html'; // 요구사항: index는 등록만, 게임은 game.html에서
        } catch (err) {
            help.textContent = `등록 실패: ${err.message || '알 수 없는 오류'}`;
        } finally {
            submitBtn.disabled = false;
        }
    });
})();