fetch("https://server.beezle.lol:3000/api/profile/edit", {
    headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en;q=0.9",
        authorization:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJoYW5kbGUiOiJrb2tpIiwidXNlcm5hbWUiOiJrb2tpIiwiZW1haWwiOiJsdWthb2R6ZWxhc2h2aWxpQGdtYWlsLmNvbSIsImhhc2hfcGFzc3dvcmQiOiIkMmIkMTIkRnpCSENEbWRBMU45RlYxdkJIL2xsZU1KNlExRE9EcWw1d0Z1TkhueDB6bE5WM0pyZTczc3kiLCJleHAiOjI1MjQ2MDgwMDAsImJhZGdlcyI6WzAsMiwzXX0.hLXM2zit9EG1t9UzBs0qL-2sb7xRrFR_Nnid8X1jAfU",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua": '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
        Referer: "https://beezle.lol/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: '{"username":"koki","avatar":"https://cdn.discordapp.com/attachments/1201958033253744691/1399546573033177219/jJZ2DEZ.png?ex=688964d1&is=68881351&hm=3aa1ed7fbe184604ce1bd6f23059d495e7d5801ce1bc4de43cb7df8f83096724&","banner":"https://i.imgur.com/VWL35fU.jpeg","about_me":"No. 1 most stupid programmer alive on earth\\nBILLIONS MUST BEEZLE. <:erm:>","activity":"","profile_gradient1":"#0091ff","profile_gradient2":"#00ff00","name_color1":"#00ff04","name_color2":"#007bff","avatar_shape":3,"profile_postbox_img":""}',
    method: "PATCH",
});
