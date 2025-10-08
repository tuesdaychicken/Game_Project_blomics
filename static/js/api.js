// static/js/api.js
// 서버와 연결되는 부분
// 추후 확장한다면 점수API 사용자API로 분리

const API = (() => {
    const BASE = '/api';
    const JSON_HEADERS = { 'Content-Type': 'application/json' };

    //fetch 응답 공통처리
    async function handle(res) {
        // 응답 JSON만
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data?.message || res.statusText);
            err.status = res.status;
            err.data = data;
            throw err;
        }
        return data;
    }

    return {
        //닉네임 등록 요청 -> 쿠키발급
        register: (nickname) =>
            fetch(`${BASE}/users`, {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify({ nickname }),
                credentials: 'same-origin',
            }).then(handle),

        //유저 존재 조회 및 각페이지별 확인 용
        me: () =>
            fetch(`${BASE}/users`, {
                credentials: 'same-origin',
            }).then(handle),

        //게임 점수 저장
        saveScore: (score) =>
            fetch(`${BASE}/scores`, {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify({ score }),
                credentials: 'same-origin',
            }).then(handle),

        // 게임 점수 호출
        getScores: () =>
            fetch(`${BASE}/scores`, {
                credentials: 'same-origin',
            }).then(handle),
    };
})();

window.API = API;