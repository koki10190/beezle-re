function GetPostPrefs() {
    const prefs_str = localStorage.getItem("post_preferences");
    const prefs_json: PostPreferences = JSON.parse(prefs_str) ?? {
        right_now: { show_reposts: true },
        exclude_posts_with_keywords: "",
        favour_posts_with_keywords: "",
    };

    return prefs_json;
}

export default GetPostPrefs;
