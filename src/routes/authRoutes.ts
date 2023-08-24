import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';
import jwt from 'jsonwebtoken';
import { sendEmailToken } from '../services/emailservices';

const EMAIL_TOKEN_EXPIRATION_MINUTES =10;
const AUTH_TOKEN_EXPIRATION_HOURS = 12;
const router = Router();
const Prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ||"SUPER SECRET";

function generateEmailToken(): string {
    return Math. floor (10000000 + Math. random () * 90000000) . toString();
}

function generateAuthToken(tokenId:number):string{
    const jwtPayload ={tokenId}
    return jwt.sign(jwtPayload, JWT_SECRET,{
        algorithm:"HS256",
        noTimestamp: true
    });
}

router.post('/login',async (req, res)=>{
    const { email } = req.body;

    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime()+ EMAIL_TOKEN_EXPIRATION_MINUTES*60*1000);
    try{
       const createdToken = await Prisma.token.create({
            data:{
                type:'EMAIL',
                emailToken,
                expiration,
                user:{
                    connectOrCreate:{
                        where:{email},
                        create:{email},
                    }
                }
            }
        });
        console.log(createdToken);
        await sendEmailToken(email, emailToken);
        res.sendStatus(200); 
    }catch{
        console.log(error);
        res.sendStatus(500);
    }
    
});

router.post('/authenticate',async (req, res)=>{
    const { email, emailToken } = req. body;

    const dbEmailToken = await Prisma.token.findUnique({
        where:{emailToken},
        include:{
            user:true
        }
    });

    console. log (dbEmailToken) ;
    if (!dbEmailToken || !dbEmailToken.valid){
        return res.sendStatus(401);
    }

    if(dbEmailToken.expiration< new Date()){
        return res.sendStatus(401).json({error: "Token expired!"});
    }

    if(dbEmailToken?.user?.email != email){
        return res.sendStatus(401);
    }

    const expiration = new Date(new Date().getTime()+ AUTH_TOKEN_EXPIRATION_HOURS*60*60*1000);
    const apiToken = await Prisma.token.create({
        data:{
            type:'API',
            expiration,
            user:{
                connect:{
                    email,
                },
            },
        },
    });

    await Prisma.token.update({
        where:{id:dbEmailToken.id},
        data:{valid:false},
    });

    const authToken = generateAuthToken(apiToken.id);

    res.sendStatus(200).json({authToken});
})

export default router;