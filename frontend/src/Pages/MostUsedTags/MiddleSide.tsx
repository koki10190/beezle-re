import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";
import "./MostUsedTags.css";

interface HashtagCounter {
    _id: String;
    count: number;
}

function GetTrophy({ index }: { index: number }) {
    switch (index) {
        case 0:
            return <i className="fa-solid fa-trophy-star" style={{ color: "#ffbb29" }}></i>;
        case 1:
            return <i className="fa-solid fa-trophy" style={{ color: "#c2c2c" }}></i>;
        case 2:
            return <i className="fa-solid fa-trophy" style={{ color: "#cd7f32" }}></i>;
        default:
            return <i className="fa-solid fa-award" style={{ color: "#ffffff" }}></i>;
    }
}

function IndexSuffix(index: number) {
    switch (index) {
        case 0:
            return "st";
        case 1:
            return "nd";
        case 2:
            return "rd";
        default:
            return "th";
    }
}

function MiddleSide() {
    const { hashtag } = useParams();
    // const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [hashtags, setHashtags] = useState<HashtagCounter[]>([]);
    const [postOffset, setPostOffset] = useState(0);

    useEffect(() => {
        (async () => {
            const data = (await axios.get(`${api_uri}/api/post/hashtag/topten`)).data;
            setHashtags(data.hashtags);
        })();
    }, []);

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-hashtag"></i> Most Used Hashtags
            </h1>
            <Divider />
            {hashtags.length < 1
                ? "I hear crickets... 🦗"
                : hashtags.map((tag, index) => (
                      <div onClick={() => (window.location.href = "/hashtag/" + tag._id)} className="most-used-hashtag-box">
                          <h1>
                              <GetTrophy index={index} /> {(index + 1).toString() + IndexSuffix(index)} Place
                          </h1>
                          <a className="mention" href={`/hashtag/${tag._id}`}>
                              #{tag._id}
                          </a>{" "}
                          - Used <b>{tag.count.toLocaleString("en-US")}</b> {tag.count === 1 ? "time" : "times"}
                      </div>
                  ))}
        </div>
    );
}

export default MiddleSide;
