export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
        return new Response("Invalid Content-Type, expected multipart/form-data", {
            status: 400,
        });
    }

    try {
        const clientFormData = await req.formData();
        const catboxFormData = new FormData();

        for (const [key, value] of clientFormData.entries()) {
            catboxFormData.append(key, value);
        }

        const catboxResponse = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            body: catboxFormData,
        });

        const responseText = await catboxResponse.text();

        return new Response(responseText, {
            status: catboxResponse.status,
            headers: { "Content-Type": "text/plain" },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
