import { Router } from "express";

const authRouter = Router();

authRouter.get("/me",(req,res)=>{
    res.json({"me":"yo you are great¯"})
})
export default authRouter;