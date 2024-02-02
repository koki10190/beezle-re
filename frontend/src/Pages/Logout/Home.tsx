function Home() {
    return (
        <>
            {localStorage.removeItem("access_token")}
            {window.location.replace("/")}
        </>
    );
}

export default Home;
