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
}
