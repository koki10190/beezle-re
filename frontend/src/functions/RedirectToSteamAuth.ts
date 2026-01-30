function PopupToSteamAuth(redirect: string) {
    const endPoint = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${redirect}?state=d5083c416b1df43325a742551826c414&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
    window.open(endPoint);
}

export default PopupToSteamAuth;
