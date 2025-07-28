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

    interface InventoryAsset {
        appid: number;
        contextid: string;
        assetid: string;
        classid: string;
        instanceid: string;
        amount: string;
    }

    interface RGDecsriptions_Description {
        type: string;
        value: string;
        name: string;
    }

    interface RGDecsriptions_Action {
        type: string;
        name: string;
        link: string;
    }

    interface RGDecsriptions_Tag {
        internal_name: string;
        name: string;
        category: string;
        category_name: string;
        localized_tag_name: string;
        color?: string;
    }

    interface RGDecsription {
        appid: string;
        classid: string;
        instanceid: string;
        currency: number;
        icon_url: string;
        descriptions: Array<RGDecsriptions_Description>;
        tradable: number;
        actions: Array<RGDecsriptions_Action>;
        name: string;
        name_color: string;
        market_name: string;
        market_hash_name: string;
        market_actions: Array<RGDecsriptions_Action>;
        commodity: number;
        market_tradable_restriction: string;
        market_marketable_restriction: string;
        marketable: number;
        background_color: string;
        type: string;
        tags: Array<RGDecsriptions_Tag>;
    }

    interface InventoryJSON {
        assets: Array<InventoryAsset>;
        descriptions: Array<RGDecsription>;
        total_inventory_count: number;
        success: number;
        rwgrsn: number;
    }
}
