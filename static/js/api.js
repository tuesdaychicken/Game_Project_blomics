// static/js/api.js
// fetch api 사용


const API = (() => {
    const BASE = '/api';
    const JSON_HEADERS = { 'Content-Type': 'application/json' };

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
        register: (nickname) =>
            fetch(`${BASE}/register`, {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify({ nickname }),
                credentials: 'same-origin',
            }).then(handle),

        me: () =>
            fetch(`${BASE}/me`, {
                credentials: 'same-origin',
            }).then(handle),

        saveScore: (score) =>
            fetch(`${BASE}/scores`, {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify({ score }),
                credentials: 'same-origin',
            }).then(handle),

        getScores: () =>
            fetch(`${BASE}/scores`, {
                credentials: 'same-origin',
            }).then(handle),
    };
})();