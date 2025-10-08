// loading.page.js
// 사용자 기존 유저인지 확인 페이지

(function () {
    // 쿠키 확인
    (async () => {
        try {
            const me = await API.me(); // { exists: boolean } 형태 응답
            if (me?.exists) {

                location.replace('/main');
            } else {
                location.replace('/join');
            }
        } catch (e) {
            // 쿠키 여부 관련 오류 발생시 join페이지로
            location.replace('/join');
        }
    })();
})();