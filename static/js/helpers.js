// 최초 저장
function lsSet(key, val) {
    try { localStorage.setItem(String(key), String(val)); } catch (e) {}
}

// 쿠키 읽기, nickname.js
function lsGet(key) {
    try { return localStorage.getItem(String(key)); } catch (e) { return null; }
}