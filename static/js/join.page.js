// join.page.js
// 사용자 쿠키발급 및 등록

(function () {
    const form = document.getElementById('nickname-form');
    if (!form) return;

    const input = document.getElementById('nickname-input');
    const help  = document.getElementById('nickname-help');
    const submitBtn = document.getElementById('nickname-submit');

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
            location.href = '/main'; // 요구사항: join는 등록만, 게임시작은 main.html에서
        } catch (err) {
            help.textContent = `등록 실패: ${err.message || '알 수 없는 오류'}`;
        } finally {
            submitBtn.disabled = false;
        }
    });
})();