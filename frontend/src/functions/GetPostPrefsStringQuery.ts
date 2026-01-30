function GetPostPrefsStringQuery() {
    const prefs_str = localStorage.getItem("post_preferences");
    const prefs_json: PostPreferences = JSON.parse(prefs_str) ?? {
        right_now: { show_reposts: true },
        exclude_posts_with_keywords: "",
        favour_posts_with_keywords: "",
    };

    return `exclude_keywords=${
        prefs_json.exclude_posts_with_keywords.trim() == "" ? "###D#SAD'SAD[][]1[]][3141341234123" : prefs_json.exclude_posts_with_keywords
    }&show_reposts=${prefs_json.right_now.show_reposts}`;
}

export default GetPostPrefsStringQuery;
