function preventDefault(e) {
    e.preventDefault();
}

var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
function preventDefaultScroll(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
var supportsPassive = false;
try {
    window.addEventListener(
        "test",
        null,
        Object.defineProperty({}, "passive", {
            get: function () {
                supportsPassive = true;
            },
        }),
    );
} catch (e) {}
var wheelOpt = supportsPassive ? { passive: false } : false;

function DisableScroll() {
    window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
    window.addEventListener("keydown", preventDefaultScroll, false);
}

function EnableScroll() {
    window.removeEventListener("DOMMouseScroll", preventDefault, false);
    (window as any).removeEventListener(wheelEvent, preventDefault, wheelOpt);
    (window as any).removeEventListener("touchmove", preventDefault, wheelOpt);
    window.removeEventListener("keydown", preventDefaultScroll, false);
}

export { DisableScroll, EnableScroll, wheelEvent, wheelOpt, supportsPassive, keys, preventDefault, preventDefaultScroll };
