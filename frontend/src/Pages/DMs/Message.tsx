import { useRef, useState } from "react";
import { UserPublic } from "../../types/User";
import dmSocket from "../../ws/dm-socket";
import { DMData } from "../../types/DM";

function Message({ content, user, by_me, data }: { by_me: boolean; content: string; user: UserPublic; data: DMData }) {
    const [showOptions, setShowOptions] = useState<boolean>(true);
    const [editing, setEditing] = useState<boolean>(false);
    const [m_content, setContent] = useState<string>(content);
    const editInput = useRef<HTMLTextAreaElement>(null);

    const DeleteMessage = () => {};

    const EditMessage = () => {
        setEditing((old) => {
            if (!old) editInput.current!.value = m_content;
            return !old;
        });
    };

    const EditButtonSuccess = () => {
        setEditing(false);

        const new_content = editInput.current!.value;
        if (!new_content) return;

        console.log(data.to.handle, data._id, new_content);
        dmSocket.emit("edit message", data.to.handle, data._id, new_content);
    };

    return (
        <div
            onMouseEnter={() => setShowOptions(true)}
            // onMouseLeave={() => setShowOptions(false)}
            className={`dm-message ${by_me ? "by_me" : ""}`}
        >
            <textarea style={{ display: editing ? "block" : "none" }} ref={editInput} className="input-field"></textarea>
            <button onClick={EditButtonSuccess} className="button-field dm-message-edit-button" style={{ display: editing ? "block" : "none" }}>
                Edit
            </button>
            {editing ? "" : <p className="dm-message-content">{m_content}</p>}
            {by_me && showOptions ? (
                <div className="dm-message-options">
                    <a onClick={EditMessage} style={{ marginLeft: "-10px" }} className="dm-message-options-button edit">
                        <i className="fa-solid fa-pen-to-square"></i>
                    </a>
                    <a style={{ marginLeft: "10px" }} className="dm-message-options-button delete">
                        <i className="fa-solid fa-trash"></i>
                    </a>
                </div>
            ) : (
                ""
            )}
        </div>
    );
}

export default Message;
