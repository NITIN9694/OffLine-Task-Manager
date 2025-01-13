import express from "express";

const app = express();


app.get("/", (req, res) => {
    res.send("hey you are aewsom")
})
app.listen(8000, () => {
    console.log("server running in 8000");
})