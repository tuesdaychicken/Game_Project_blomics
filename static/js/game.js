let score = parseInt(lsGet('score') || '0', 10);

// 닉네임 부분
(function () {
    // 닉네임/uid 가져오기
    const nickname = lsGet('nickname') || '(닉네임 없음)';
    const uid = ensureUid('uid');

    // 화면에 표시
    document.getElementById('player-line').textContent = '플레이어는?: ' + nickname;
    document.getElementById('uid-line').textContent = 'uid: ' + uid;
})();

//점수 부분
function renderScore() {
    document.getElementById('score-line').textContent = '현재 점수: ' + score;
}

//점수 로컬 영역에 저장이 이부분
function saveScore() {
    lsSet('score', String(score));
}

//점추
document.getElementById('btn-plus').addEventListener('click', function () {
    score += 1;
    saveScore();
    renderScore();
});

//초기화
document.getElementById('btn-reset').addEventListener('click', function () {
    score = 0;
    saveScore();
    renderScore();
});

// 처음 렌더
renderScore();