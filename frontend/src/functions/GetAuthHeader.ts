function GetAuthToken() {
    return { Authorization: localStorage.getItem("access_token") };
}

export default GetAuthToken;
