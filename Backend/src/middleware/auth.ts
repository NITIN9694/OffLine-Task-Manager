import { UUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
    user?: UUID;
    token?: string;
}


export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const token = req.header("x-auth-token");

        if (!token) {
            res.status(401).json({ error: "No auth token, access denied!" });
            return;
        }
        const verifed = jwt.verify(token, "passwordKey");

        if (!verifed) {
            res.status(401).json({ error: "token verifed fail!" });
            return;
        }
        const verifedToken = verifed as { id: UUID };

        const [user] = await db.select().from(users).where(eq(users.id, verifedToken.id.toString()));
        if (!user) {
            res.status(401).json({ error: "User Not Found" });
            return;
        }
        req.user = verifedToken.id;
        req.token = token;

        next();

    } catch (e) {
        res.status(500);
    }
}