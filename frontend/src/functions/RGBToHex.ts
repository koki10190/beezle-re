function NumberToHex(num: number) {
    var hex = num.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function RGBToHex(r: number, g: number, b: number): string {
    return "#" + NumberToHex(r) + NumberToHex(g) + NumberToHex(b);
}

export { RGBToHex, NumberToHex };
