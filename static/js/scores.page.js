// scores.page.js
// 점수 조회

(async function init() {
    const statusEl  = document.getElementById('status');
    const cardEl    = document.getElementById('score-card');
    const nickEl    = document.getElementById('nickname');
    const highEl    = document.getElementById('high');
    const lastEl    = document.getElementById('last');
    const actionsEl = document.getElementById('actions');

    // 공통 fetch + 응답 검사
    async function callMe(url) {
        const res = await fetch(url, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} from ${url}: ${text.slice(0,120)}`);
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            const text = await res.text().catch(() => '');
            throw new Error(`NON_JSON from ${url}: ${text.slice(0,120)}`);
        }
        return res.json();
    }

    async function getMe() {
        // api.js가 로드되어 있으면 그걸 우선 사용
        if (window.API && typeof API.me === 'function') {
            return API.me();
        }
        // fallback: 직접 호출
        return callMe('/users');
    }

    try {
        // 내 정보 가져오기
        const me = await getMe();

        // 미등록(쿠키 없음/무효) 처리
        if (!me || me.exists === false) {
            statusEl.textContent = '닉네임이 등록되어 있지 않습니다.';
            actionsEl.innerHTML = `
        <p class="warn">점수를 확인하려면 닉네임 등록이 필요합니다.</p>
        <a class="btn" href="/main">닉네임 등록/게임 시작하기</a>
      `;
            return;
        }

        // 정상 렌더
        statusEl.textContent = '불러오기 완료';
        cardEl.classList.remove('hidden');
        nickEl.textContent = `반가워요, ${me.nickname} 님`;
        highEl.textContent = Number.isFinite(me.highScore) ? me.highScore : 0;
        lastEl.textContent = Number.isFinite(me.lastScore) ? me.lastScore : 0;

        actionsEl.innerHTML = `<a class="btn" href="/main">게임 하러 가기</a>`;
    } catch (err) {
        console.error('[scores] /me 호출 실패:', err);
        statusEl.textContent = '점수 정보를 불러오지 못했습니다. (개발자 콘솔 확인)';
        actionsEl.innerHTML = `<a class="btn" href="/main">다시 시도</a>`;
    }
})();
