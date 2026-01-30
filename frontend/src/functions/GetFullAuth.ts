function GetFullAuth() {
    return { headers: { Authorization: localStorage.getItem("access_token") } };
}

export default GetFullAuth;
