// join.page.js

(function () {
    const form = document.getElementById('nickname-form');
    if (!form) return;

    const input = document.getElementById('nickname-input');
    const help  = document.getElementById('nickname-help');
    const submitBtn = document.getElementById('nickname-submit');

    // 이미 쿠키가 있으면 바로 이동
    (async () => {
        try {
            const me = await API.me();
            if (me?.exists) {
                // 뒤로가기로 다시 join으로 못 돌아오게
                location.replace('/main');
                return;
            }
        } catch { /* 무시하고 폼 보여줌 */ }
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
            location.href = '/main.html'; // 요구사항: join는 등록만, 게임시작은 main.html에서
        } catch (err) {
            help.textContent = `등록 실패: ${err.message || '알 수 없는 오류'}`;
        } finally {
            submitBtn.disabled = false;
        }
    });
})();