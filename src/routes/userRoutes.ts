import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// User CRUD

// Create user
router.post('/', async (req, res) => {
    try{const {email, name , username} = req.body;

    const result = await prisma.user.create({
        data:{
            email,name,username,bio:"hello, I am new in X"
        }
    })
    res.json(result);
    }catch{
        res.status(400).json({error:"user already exists"})
    }
});

// list users
router.get('/', async (req, res) => {
    const allUser = await prisma.user.findMany();
    res.json(allUser);
});

// get one user
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({where:{id:Number(id)},include:{tweets:true}});
    res.json(user);
});

// update user
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {bio, name, image}= req.body;

    try{
        const result = await prisma.user.update({
            where:{id:Number(id)},
            data:{
                bio,name,image
            }
        })
        res.json(result);
    }catch{
        res.status(400).json({error:"failed to update the user"})
    }
});

// delete user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const result = await prisma.user.delete({
            where:{id:Number(id)}
        })
        res.json(result);
    }catch{
        res.status(200)
    }
});

export default router;