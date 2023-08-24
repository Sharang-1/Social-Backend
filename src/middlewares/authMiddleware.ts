import {Request, Response, NextFunction} from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ||"SUPER SECRET";

type AuthRequest = Request &{user?:User};

export async function authenticateToken (
    req: AuthRequest,
    res: Response,
    next: NextFunction
){
    const authHeader = req. headers ['authorization'];
    const jwtToken = authHeader?.split('')[1];

    if (!jwtToken){
        res.status(401).json({error:"Missing Token"});
    }

    try{
        const payload = await (jwt.verify(String(jwtToken),JWT_SECRET) )as  {tokenId: number};
        const dbToken = await prisma.token.findUnique({
            where:{id:payload.tokenId},
            include:{
                user:true
            }
        });
        if (!dbToken?.valid || dbToken.expiration< new Date()){
            res.status(401).json({error:"API Token expired"});
        }
        req.user = dbToken?.user;
    }catch(e){
        res.sendStatus(401);
    }

    next();
}