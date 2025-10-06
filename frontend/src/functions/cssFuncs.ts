function SetCSSProperty(prop: string, value: string) {
    document.documentElement.style.setProperty(prop, value);
}

function GetCSSProperty(prop: string) {
    return window.getComputedStyle(document.documentElement).getPropertyValue(prop);
}

function SetSavedCSSProperties() {
    const orange = localStorage.getItem("--orange");
    const postColor = localStorage.getItem("--post-color");
    const profileColor = localStorage.getItem("--profile-color");
    const bodyGradient1 = localStorage.getItem("--body-gradient1");
    const bodyGradient2 = localStorage.getItem("--body-gradient2");
    const bodyGradientDeg = localStorage.getItem("--body-gradient-deg");

    if (orange) SetCSSProperty("--orange", orange);
    if (postColor) SetCSSProperty("--post-color", postColor);
    if (profileColor) SetCSSProperty("--profile-color", profileColor);
    if (bodyGradient1) SetCSSProperty("--body-gradient1", bodyGradient1);
    if (bodyGradient2) SetCSSProperty("--body-gradient2", bodyGradient2);
    if (bodyGradientDeg) SetCSSProperty("--body-gradient-deg", bodyGradientDeg);
}

export { SetSavedCSSProperties, SetCSSProperty, GetCSSProperty };
