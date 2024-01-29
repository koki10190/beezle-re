/* 
THIS IS JUST A TEST, DON'T WORK ON BACKEND YET!!

I MIGHT USE RUST FOR SERVER BACKEND!!!
*/


import express from "express"

const app = express();
app.listen(3000);

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("hello, world!");
})