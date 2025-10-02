// 최초 저장
function lsSet(key, val) {
    try { localStorage.setItem(String(key), String(val)); } catch (e) {}
}

// nickname.js
function lsGet(key) {
    try { return localStorage.getItem(String(key)); } catch (e) { return null; }
}

// 쿠키/uid
function setCookie(name, value, days) {
    const exp = new Date(Date.now() + (days ?? 365)*24*60*60*1000).toUTCString();
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; expires=' + exp + '; path=/; SameSite=Lax';
}
function getCookie(name) {
    const key = encodeURIComponent(name) + '=';
    return document.cookie.split('; ').reduce((acc, cur) => cur.indexOf(key) === 0 ? decodeURIComponent(cur.slice(key.length)) : acc, null);
}

// 쿠키에 uid가 있으면 가져오고 없으면 새로
function ensureUid(cookieName = 'uid') {
    let u = getCookie(cookieName);
    if (!u) {
        u = (crypto && crypto.randomUUID) ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36);
        setCookie(cookieName, u, 365);
    }
    return u;
}