declare namespace lastfm {
    interface NowPlaying {
        artist: {
            image: {
                small: string;
                medium: string;
                large: string;
                extralarge: string;
            };
            name: string;
            url: string;
        };
        name: string;
        image: {
            small: string;
            medium: string;
            large: string;
            extralarge: string;
        };
        album: string;
        url: string;
    }

    interface UserImage {
        size: string;
        "#text": string;
    }

    interface User {
        name: string;
        age: string;
        subscriber: string;
        realname: string;
        bootstrap: string;
        playcount: string;
        artist_count: string;
        playlists: string;
        track_count: string;
        album_count: string;
        image: Array<UserImage>;
        registered: {
            unixtime: string;
            "#text": string;
        };
        country: string;
        gender: string;
        url: string;
        type: string;
    }
}
