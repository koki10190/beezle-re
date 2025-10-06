import axios from "axios";

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState, UIEvent, forwardRef } from "react";
import Divider from "../../../Components/Divider";

function DmPageCreateGC({ setOptions }: { setOptions: React.Dispatch<React.SetStateAction<BeezleDM.DmOption[]>> }) {
    return (
        <form>
            <Divider />
            <h1>
                <i className="fa-solid fa-users"></i> Create a Group Chat
            </h1>
            <Divider />
            <label>Group Chat Name</label>
            <input style={{ width: "100%" }} className="input-field" placeholder="Group Chat's Name" />
        </form>
    );
}

export default DmPageCreateGC;
