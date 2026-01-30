import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate, GetUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import { FetchPost } from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import PopupToSteamAuth from "../../../functions/RedirectToSteamAuth";
import { CustomEmoji } from "emoji-picker-react/dist/config/customEmojiConfig";
import UploadToImgur from "../../../functions/UploadToImgur";
import { toast } from "react-toastify";
import GetAuthToken from "../../../functions/GetAuthHeader";
import { RGBToHex } from "../../../functions/RGBToHex";
import { GetCSSProperty, SetCSSProperty } from "../../../functions/cssFuncs";
import { HexToRGB } from "../../../functions/HexToRGB";

interface Props {
    user: UserPrivate;
}

interface DUE_Props extends Props {
    emoji: CustomEmoji;
}

function DisplayUploadedEmojis({ user, emoji }: DUE_Props) {
    return (
        <>
            <div
                style={{
                    width: "50px",
                    height: "50px",
                    marginBottom: "5px",
                    backgroundImage: `url(${emoji.imgUrl})`,
                }}
                title={emoji.id}
                className="emoji"
            />{" "}
        </>
    );
}

function DisplayCustomization({ user }: Props) {
    const [defaultColor, setDefaultColor] = useState(
        localStorage.getItem("--orange")
            ? RGBToHex(
                  parseInt(localStorage.getItem("--orange").split(",")[0]),
                  parseInt(localStorage.getItem("--orange").split(",")[1]),
                  parseInt(localStorage.getItem("--orange").split(",")[2]),
              )
            : RGBToHex(
                  parseInt(GetCSSProperty("--orange").split(",")[0]),
                  parseInt(GetCSSProperty("--orange").split(",")[1]),
                  parseInt(GetCSSProperty("--orange").split(",")[2]),
              ),
    );
    const [postColor, setPostColor] = useState(
        localStorage.getItem("--post-color")
            ? RGBToHex(
                  parseInt(localStorage.getItem("--post-color").split(",")[0]),
                  parseInt(localStorage.getItem("--post-color").split(",")[1]),
                  parseInt(localStorage.getItem("--post-color").split(",")[2]),
              )
            : RGBToHex(
                  parseInt(GetCSSProperty("--post-color").split(",")[0]),
                  parseInt(GetCSSProperty("--post-color").split(",")[1]),
                  parseInt(GetCSSProperty("--post-color").split(",")[2]),
              ),
    );
    const [profileColor, setProfileColor] = useState(
        localStorage.getItem("--profile-color")
            ? RGBToHex(
                  parseInt(localStorage.getItem("--profile-color").split(",")[0]),
                  parseInt(localStorage.getItem("--profile-color").split(",")[1]),
                  parseInt(localStorage.getItem("--profile-color").split(",")[2]),
              )
            : RGBToHex(
                  parseInt(GetCSSProperty("--profile-color").split(",")[0]),
                  parseInt(GetCSSProperty("--profile-color").split(",")[1]),
                  parseInt(GetCSSProperty("--profile-color").split(",")[2]),
              ),
    );

    const [bodyColor1, setBodyColor1] = useState(
        localStorage.getItem("--body-gradient1")
            ? RGBToHex(
                  parseInt(localStorage.getItem("--body-gradient1").split(",")[0]),
                  parseInt(localStorage.getItem("--body-gradient1").split(",")[1]),
                  parseInt(localStorage.getItem("--body-gradient1").split(",")[2]),
              )
            : RGBToHex(
                  parseInt(GetCSSProperty("--body-gradient1").split(",")[0]),
                  parseInt(GetCSSProperty("--body-gradient1").split(",")[1]),
                  parseInt(GetCSSProperty("--body-gradient1").split(",")[2]),
              ),
    );
    const [bodyColor2, setBodyColor2] = useState(
        localStorage.getItem("--body-gradient2")
            ? RGBToHex(
                  parseInt(localStorage.getItem("--body-gradient2").split(",")[0]),
                  parseInt(localStorage.getItem("--body-gradient2").split(",")[1]),
                  parseInt(localStorage.getItem("--body-gradient2").split(",")[2]),
              )
            : RGBToHex(
                  parseInt(GetCSSProperty("--body-gradient2").split(",")[0]),
                  parseInt(GetCSSProperty("--body-gradient2").split(",")[1]),
                  parseInt(GetCSSProperty("--body-gradient2").split(",")[2]),
              ),
    );
    const [bodyDeg, setBodyDeg] = useState(
        parseInt(localStorage.getItem("--body-gradient-deg")?.replace("deg", "")) ||
            parseInt(GetCSSProperty("--body-gradient-deg").replace("deg", "")),
    );

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-icons"></i> Display Customization
                </h1>
                <Divider />
                <label>
                    Overall Color (Default: <span style={{ color: "#ff8b47" }}>#ff8b47</span>)
                </label>
                <br />
                <input
                    onChange={(e) => {
                        setDefaultColor(e.target.value);
                        const rgb = HexToRGB(e.target.value);
                        SetCSSProperty("--orange", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                        localStorage.setItem("--orange", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    }}
                    value={defaultColor}
                    style={{ marginLeft: "-5px", width: "100%" }}
                    className="color-picker"
                    type="color"
                />
                <label>
                    Post Color (Default: <span style={{ color: "#ad614a" }}>#ad614a</span>)
                </label>
                <br />
                <input
                    onChange={(e) => {
                        setPostColor(e.target.value);
                        const rgb = HexToRGB(e.target.value);
                        SetCSSProperty("--post-color", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                        localStorage.setItem("--post-color", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    }}
                    value={postColor}
                    style={{ marginLeft: "-5px", width: "100%" }}
                    className="color-picker"
                    type="color"
                />
                <label>
                    Profile Color (Default: <span style={{ color: "#ff8e62" }}>#ff8e62</span>)
                </label>
                <br />
                <input
                    onChange={(e) => {
                        setProfileColor(e.target.value);
                        const rgb = HexToRGB(e.target.value);
                        SetCSSProperty("--profile-color", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                        localStorage.setItem("--profile-color", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    }}
                    value={profileColor}
                    style={{ marginLeft: "-5px", width: "100%" }}
                    className="color-picker"
                    type="color"
                />
                <label>Body Gradient (Default: #000000)</label>
                <br />
                <input
                    onChange={(e) => {
                        setBodyColor1(e.target.value);
                        const rgb = HexToRGB(e.target.value);
                        SetCSSProperty("--body-gradient1", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                        localStorage.setItem("--body-gradient1", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    }}
                    value={bodyColor1}
                    style={{ marginLeft: "-5px", width: "100%", paddingTop: "5px", paddingBottom: "5px", background: "#101010", borderRadius: "5px" }}
                    className="color-picker"
                    type="color"
                />
                <input
                    onChange={(e) => {
                        setBodyColor2(e.target.value);
                        const rgb = HexToRGB(e.target.value);
                        SetCSSProperty("--body-gradient2", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                        localStorage.setItem("--body-gradient2", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    }}
                    value={bodyColor2}
                    style={{ marginLeft: "-5px", width: "100%", paddingTop: "5px", paddingBottom: "5px", background: "#101010", borderRadius: "5px" }}
                    className="color-picker"
                    type="color"
                />
                <label>Body Gradient Tilt (Default: 45 Degrees)</label>
                <br />
                <input
                    onChange={(e) => {
                        setBodyDeg(parseInt(e.target.value));
                        SetCSSProperty("--body-gradient-deg", `${e.target.value}deg`);
                        localStorage.setItem("--body-gradient-deg", `${e.target.value}deg`);
                    }}
                    value={bodyDeg}
                    style={{ width: "100%" }}
                    className="input-field"
                    min={0}
                    max={360}
                    type="number"
                />
            </div>
        </>
    );
}

export default DisplayCustomization;
