import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate, GetUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../../types/User";
import { Post } from "../../../types/Post";
import { FetchPost } from "../../../functions/FetchPost";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import { ReportType } from "../../../types/Report";
import { fetchUserPublic } from "../../../functions/fetchUserPublic";
import "./Reports.css";
import { toast } from "react-toastify";
import GetAuthToken from "../../../functions/GetAuthHeader";

interface Props {
    user: UserPrivate;
}

function ReportBox({ report, setReports }: { report: ReportType; setReports: any }) {
    const [reporter, setReporter] = useState<UserPublic | null>();

    useEffect(() => {
        (async () => {
            setReporter(await fetchUserPublic(report.reported_by));
        })();
    }, []);

    const Resolve = async () => {
        const res = await axios.post(
            `${api_uri}/api/resolve_report`,
            {
                report_id: report.report_id,
            },
            {
                headers: GetAuthToken(),
            },
        );

        toast.success(res.data.message);

        setReports((old: Array<ReportType>) => {
            old.splice(
                old.findIndex((x) => x.report_id == report.report_id),
                1,
            );
            return [...old];
        });
    };

    return (
        <>
            <div className="report-box">
                {reporter ? (
                    <div className="reporter">
                        <h2 style={{ marginBottom: "10px" }}>Reporter:</h2>
                        <div onClick={() => (window.location.href = `/profile/${reporter.handle}`)} className="reporter-content">
                            <div style={{ backgroundImage: `url(${reporter.avatar})` }} className="report-pfp"></div>
                            <p className="report-handle">
                                @{reporter.handle} - {reporter.activity}
                            </p>
                        </div>
                        <br />
                        <h2>Who/what is being reported:</h2>
                        <p className="reporting">{report.reporting}</p>
                        <h2>Subject:</h2>
                        <p className="subject">{report.subject}</p>
                        <h2>Context:</h2>
                        <p className="context">{report.context}</p>
                        <div className="reporter-buttons">
                            <button onClick={Resolve} className="button-field">
                                Resolve
                            </button>
                        </div>
                    </div>
                ) : (
                    ""
                )}
            </div>
            <Divider />
        </>
    );
}

function Reports({ user }: Props) {
    const [reports, setReports] = useState<Array<ReportType>>([]);

    useEffect(() => {
        (async () => {
            const res = await axios.get(`${api_uri}/api/get_reports`, { headers: GetAuthToken() });

            setReports(res.data as Array<ReportType>);
        })();
    }, []);

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-flag" /> Reports
                </h1>
                <Divider />
                {reports.map((report) => (
                    <ReportBox setReports={setReports} report={report} />
                ))}
                {reports.length <= 0 ? "No reports" : ""}
            </div>
        </>
    );
}

export default Reports;
