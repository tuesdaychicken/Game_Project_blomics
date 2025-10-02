//저장된 닉네임 콘솔에 한번 찍 해보자
(function () {
    // 방문자 식별 uid 쿠키
    const uid = ensureUid('uid');

    const $input = document.getElementById("nickname");
    const $form = document.getElementById("nick-form");
    const $status = document.getElementById("status");

    //쿠키 부분
    const $uidLine = document.getElementById("uid-line");

    // 현재 uid를 화면에 노출
    $uidLine.textContent = '당신의 uid: ' + uid;

    //기존ㅇㅔ 저장된 넥네임 가져오는거
    const saved = lsGet('nickname');
    if (saved) {
        $input.value = saved;
        $status.textContent = `현재 저장된 닉네임: ${saved}`;
    }
    
    //폼 전송
    $form.addEventListener("submit", function (e) {
        e.preventDefault();
        const nick = $input.value.trim();
        if (!nick) {
            $status.textContent = "입력되지 않았습니다 입력해주세요.";
            return;
        }
        lsSet("nickname", nick);
        $status.textContent = `저장 완료! 닉네임: ${nick}`;
    });

})();