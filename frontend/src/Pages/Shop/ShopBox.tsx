import { Children, ReactNode, useEffect, useRef, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import FetchPost from "../../functions/FetchPost";
import FollowBox from "../../Components/FollowBox";
import { useParams } from "react-router";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import SetLevelColorByValue from "../../functions/SetLevelColorByValue";

function ShopBox({
    self_user,
    title,
    price,
    call_on_purchase,
    _disabled,
    display = true,
    level_required = false,
    level_needed = 0,
    children,
}: {
    self_user: UserPrivate;
    title: string;
    price: number;
    call_on_purchase: () => void;
    _disabled: boolean;
    display?: boolean;
    level_required?: boolean;
    level_needed?: number;
    children?: ReactNode;
}) {
    const levelBox = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (levelBox.current) {
            SetLevelColorByValue(level_needed, levelBox.current!);
        }
    }, [levelBox, level_needed]);

    return (
        <>
            {display ? (
                <div className="shop-box">
                    <p className="shop-box-header">
                        {children}
                        {title}
                    </p>
                    <p className="shop-box-price">
                        <i className="fa-solid fa-coins" /> Costs {price.toLocaleString("en-US")}
                    </p>
                    {level_required ? (
                        <p>
                            Level Required:{" "}
                            <span className="level-box" ref={levelBox}>
                                {level_needed}
                            </span>
                        </p>
                    ) : (
                        ""
                    )}
                    <button disabled={_disabled} onClick={call_on_purchase} className="button-field fixed-100">
                        {_disabled ? "Already Bought" : "Buy"}
                    </button>
                </div>
            ) : (
                ""
            )}
        </>
    );
}

export default ShopBox;
