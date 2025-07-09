import { useEffect, useRef, useState } from 'react';
import { checkToken } from '../../functions/checkToken';

import Divider from '../../Components/Divider';
import PostBox from '../../Components/PostBox';
import { fetchUserPrivate } from '../../functions/fetchUserPrivate';
import { UserPrivate, UserPublic } from '../../types/User';
import { Post } from '../../types/Post';
import FetchPost from '../../functions/FetchPost';
import dmSocket from '../../ws/dm-socket';
import './DMUser.css';
import axios from 'axios';
import { api_uri } from '../../links';
import sanitize from 'sanitize-html';
import Message from './Message';
import { DMData } from '../../types/DM';
import { fetchUserPublic } from '../../functions/fetchUserPublic';
import { useHref, useParams } from 'react-router-dom';

function DMSpace({ dm_user, setDMUser, self_user }: { dm_user: UserPublic; setDMUser: any; self_user: UserPrivate }) {
    const [steamData, setSteamData] = useState<any | null>(null);
    const [shiftPressed, setShiftPressed] = useState<boolean>(false);
    const [messages, setMessages] = useState<Array<DMData>>([]);
    const messageField = useRef<HTMLTextAreaElement>(null);
    const dmContent = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('get messages! in effect');

        if (dm_user && self_user) dmSocket.emit('get messages', dm_user.handle, self_user.handle);

        (async () => {
            if (dm_user.connections?.steam?.id) {
                const steam_res = await axios.get(`${api_uri}/api/connections/steam_get_game?steam_id=${dm_user.connections?.steam?.id}`);
                const steam_data = steam_res.data;
                if (steam_data) setSteamData(steam_data[Object.keys(steam_data)[0]].data);
            }
        })();

        dmSocket.on('get message', (data: DMData) => {
            data.date = new Date(data.date);
            console.log('[FROM DM PAGE] Received a DM From user "', data.from.username, '" Content:', data.content);
            console.log(data);
            setMessages((old) => [...old, data]);
            dmContent.current!.scrollTo(0, dmContent.current.scrollHeight + 100);
        });

        dmSocket.on('receive messages', (messages: Array<DMData>) => {
            console.log('receive messages!');
            for (const i in messages) {
                messages[i].date = new Date(messages[i].date);
            }
            console.log(messages);
            setMessages(messages);
        });

        dmSocket.on('receiver not found client add', (message: DMData) => {
            message.date = new Date(message.date);
            setMessages((old) => [...old, message]);
        });

        dmSocket.on('message edited', (id: string, new_message: DMData) => {
            setMessages((old) => {
                const _new = [...old];
                _new[_new.findIndex((x) => x._id === id)].content = 'kys niggay';

                console.log('New msg', _new, old);
                return _new;
            });
        });
    }, []);

    useEffect(() => {
        if (dm_user && self_user) {
            console.log('get messages! in dm user effect');
            dmSocket.emit('get messages', dm_user.handle, self_user.handle);
        }
    }, [dm_user]);

    const SendMessage = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const content = messageField.current!.value;
        messageField.current!.value = '';

        // const data: DMData = {
        //     from: self_user,
        //     to: await fetchUserPublic(dm_user.handle),
        //     content,
        //     date: new Date(),
        //     edited: false,
        //     _id: "",
        // };
        dmSocket.emit('send message', dm_user.handle, content);
        // setMessages(old => [...old, data]);
    };

    return (
        <>
            <div className="dmspace">
                <div className="dmspace-pfp" style={{ backgroundImage: `url(${dm_user.avatar})` }}></div>
                <p className="dmspace-username">{dm_user.username}</p>
                <p className="dmspace-handle">
                    @{dm_user.handle}{' '}
                    {dm_user?.activity.replace(/ /g, '') !== '' && dm_user ? (
                        <span style={{ color: 'white' }}>- {sanitize(dm_user.activity.replace(/(.{35})..+/, '$1…'), { allowedTags: [] })}</span>
                    ) : dm_user && steamData ? (
                        <span style={{ color: 'white' }}>
                            - <i className="fa-brands fa-steam" /> Playing {steamData.name}
                        </span>
                    ) : (
                        ''
                    )}
                </p>
            </div>
            <Divider />
            <div ref={dmContent} className="dm-content">
                {messages.length <= 0 ? 'No messages' : ''}
                {messages.map((message) => {
                    return (
                        <Message
                            data={message}
                            content={message.content}
                            user={message.from}
                            key={message._id}
                            by_me={message.from.handle === self_user.handle}
                        />
                    );
                })}
            </div>
            <textarea
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !shiftPressed) SendMessage(event);
                    if (event.key === 'Shift') setShiftPressed(true);
                }}
                onKeyUp={(event) => {
                    if (event.key === 'Shift') setShiftPressed(false);
                }}
                onBlur={(event) => {
                    console.log('blur');
                    setShiftPressed(false);
                }}
                ref={messageField}
                placeholder={`Message @${dm_user.handle}`}
                className="input-field dm-input"
            ></textarea>
        </>
    );
}

function MiddleSide({ dm_user, setDMUser }: { dm_user: UserPublic; setDMUser: any }) {
    const [self_user, setSelfUser] = useState<UserPrivate>();

    const { user_handle } = useParams();

    useEffect(() => {
        if (!user_handle) return;

        (async () => {
            setDMUser(await fetchUserPublic(user_handle));
        })();
    }, [user_handle]);

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);
            console.log(dmSocket);
            if (user_handle) {
                const ussr = await fetchUserPublic(user_handle);
                setDMUser(ussr);
                console.log('Confirmed', ussr);
            }
        })();
    }, []);

    const SendMessage = () => {
        dmSocket.emit('send message', 'koki', 'Hello from dms!');
    };

    return (
        <div className="dmspacepage-sides side-middle home-middle">
            {dm_user && self_user?.handle ? <DMSpace self_user={self_user} dm_user={dm_user} setDMUser={setDMUser} /> : ''}
        </div>
    );
}

export default MiddleSide;
