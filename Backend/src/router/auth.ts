import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
// import bcryptjs from "bcryptjs";
import { users } from "./schema";
import { NewUser } from "../router/schema";

const authRouter = Router();

interface singUp {
    name: string,
    email: string,
    password: string
}

authRouter.post("/singup", async (req: Request<{}, {}, singUp>, res: Response) => {
    try {
        //get body
        const { name, email, password } = req.body;

        //check if user is already exists
        const existUser = await db.select().from(users).where(eq(users.email, email.toString()));
        if (existUser.length) {
            res.status(400).json({ "msg": "User with same email is already exist!" })
            return;
        }
        //hash the passowrd 
        // const hashpassword = await bcryptjs.hash(password.toString(), 6);

        //create new user and save in db
        const newUser: NewUser = {
            name,
            email,
            password,
        }

        const user = db.insert(users).values(newUser).returning();
        res.status(200).json(user);

    } catch (e) {
        res.status(500).json({ "error": e });
    }
})

authRouter.get("/me", (req, res) => {
    res.json({ "me": "yo you are great¯" })
})
export default authRouter;