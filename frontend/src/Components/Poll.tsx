import moment from "moment";
import { useEffect, useState } from "react";
import { fetchUserPrivate } from "../functions/fetchUserPrivate";
import axios from "axios";
import { api_uri } from "../links";
import GetFullAuth from "../functions/GetFullAuth";
import { toast } from "react-toastify";
import { UserPrivate } from "../types/User";

interface Props {
    poll: BeezlePolls.Poll;
    winner?: string;
    selected?: string;
    over?: boolean;
    self_user: UserPrivate;
}

function Poll({ poll, winner, selected, over, self_user }: Props) {
    const [sWinner, setWinner] = useState(winner ?? "");
    const [sSelected, setSelected] = useState(selected ?? "");
    const [sOver, setOver] = useState(over ?? false);
    const [date, setDate] = useState(moment(new Date(parseInt(poll.expiry_date.$date.$numberLong))).utc());
    const [dateStr, setDateStr] = useState("1 minute");
    const [voteCounters, setVoteCounters] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const interval = setInterval(() => {
            let str = date.fromNow(true);
            setDateStr(
                str === "a minute" || str === "a few minutes" || str === "a few seconds"
                    ? `${moment((date as any) - Date.now()).minutes()}m ${moment((date as any) - Date.now()).seconds()}s`
                    : str,
            );
            if (Date.now() >= date.toDate().getTime()) setOver(true);
        }, 1000);

        let voted = poll.voters.find((x) => x.handle === self_user.handle);

        if (voted) {
            setSelected(voted.value);
        }

        const voteMap = new Map();
        for (let i = 0; i < poll.voters.length; i++) {
            const voter = poll.voters[i];
            const got = voteMap.get(voter.value);
            if (got) {
                voteMap.set(voter.value, got + 1);
                continue;
            }

            voteMap.set(voter.value, 1);
        }
        setVoteCounters(voteMap);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const Vote = async (value) => {
        try {
            const res = await axios.patch(
                `${api_uri}/api/polls/vote`,
                {
                    poll_id: poll.poll_id,
                    value,
                },
                GetFullAuth(),
            );

            if (res.data.error) {
                toast.error(res.data.error);
                return;
            }

            setSelected(value);
            setVoteCounters(new Map(voteCounters).set(value, voteCounters.get(value) ? voteCounters.get(value) + 1 : 1));
        } catch (e) {
            console.log(e);
            toast.error(e);
        }
    };

    return (
        <div className="post-poll">
            <h3 className="post-poll-title">{poll.title}</h3>
            <div className="post-poll-options">
                {poll.options.map((option) => {
                    return (
                        <button
                            key={option}
                            onClick={() => Vote(option)}
                            className={`post-poll-option ${sOver ? "poll-over" : ""} ${sWinner === option ? "poll-winner" : ""} ${
                                sSelected === option ? "poll-selected" : ""
                            } `}
                        >
                            {option} <span className="option-votes">- {voteCounters.get(option) ?? 0} Votes</span>
                        </button>
                    );
                })}
            </div>
            <p className="post-poll-footer">
                {sOver ? "Poll Finished" : `Ends in: ${dateStr}`} | {poll.voters.length} Total Votes
            </p>
        </div>
    );
}

export default Poll;
