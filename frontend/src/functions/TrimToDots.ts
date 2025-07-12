function TrimToDots(str: string, limit: number) {
    // for some reason regex wouldn't work on markdown so i had to do this garbage
    const chars = str.split("");
    return str.length > limit ? chars.slice(0, limit - 1).join("") + "..." : str;
}

export default TrimToDots;
