function Home() {
    return (
        <>
            {localStorage.removeItem("access_token")}
            {(window.location.href = "/")}
        </>
    );
}

export default Home;
