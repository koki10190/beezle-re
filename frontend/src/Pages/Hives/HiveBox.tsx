import { useNavigate } from "react-router-dom";
import "./HiveBox.css";

function HiveBox({ hive, joined = false }: { hive: BeezleHives.Hive; joined?: boolean }) {
    const navigate = useNavigate();
    return (
        <>
            <div onClick={() => navigate("/hive/" + hive.hive_id)} className="hive-box">
                {joined ? (
                    <h3
                        style={{
                            marginTop: "0px",
                            color: "rgba(255,255,255,0.5)",
                        }}
                    >
                        Already Joined
                    </h3>
                ) : (
                    ""
                )}
                <div
                    style={{
                        backgroundImage: `url(${hive.banner})`,
                    }}
                    className="hive-box-banner"
                ></div>
                <div
                    style={{
                        backgroundImage: `url(${hive.icon})`,
                    }}
                    className="hive-box-avatar"
                ></div>
                <p className="hive-box-username">{hive.name}</p>
                <p className="hive-box-handle">@{hive.handle}</p>
                <div className="hive-box-desc-container">
                    <p className="hive-box-desc-header">
                        <i className="fa-solid fa-address-card"></i> Description
                    </p>
                    <p className="hive-box-desc">{hive.description}</p>
                </div>
                <button
                    style={{
                        width: "100%",
                        marginBottom: "0px",
                        marginTop: "10px",
                    }}
                    className="button-field"
                    onClick={() => navigate("/hive/" + hive.hive_id)}
                >
                    See Hive
                </button>
            </div>
        </>
    );
}

export default HiveBox;
