declare namespace Steam {
    interface PlayerSummary {
        steamid: string;
        personaname: string;
        profileurl: string;
        avatar: string;
        avatarmedium: string;
        avatarfull: string;
        avatarhash?: string;
        personastate?: number;
        personastateflags?: number;
        communityvisibilitystate: number;
        profilestate?: number;
        lastlogoff?: number;
        commentpermission?: number;
        realname?: string;
        primaryclanid?: string;
        timecreated?: number;
        gameid?: string;
        gameserverip?: string;
        gameextrainfo?: string;
        cityid?: number;
        loccountrycode?: string;
        locstatecode?: string;
        loccityid?: number;
    }
}
