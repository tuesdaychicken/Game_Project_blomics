// static/js/pages.helper.js
// 해당 페이지 진입시 사용자인지 아닌지 확인

async function ensureSignedIn({redirectTo = '/',
                                  message = '유효하지 않은 접근입니다. 로비로 이동합니다.' } =
                              {}) {
    try {
        const me = await API.me(); // API만 사용
        if (!me?.exists) {
            alert(message);
            location.replace(redirectTo); // 뒤로가기 루프 방지
            throw new Error('NOT_SIGNED_IN');
        }
        return me; // 필요하면 닉네임 등 활용
    } catch (e) {
        alert('서버 연결에 문제가 있습니다.');
        location.replace(redirectTo);
        throw e;
    }
}