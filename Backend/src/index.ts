import express from "express";
import authRouter from "./router/auth";

const app = express();

app.use(express.json());
app.use("/auth", authRouter);


app.listen(8000, () => {
    console.log("server running in 8000");
})