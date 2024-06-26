const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {validateUserCreation , hashPassword} = require('../utils/authincateUser');
const bcrypt = require('bcrypt');
const { loginValidationMiddleware } = require('../utils/validate-login');
const jwtUtils = require('../utils/jwt');
const { Status } = require('@prisma/client');
const emailService = require('../middleware/emailService');
const {hashUpdatePassword } = require('../middleware/hashPassword.middlewere');

const adminController = {

    createCategory: async (req, res) => {
        try {
            const { name } = req.body; 
            const category = await prisma.category.create({
                data: { name },
            });
            console.log("Category Created");
            return  res.json(category);
            
        } catch (error) {
            if (error.code === 'P2002' && error.meta.target === 'Category_name_key') {
                return res.status(400).json({ error: 'Category with this name already exists' });
            }
            console.error(error);
            res.status(500).json({ error});
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const deleteCategory = await prisma.category.delete({
                where: { id: parseInt(categoryId, 10) },
            });
            
            console.log("Category Deleted ");

            return res.json(deleteCategory);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    changeCategoryStatus :async (req, res) => {
        try {
            const { categoryId } = req.params;
            const categoryIdInt = parseInt(categoryId, 10);
    
            const existingCategory = await prisma.category.findUnique({
                where: { id: categoryIdInt },
            });
    
            if (!existingCategory) {
                console.log('Category not found.');
                return res.status(404).json({ error: 'Category not found.' });
            }
    
            console.log('Existing category:', existingCategory);
            const newStatus = existingCategory.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;
    
            const updatedCategory = await prisma.category.update({
                where: { id: categoryIdInt },
                data: { status: newStatus },
            });
    
            console.log('Updated category:', updatedCategory);
    
            return res.json(updatedCategory);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    },
    getAllCategory: async (req, res) => {
        try {
            const category = await prisma.category.findMany();
            return res.json(category);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    createUser: [
        validateUserCreation,
        hashPassword, 
        async (req, res) => {
            try {
                const { username, email, role, status } = req.body;

                const hashedPassword = req.hashedPassword;

                const user = await prisma.user.create({
                    data: { username, email, password: hashedPassword, role, status },
                    select: {
                        id: true,
                        username: true,
                        email : true,
                        role :true,
                        status :true
                    }
                });

                let message;

                switch (role) {
                    case 'ADMIN':
                        message = 'Admin created';
                        break;
                    case 'AUTHOR':
                        message = 'Author created';
                        break;
                    case 'USER':
                        message = 'User created';
                        break;
                    default:
                        message = 'Role not specified';
                        break;
                }
                const { verificationToken } = jwtUtils.generateVerificationToken(user.id, role);

                await emailService.sendVerificationEmail(email, verificationToken);

                res.json({ message, user });
                console.log(message);
                } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
    ],
    loginAdmin: [
        loginValidationMiddleware,
        async (req, res) => {
            try {
                const { email, password } = req.body;
    
                const user = await prisma.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        status: true,
                        password: true,
                        verify: true, // Include the 'verify' field in the selection
                    },
                });
    
                if (!user) {
                    return res.status(401).json({ error: 'Invalid email' });
                }
    
                if (user.role !== 'ADMIN') {
                    return res.status(403).json({ error: 'Access Denied. Only ADMINs are allowed to log in from this route.' });
                }
    
                // Check if the user is verified
                if (user.verify !== 'VERIFIED') {
                    return res.status(401).json({ error: 'Email not verified. Please verify your email before logging in.' });
                }
    
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid Password' });
                }
    
                const { accessToken, refreshToken } = jwtUtils.generateTokens(user.id, user.role);
    
                const { id, username, role, status } = user;
                const responseData = {
                    message: 'Login successful',
                    user: { id, username, email: user.email, role, status },
                    tokens: { accessToken, refreshToken },
                };
    
                res.status(200).json(responseData);
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        },
    ],
    

    viewPosts: async (req, res) => {
        try {
            const posts = await prisma.article.findMany({
                include: { author: true, comments: true },
            });
            console.log("Post");
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;
    
            const existingComment = await prisma.comment.findUnique({
                where: { id: parseInt(commentId) },
            });
    
            if (!existingComment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
    
            const deletedComment = await prisma.comment.delete({
                where: { id: parseInt(commentId) },
            });
    
            console.log('Comment Deleted');
            return res.json(deletedComment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    deletePost: async (req, res) => {
        try {
            const { articleId } = req.params;
            const deletePost = await prisma.article.delete({
                where: { id: parseInt(articleId, 10) },
            });
            
            console.log("Post Deleted");
            res.json(deletePost);
        } catch (error) {
            // console.error(error);
    
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Post not found. Unable to delete.' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updatePassword: [
        hashUpdatePassword,
        async (req, res) => {
            try {
                const userId = req.user.userId; 
                const { oldPassword, newPassword } = req.body;
    
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { password: true },
                });
    
                const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid old password' });
                }
    
                await prisma.user.update({
                    where: { id: userId },
                    data: { password: req.hashedPassword },
                });
    
                res.status(200).json({ message: 'Password updated successfully' });
            } catch (error) {
                console.error('Error during updatePassword:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    ],
    
    changeUserStatus: async (req, res) => {try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId, 10);

        const existingUser = await prisma.user.findUnique({
            where: { id: userIdInt },
        });

        if (!existingUser) {
            console.log('User not found.');
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log('Existing User:', existingUser);

        const newStatus = existingUser.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

        const updatedStatus = await prisma.user.update({
            where: { id: userIdInt },
            data: { status: newStatus },
        });

        console.log('Updated User:', updatedStatus);

        res.json(updatedStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }},
    getAllUsers: async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                },
            });
            return res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    getAllArticles: async (req, res) => {
        try {
            const article = await prisma.article.findMany();
            return res.json(article);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },   
};


module.exports = adminController;