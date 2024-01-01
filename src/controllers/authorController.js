const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { loginValidationMiddleware } = require('../utils/validate-login');
const { generateToken } = require('../utils/jwt');
const {hashUpdatePassword } = require('../middleware/hashPassword.middlewere');
const upload = require('../configuration/multer.config'); 

const authorController = {
    loginAuthor: [
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
                    },
                });
    
                if (!user) {
                    return res.status(401).json({ error: 'Invalid email' });
                }
    
                // Check if the user has the role 'author'
                if (user.role !== 'AUTHOR') {
                    return res.status(403).json({ error: 'Access Denied. Only AUTHORS are allowed to log in from this route.' });
                }
    
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid Password' });
                }
                
                const token = generateToken(user.id, user.role);
    
                const { id, username, role, status } = user;
                const responseData = { message: 'Login successful', user: { id, username, email: user.email, role, status }, token };
    
                res.status(200).json(responseData);
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    ],
    createArticle: async (req, res) => {
        const uploadMiddleware = upload.single('imageData');
        
        uploadMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: 'Multer error', details: err.message });
            } else if (err) {
                return res.status(500).json({ error: 'Internal server error', details: err.message });
            }
    
            try {
                const { title, content, categoryId, status } = req.body;
                const authorId = req.user.id;
                const authorRole = req.user.role;
    
                if (authorRole !== 'AUTHOR') {
                    return res.status(403).json({ error: 'Forbidden', details: 'User is not authorized to create an article.' });
                }
    
                if (!authorId) {
                    return res.status(400).json({ error: 'Invalid user ID', details: 'User ID is missing.' });
                }
    
                let existingCategory;
                let categoryName;
    
                if (categoryId) {
                    existingCategory = await prisma.category.findUnique({
                        where: {
                            id: parseInt(categoryId),
                        },
                    });
    
                    if (!existingCategory) {
                        return res.status(400).json({ error: 'Invalid category ID', details: 'Category not found.' });
                    }
    
                    categoryName = existingCategory.name;
                }
    
                const createdArticle = await prisma.article.create({
                    data: {
                        title,
                        content,
                        imageData: req.file ? req.file.filename : undefined,
                        category: categoryId
                            ? {
                                connect: {
                                    id: parseInt(categoryId),
                                },
                            }
                            : undefined,
                        categoryName,
                        author: {
                            connect: {
                                id: authorId,
                            },
                        },
                        status,
                    },
                });
    
                res.status(201).json({ message: 'Article created successfully', article: createdArticle });
            } catch (error) {
                console.error('Error creating article:', error);
                res.status(500).json({ error: 'Internal server error', details: error.message });
            }
        });
    },
    
    
    viewALLPosts: async (req, res) => {
        try {
            const posts = await prisma.article.findMany({
                include: { author:  {
                    select: {
                        id: true,
                        username: true,
                        },
                    }, comments: true },
            });
            console.log("Post");
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getArticles: async (req, res) => {
        try {
            const userId = req.user.id;
            const articles = await prisma.article.findMany({
                where: { authorId: userId },
                select: { id: true, title: true, content: true },
            });

            res.status(200).json({ articles });
        } catch (error) {
            console.error('Error during getArticles:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    deleteArticle: async (req, res) => {
        try {
            const articleId = req.params.id;
            const userId = req.user.id;
    
            const article = await prisma.article.findUnique({
                where: { id: Number(articleId) },
                select: { authorId: true },
            });
    
            if (!article || article.authorId !== userId) {
                return res.status(403).json({ error: 'Access Denied. You are not the owner of this article.' });
            }
    
            await prisma.article.delete({ where: { id: Number(articleId) } });
    
            res.status(200).json({ message: 'Article deleted successfully' });
        } catch (error) {
            console.error('Error during deleteArticle:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    updatePassword: [
        hashUpdatePassword,
        async (req, res) => {
            try {
                const userId = req.user.id;
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
    updateArticle: async (req, res) => {
        try {
            const userId = req.user.id;
            const articleId = parseInt(req.params.id, 10); // Convert to integer
            const { title, content } = req.body;
    
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required for update' });
            }
    
            const article = await prisma.article.findUnique({
                where: { id: articleId },
                select: { authorId: true },
            });
    
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }
    
            if (article.authorId !== userId) {
                return res.status(403).json({ error: 'Access Denied. You are not the owner of this article.' });
            }
    
            const updatedArticle = await prisma.article.update({
                where: { id: articleId },
                data: { title, content },
            });
    
            res.status(200).json({ message: 'Article updated successfully', article: updatedArticle });
        } catch (error) {
            console.error('Error during updateArticle:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    
    
};


module.exports = authorController;
