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
import { toast } from "react-toastify";
import "./ChangeAccounts.css";

interface Props {
    user: UserPrivate;
}

interface AccountDisplayProps {
    main_token: string;
    token: string;
    accounts: string[];
    setAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}

function AccountDisplay({ main_token, token, accounts, setAccounts }: AccountDisplayProps) {
    const [user, setUser] = useState<UserPrivate>();

    useEffect(() => {
        (async () => {
            const user = await fetchUserPrivate(token);
            setUser(user);
        })();
    }, []);

    const SelectAccount = () => {
        localStorage.setItem("access_token", token);
        window.location.reload();
    };

    const RemoveAccount = () => {
        setAccounts((old) => {
            const new_arr = [...old];
            const index = new_arr.findIndex((x) => x === token);

            if (index < 0) {
                toast.error("Couldn't find this account!");
                return old;
            }

            if (token === main_token) {
                localStorage.removeItem("access_token");
                window.location.href = "/";
            }

            new_arr.splice(index, 1);
            return new_arr;
        });
    };

    return (
        <div className="change-acc-display">
            <div style={{ backgroundImage: `url(${user?.avatar})` }} className="pfp"></div>
            <p className="username">@{user?.handle}</p>
            <div className="change-acc-buttons">
                {main_token !== token ? (
                    <button onClick={SelectAccount} className="button-field button-field-small button-field-blurple">
                        <i className="fa-solid fa-check"></i> Select
                    </button>
                ) : (
                    <button disabled className="button-field button-field-small">
                        <i className="fa-solid fa-check"></i> Already Selected
                    </button>
                )}
                <button onClick={RemoveAccount} className="button-field button-field-small button-field-red">
                    <i className="fa-solid fa-x"></i> Remove
                </button>
            </div>
        </div>
    );
}

function ChangeAccounts({ user }: Props) {
    const [accounts, setAccounts] = useState<string[]>([]);
    const [main_token, setMainToken] = useState<string>(localStorage.getItem("access_token"));

    // Adding Shit
    const email = useRef<HTMLInputElement>();
    const password = useRef<HTMLInputElement>();

    const AddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const email_value = email.current!.value;
        const password_value = email.current!.value;
        if (email_value === "" || password_value === "") return;

        try {
            const data = (
                await axios.post(`${api_uri}/api/login_user`, {
                    email: email.current!.value,
                    password: password.current!.value,
                })
            ).data;

            if (data.error) toast.error(data.error);

            setAccounts((old) => {
                const new_arr = [...old];
                new_arr.push(data.token as string);
                return new_arr;
            });
            toast.success("Added the account!");
        } catch (e) {
            toast.error("There was an error while trying to contact the server!");
            console.error(e);
        }
    };

    const func_SetAccounts = () => {
        if (localStorage.getItem("accounts") == null || localStorage.getItem("accounts") === "[]") {
            localStorage.setItem("accounts", JSON.stringify([localStorage.getItem("access_token")]));
        }
        setAccounts(JSON.parse(localStorage.getItem("accounts") as string) as string[]);
    };

    useEffect(() => {
        func_SetAccounts();
    }, []);

    useEffect(() => {
        localStorage.setItem("accounts", JSON.stringify(accounts));
    }, [accounts]);

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-users"></i> Change Accounts
                </h1>
                <Divider />
                <form onSubmit={AddAccount} className="change-acc-add-acc">
                    <h2>Add Account</h2>
                    <input className="input-field" ref={email} name="email" placeholder="Email or Handle"></input>
                    <input className="input-field" ref={password} type="password" name="password" placeholder="Password"></input>
                    <button className="button-field button-field-small button-field-blurple">
                        <i className="fa-solid fa-check"></i> Add Account
                    </button>
                </form>

                <Divider />
                <div className="change-acc-display-container">
                    {accounts.map((token) => {
                        return <AccountDisplay setAccounts={setAccounts} accounts={accounts} main_token={main_token} key={token} token={token} />;
                    })}
                </div>
            </div>
        </>
    );
}

export default ChangeAccounts;
