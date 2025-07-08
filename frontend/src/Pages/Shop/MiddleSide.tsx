import { useEffect, useState } from 'react';
import { checkToken } from '../../functions/checkToken';

import Divider from '../../Components/Divider';
import PostBox from '../../Components/PostBox';
import { fetchUserPrivate } from '../../functions/fetchUserPrivate';
import { UserPrivate, UserPublic } from '../../types/User';
import { Post } from '../../types/Post';
import FetchPost from '../../functions/FetchPost';
import FollowBox from '../../Components/FollowBox';
import { useParams } from 'react-router';
import { fetchUserPublic } from '../../functions/fetchUserPublic';
import './Shop.css';
import ShopBox from './ShopBox';
import axios from 'axios';
import { api_uri } from '../../links';
import { toast } from 'react-toastify';

enum BuyWhat {
    POST_BG_IMG,
    PROFILE_GRADIENT,
    NAME_COLOR,
    SQUARE_AVATAR,
}

async function Buy(buy_what: BuyWhat) {
    let res = null;
    switch (buy_what) {
        case BuyWhat.PROFILE_GRADIENT: {
            res = await axios.post(`${api_uri}/api/user/buy/profile_gradient`, {
                token: localStorage.getItem('access_token'),
            });
            break;
        }
        case BuyWhat.NAME_COLOR: {
            res = await axios.post(`${api_uri}/api/user/buy/name_color`, {
                token: localStorage.getItem('access_token'),
            });
            break;
        }
        case BuyWhat.SQUARE_AVATAR: {
            res = await axios.post(`${api_uri}/api/user/buy/square_avatar`, {
                token: localStorage.getItem('access_token'),
            });
            break;
        }
        case BuyWhat.POST_BG_IMG: {
            res = await axios.post(`${api_uri}/api/user/buy/profile_postbox_img`, {
                token: localStorage.getItem('access_token'),
            });
            break;
        }
    }

    if (res.data.bought) {
        toast.success('Successfully bought the item!');
    } else {
        toast.warn(res.data.error);
    }
}

function MiddleSide() {
    const [self_user, setSelfUser] = useState<UserPrivate>();

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);
        })();
    }, []);
    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-shop"></i> Shop
            </h1>
            <p style={{ marginTop: '-15px' }}>
                <i className="fa-solid fa-coins"></i> {self_user?.coins.toLocaleString('en-US')}
            </p>
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
                        title="Square Profile Frame"
                        price={5000}
                        call_on_purchase={() => Buy(BuyWhat.SQUARE_AVATAR)}
                        self_user={self_user}
                        _disabled={self_user?.customization?.square_avatar_bought}
                        level_required={true}
                        level_needed={5}
                    />
                </>
            ) : (
                ''
            )}
        </div>
    );
}

export default MiddleSide;
