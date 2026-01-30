import "./Preloader.css";

function Preloader({ style = {}, className = "" }) {
    return (
        <div className="centered-loading-bar">
            <div className="centered-loading-bar-gif"></div>
        </div>
    );
}

export default Preloader;
