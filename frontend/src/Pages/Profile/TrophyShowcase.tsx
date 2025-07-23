import { TrophyType } from "../../types/showcase/Trophy";
import { UserPublic } from "../../types/User";

function TrophyShowcase({ type, user }: { type: TrophyType; user: UserPublic }) {
    return (
        <div className="trophy-showcase">
            <h3 style={{ color: type.color }}>
                <i className={type.icon} /> {type.name}
            </h3>
            <p>{type.description}</p>
        </div>
    );
}

export default TrophyShowcase;
