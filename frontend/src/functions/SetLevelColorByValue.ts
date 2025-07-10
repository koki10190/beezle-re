import { UserPrivate, UserPublic } from "../types/User";

function between(x: number, min: number, max: number) {
    return x >= min && x <= max;
}

function SetLevelColorByValue(level: number, box: HTMLSpanElement) {
    if (between(level, 0, 9)) {
        box.style.background = "linear-gradient(45deg, rgb(255, 255, 255), rgb(95, 95, 95)) border-box";
    }

    if (between(level, 10, 19)) {
        box.style.background = "linear-gradient(45deg, rgb(255, 174, 0), rgb(156, 107, 0)) border-box";
    }

    if (between(level, 20, 29)) {
        box.style.background = "linear-gradient(45deg, rgb(255, 0, 0), rgb(131, 0, 0)) border-box";
    }

    if (between(level, 30, 39)) {
        box.style.background = "linear-gradient(45deg, rgb(70, 119, 255), rgb(46, 90, 156)) border-box";
    }

    if (between(level, 40, 49)) {
        box.style.background = "linear-gradient(45deg, rgb(255, 0, 0), rgb(255, 195, 67)) border-box";
    }
    if (between(level, 50, 59)) {
        box.style.background = "linear-gradient(45deg, rgb(195, 0, 255), rgb(255, 67, 224)) border-box";
    }
    if (between(level, 60, 69)) {
        box.style.background = "linear-gradient(45deg, rgb(255, 106, 243), rgb(255, 106, 243)) border-box";
    }
    if (between(level, 70, 79)) {
        box.style.background = "linear-gradient(45deg, rgb(119, 0, 255), rgb(24, 0, 131)) border-box";
    }
    if (between(level, 80, 89)) {
        box.style.background = "linear-gradient(45deg, rgb(174, 102, 255), rgb(24, 0, 131)) border-box";
    }
    if (between(level, 90, 99)) {
        box.style.background = "linear-gradient(45deg, rgb(255, 0, 0), rgb(89, 0, 255)) border-box";
    }
    if (level >= 100) {
        box.style.background = "linear-gradient(45deg, rgb(60, 255, 0), rgb(12, 107, 0)) border-box";
        box.style.borderRadius = "5px";
    }
}

export default SetLevelColorByValue;
