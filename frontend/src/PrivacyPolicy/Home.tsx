import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { discord, github, twitter, youtube } from "../links";
import react from "react";

import "../Main.css";
import "./PrivacyPolicy.css";

function Home() {
    return (
        <>
            <div
                style={{ width: "100vw", height: "100vh", overflowY: "auto", wordWrap: "break-word" }}
                className="privacy"
            >
                <h1>Privacy & Terms</h1>
                <ul>
                    <h1 className="headline">Privacy</h1>
                    <p>
                        Beezle only collects the following information for application usage, not for advertisers or
                        anything for-profit, the only data we collect on you is:
                        <br />
                        - Your Email Address so that we can verify the logged in account is really you
                        <br />
                        - The posts you make so we can share it to others
                        <br />- Your display name, handle, profile picture and your banner that you upload
                        <br />
                        <br />
                        If you do not trust us, you can head over the{" "}
                        <a className="link" href="https://github.com/koki10190/beezle-re" target="_blank">
                            GitHub Repository
                        </a>{" "}
                        to check the source code
                    </p>
                    <br />
                    <h1 className="headline">Terms of Service</h1>
                    <li>
                        We do not take any responsibility over your account getting hacked, logged into without consent
                        etc. you're reliable for your accounts security.
                    </li>
                    <li>
                        While we strongly discourage posting of NSFW/ if you have a private account you can post NSFW,
                        we do not take any responsibility over minors getting access to +18 Private Accounts, This is
                        the private accounts responsibility to check if the account they're giving access to is not a
                        minor.
                    </li>
                    <br />
                    <h1 className="headline">Rules</h1>
                    <li>
                        People under the age of 13 are not allowed on this website, or the minimum age requiremenet in
                        your country:
                    </li>
                    <ul>
                        Asia
                        <ul>
                            <li>South Korea: 14+</li>
                            <li>Vietnam: 15+</li>
                        </ul>
                        Caribbean
                        <ul>
                            <li>Aruba: 16+</li>
                            <li>Caribbean Netherlands: 16+</li>
                            <li>Curaçao: 16+</li>
                            <li>Sint Maarten: 16+</li>
                        </ul>
                        Europe
                        <ul>
                            <li>Austria: 14+</li>
                            <li>Bulgaria: 14+</li>
                            <li>Croatia: 16+</li>
                            <li>Cyprus: 14+</li>
                            <li>Czech Republic: 15+</li>
                            <li>France: 15+</li>
                            <li>Germany: 16+</li>
                            <li>Greece: 15+</li>
                            <li>Hungary: 16+</li>
                            <li>Ireland: 16+</li>
                            <li>Italy: 14+</li>
                            <li>Lithuania: 14+</li>
                            <li>Luxembourg: 16+</li>
                            <li>Netherlands: 16+</li>
                            <li>Poland: 16+</li>
                            <li>Romania: 16+</li>
                            <li>San Marino: 16+</li>
                            <li>Serbia: 15+</li>
                            <li>Slovakia: 16+</li>
                            <li>Slovenia: 16+</li>
                            <li>Spain: 14+</li>
                        </ul>
                        South America
                        <ul>
                            <li>Chile: 14+ </li>
                            <li>Colombia: 14+ </li>
                            <li>Peru: 14+ </li>
                            <li>Venezuela: 14+</li>
                        </ul>
                    </ul>
                    <br />
                    <li>
                        You're not allowed to post NSFW content unless your account is private (Coming Soon feature)
                    </li>
                    <li>
                        You're not allowed to impersonate anyone, if you're running a parody account of theirs, clarify
                        that it is infact a parody account in the Bio or the Display Name
                    </li>
                    <li>
                        We allow completely free speech, which means slurs are allowed, but, if any slurs is targetted
                        to someone AND you get reported for it, you will get banned.
                    </li>
                    <li>
                        Promoting acts such as Child Abuse, Child Pornography and Zoophilia is not allowed and will get
                        you banned if reported/seen by a moderator (Lolicon, Shotacon and Cub Porn is under the category
                        of Child Pornography)
                    </li>
                    <li>
                        Farming Activity Coins will get your account banned or turn your Activity Coins into negative
                    </li>
                </ul>
            </div>
        </>
    );
}

export default Home;
