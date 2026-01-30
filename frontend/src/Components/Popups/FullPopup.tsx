import "./FullPopup.css";

function FullPopup(props: { children?: React.ReactNode }) {
    return (
        <div className="full-popup-container">
            <div className="full-popup">{props.children}</div>
        </div>
    );
}

export default FullPopup;
