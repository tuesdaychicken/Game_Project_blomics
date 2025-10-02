//저장된 닉네임 콘솔에 한번 찍 해보자
(function () {
    const saved = lsGet('nickname');
    console.log('저장된 닉네임:', saved);
})();