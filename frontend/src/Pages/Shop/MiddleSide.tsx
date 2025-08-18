import { useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import FollowBox from "../../Components/FollowBox";
import { useParams } from "react-router";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import "./Shop.css";
import ShopBox from "./ShopBox";
import axios from "axios";
import { api_uri } from "../../links";
import { toast } from "react-toastify";
import shop_music from "./sans.mp3";
import { AVATAR_SHAPES, AvaterShape } from "../../types/cosmetics/AvatarShapes";
import GetAuthToken from "../../functions/GetAuthHeader";

enum BuyWhat {
    POST_BG_IMG,
    PROFILE_GRADIENT,
    NAME_COLOR,
    AVATAR_SHAPE,
    PROFILE_BACKGROUND_IMAGE,
    DISPLAY_NAME_FONT,
}

async function Buy(buy_what: BuyWhat, arg: number = 0, setSelfUser: React.Dispatch<React.SetStateAction<UserPrivate>> = () => {}) {
    let res = null;
    switch (buy_what) {
        case BuyWhat.PROFILE_GRADIENT: {
            res = await axios.post(
                `${api_uri}/api/user/buy/profile_gradient`,
                {},
                {
                    headers: GetAuthToken(),
                },
            );
            break;
        }
        case BuyWhat.NAME_COLOR: {
            res = await axios.post(
                `${api_uri}/api/user/buy/name_color`,
                {},
                {
                    headers: GetAuthToken(),
                },
            );
            break;
        }
        case BuyWhat.AVATAR_SHAPE: {
            res = await axios.post(
                `${api_uri}/api/user/buy/avatar`,
                {
                    shape: arg,
                },
                {
                    headers: GetAuthToken(),
                },
            );
            setSelfUser((user) => {
                const _new = { ...user };
                try {
                    _new.customization.owned_shapes.push(arg);
                } catch (e) {
                    if (!(_new as any).customization) {
                        (_new as any).customization = {
                            owned_shapes: [arg],
                        };
                    }

                    if (!(_new as any).customization?.owned_shapes) {
                        (_new as any).customization.owned_shapes = [arg];
                    }
                }
                return _new;
            });
            break;
        }
        case BuyWhat.PROFILE_BACKGROUND_IMAGE: {
            res = await axios.post(
                `${api_uri}/api/user/buy/profile_background_image`,
                {},
                {
                    headers: GetAuthToken(),
                },
            );
            break;
        }
        case BuyWhat.DISPLAY_NAME_FONT: {
            res = await axios.post(
                `${api_uri}/api/user/buy/display_name_font`,
                {},
                {
                    headers: GetAuthToken(),
                },
            );
            break;
        }
    }

    if (res.data.bought) {
        toast.success("Successfully bought the item!");
        return true;
    } else {
        toast.warn(res.data.error);
        return false;
    }
}

function MiddleSide() {
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [muted, setMuted] = useState<boolean>(false);
    const [music, setMusic] = useState<HTMLAudioElement>();

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);
        })();

        const music = new Audio(shop_music);
        music.loop = true;
        // music.play();
        setMusic(music);
    }, []);

    useEffect(() => {
        if (!music) return;
        music.muted = muted;
    }, [muted]);
    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-shop"></i> The Customization Shop
            </h1>
            <p style={{ marginTop: "-15px" }}>
                <i className="fa-solid fa-coins"></i> {self_user?.coins.toLocaleString("en-US")}
            </p>
            {/* <a onClick={() => setMuted(!muted)} className="mute-music">
                {muted ? "Unmute Music" : "Mute Music"}
            </a> */}
            <Divider />
            {self_user ? (
                <>
                    {/* <ShopBox
                        title="Post Background Image"
                        price={5000}
                        call_on_purchase={() => Buy(BuyWhat.POST_BG_IMG)}
                        self_user={self_user}
                        _disabled={self_user?.customization?.profile_postbox_img_bought}
                        level_required={true}
                        level_needed={20}
                    /> */}
                    <ShopBox
                        title="Profile Gradient"
                        price={15000}
                        call_on_purchase={() => Buy(BuyWhat.PROFILE_GRADIENT)}
                        self_user={self_user}
                        _disabled={self_user?.customization?.profile_gradient_bought}
                        level_required={true}
                        level_needed={15}
                    />
                    <ShopBox
                        title="Name Color Gradient"
                        price={7500}
                        call_on_purchase={() => Buy(BuyWhat.NAME_COLOR)}
                        self_user={self_user}
                        _disabled={self_user?.customization?.name_color_bought}
                        level_required={true}
                        level_needed={10}
                    />
                    <ShopBox
                        title="Profile Background Image"
                        price={25000}
                        call_on_purchase={() => Buy(BuyWhat.PROFILE_BACKGROUND_IMAGE)}
                        self_user={self_user}
                        _disabled={self_user?.customization?.profile_image?.bought}
                        level_required={true}
                        level_needed={20}
                    />
                    <ShopBox
                        title="Display Name Font"
                        price={50000}
                        call_on_purchase={() => Buy(BuyWhat.DISPLAY_NAME_FONT)}
                        self_user={self_user}
                        _disabled={self_user?.customization?.display_name?.font?.bought}
                        level_required={true}
                        level_needed={50}
                    />

                    {AVATAR_SHAPES.map((shape, index) => {
                        if (index === AvaterShape.CircleAvatarShape) return <></>;
                        return (
                            <ShopBox
                                title={shape.name}
                                price={shape.price}
                                call_on_purchase={() => Buy(BuyWhat.AVATAR_SHAPE, index, setSelfUser)}
                                self_user={self_user}
                                _disabled={self_user?.customization?.owned_shapes?.find((x) => x === index) ? true : false}
                                level_required={true}
                                level_needed={shape.level_required}
                            >
                                <div
                                    className="shop_avatar"
                                    style={{
                                        backgroundImage: `url(${self_user?.avatar})`,
                                        clipPath: shape.style,
                                    }}
                                ></div>
                            </ShopBox>
                        );
                    })}
                </>
            ) : (
                ""
            )}
        </div>
    );
}

export default MiddleSide;
