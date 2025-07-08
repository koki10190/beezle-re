import { useEffect, useRef, useState } from 'react';

import { fetchUserPrivate } from '../../../functions/fetchUserPrivate';
import { UserPrivate } from '../../../types/User';
import { Post } from '../../../types/Post';
import FetchPost from '../../../functions/FetchPost';
import './Details.css';
import Divider from '../../../Components/Divider';
import { api_uri } from '../../../links';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Props {
    user: UserPrivate;
}

function Report({ user }: Props) {
    const [show, setShow] = useState(false);
    const reporting = useRef<HTMLInputElement>(null);
    const subject = useRef<HTMLInputElement>(null);
    const details = useRef<HTMLTextAreaElement>(null);

    const SendReport = async (e: any) => {
        e.preventDefault();
        const reporting_value = reporting.current!.value;
        const subject_value = subject.current!.value;
        const details_value = details.current!.value;

        if (reporting_value.replace(/ /g, '') == '') return toast.error('Must include Post Link/ID or an users handle!');
        if (subject_value.replace(/ /g, '') == '') return toast.error('Must include a subject!');
        if (details_value.replace(/ /g, '') == '') return toast.error('Must include a context!');

        const res = await axios.post(`${api_uri}/api/report`, {
            token: localStorage.getItem('access_token'),
            reporting: reporting_value,
            subject: subject_value,
            context: details_value,
        });

        toast.success(res.data.message);
        window.location.href = '/home';
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-flag" /> Report
                </h1>
                <Divider />
                <form onSubmit={SendReport}>
                    <h2>Post Link/ID you're reporting or users handle you're reporting</h2>
                    <input ref={reporting} required className="input-field fixed-100" />
                    <h2>Subject</h2>
                    <input ref={subject} required className="input-field fixed-100" />
                    <h2>Context/Details</h2>
                    <textarea ref={details} className="input-field fixed-100" />
                    <button style={{ marginTop: '15px' }} className="button-field fixed-100">
                        Send Report
                    </button>
                </form>
            </div>
        </>
    );
}

export default Report;
