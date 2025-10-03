// static/js/nickname.js

(function () {
    const form = document.getElementById('nickname-form');
    if (!form) return; // 페이지에 폼 없으면 무시

    const input = document.getElementById('nickname-input');
    const submitBtn = document.getElementById('nickname-submit');
    const help = document.getElementById('nickname-help');

    async function onSubmit(e) {
        e.preventDefault();
        const nickname = (input.value || '').trim();
        if (!nickname) {
            help.textContent = '닉네임을 입력해주세요.';
            return;
        }
        submitBtn.disabled = true;
        help.textContent = '등록 중...';

        try {
            const user = await API.register(nickname); // 쿠키(uid) 자동 발급됨
            help.textContent = `등록됨, ${user.nickname}!`;
            // 이미 있는 점수 판이 있으면 초기화 트리거
            window.dispatchEvent(new CustomEvent('user:registered', { detail: user }));
        } catch (err) {
            help.textContent = `등록 실패: ${err.message || '알 수 없는 오류'}`;
        } finally {
            submitBtn.disabled = false;
        }
    }

    form.addEventListener('submit', onSubmit);

    // 페이지 로드시 이미 쿠키가 있으면 상태 표시
    (async () => {
        try {
            const me = await API.me();
            if (me.exists) {
                help.textContent = `반가워요, ${me.nickname}!`;
                window.dispatchEvent(new CustomEvent('user:ready', { detail: me }));
            }
        } catch {
            // /me는 쿠키 없으면 {exists:false} 반환 설계. 에러는 무시
        }
    })();
})();