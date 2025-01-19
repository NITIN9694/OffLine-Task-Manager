import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { users } from "../db/schema";
import { NewUser } from "../db/schema";
import { log } from "console";
import jwt from "jsonwebtoken";
import { AuthRequest, auth } from "../middleware/auth";


const authRouter = Router();

interface singUp {
    name: string,
    email: string,
    password: string
}

authRouter.post(
    "/signup",
    async (req: Request<{}, {}, singUp>, res: Response) => {
        try {
            // get req body
            const { name, email, password } = req.body;
            // check if the user already exists
            const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (existingUser.length) {
                res
                    .status(400)
                    .json({ error: "User with the same email already exists!" });
                return;
            }

            // hashed pw
            const hashedPassword = await bcryptjs.hash(password, 8);
            // create a new user and store in db
            const newUser: NewUser = {
                name,
                email,
                password: hashedPassword,
            };

            const [user] = await db.insert(users).values(newUser).returning();
            res.status(201).json(user);
        } catch (e) {
            log("error \e")
            res.status(500).json({ error: e });
        }
    }
);

interface loginBody {
    email: string,
    password: string
}

authRouter.post(
    "/login",
    async (req: Request<{}, {}, loginBody>, res: Response) => {
        try {
            // get req body
            const { email, password } = req.body;
            // check if the user already exists
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (!existingUser) {
                res
                    .status(400)
                    .json({ error: "User with this email does't exist!" });
                return;
            }

            // compare password 
            const isPasswordMatch = await bcryptjs.compare(password, existingUser.password);

            if (!isPasswordMatch) {
                res.status(400).json({ "msg": "user password not match!" });

            }
            const token = jwt.sign({ id: existingUser.id }, "passwordKey");



            res.json({ token, ...existingUser });
        } catch (e) {
            log("error \e")
            res.status(500).json({ error: e });
        }
    }
);


authRouter.post("/validToken", async (req, res) => {
    try {
        const token = req.header("x-auth-json");

        if (!token) {
            res.status(400).json(false);
            return;
        }
        const verifed = jwt.verify(token, "passwordKey");

        if (!verifed) {
            res.status(400).json(false);
            return;
        }
        const verifedToken = verifed as { id: String };
        log(verifedToken.id.toString())

        const [user] = await db.select().from(users).where(eq(users.id, verifedToken.id.toString()));
        if (!user) {
            res.status(400).json(false)
            return;
        }

        res.json(true)

    } catch (e) {
        res.status(500);
    }
})


authRouter.get("/me", auth, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "User not Found!" })
            return;
        }
        log("requeser \req")
        const [user] = await db.select().from(users).where(eq(users.id, req.user));

        res.json({ ...user, token: req.token })


    } catch (e) {
        res.status(500).json({ error: "something went wrong" })
    }
})
export default authRouter;