require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { loginValidationMiddleware } = require('../utils/validate-login');
const { generateTokens } = require('../utils/jwt');
const {hashUpdatePassword } = require('../middleware/hashPassword.middlewere');


const prisma = new PrismaClient();

const userController = {
    loginUser: [
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
                        verify: true, 
                    },
                });
    
                if (!user) {
                    return res.status(401).json({ error: 'Invalid email' });
                }
    
                if (user.role !== 'USER') {
                    return res.status(403).json({ error: 'Access Denied. Only USERS are allowed to log in from this route.' });
                }
    
                if (user.verify !== 'VERIFIED') {
                    return res.status(401).json({ error: 'Email not verified. Please verify your email before logging in.' });
                }
    
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid Password' });
                }
    
                const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
                const { id, username, role, status } = user;
                const responseData = {
                    message: 'Login successful',
                    user: { id, username, email: user.email, role, status },
                    accessToken,
                    refreshToken,
                };
    
                res.status(200).json(responseData);
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    ],
    
    createComment: async (req, res) => {
        try {
            const { content, articleId } = req.body;
            const userId = req.user.id;
    
            let existingArticle;
    
            if (articleId) {
                existingArticle = await prisma.article.findUnique({
                    where: {
                        id: parseInt(articleId),
                    },
                });
    
                if (!existingArticle) {
                    return res.status(400).json({ error: 'Invalid Article ID', details: 'Article not found.' });
                }
            }
    
            const newComment = await prisma.comment.create({
                data: {
                    content,
                    userId,
                    articleId: existingArticle
                        ? existingArticle.id  // Use the ID directly
                        : undefined,
                },
            });
    
            res.status(201).json({ message: 'Comment created successfully', newComment });
        } catch (error) {
            console.error('Error creating comment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    
    updateComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const userId = req.user.id

            const existingComment = await prisma.comment.findUnique({
                where: {
                    id: parseInt(commentId),
                },
            });

            if (!existingComment || existingComment.userId !== userId) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const updatedComment = await prisma.comment.update({
                where: {
                    id: parseInt(commentId),
                },
                data: {
                    content,
                },
            });
            res.status(201).json({ message: 'Comment Updated successfully', updatedComment });
        } catch (error) {
            console.error('Error updating user comment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;
            console.log('commentId:', commentId);
            console.log('userId:', userId);
            const parsedCommentId = parseInt(commentId);
    
            const existingComment = await prisma.comment.findUnique({
                where: {
                    id: parsedCommentId,
                },
            });
    
            if (!existingComment || existingComment.userId !== userId) {
                console.error('Comment not found or unauthorized deletion attempt');
                return res.status(404).json({ error: 'Comment not found' });
            }
    
            await prisma.comment.delete({
                where: {
                    id: parsedCommentId,
                },
            });
            console.log(`SUccessfully deleted comment of user id ${commentId}`);
            res.status(201).json({ message: 'Comment Deleted successfully', commentId });
        } catch (error) {
            console.error('Error deleting user comment:', error);
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
    
    };
    

module.exports = userController;
