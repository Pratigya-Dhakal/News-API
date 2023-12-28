const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/auth.middlewere');
const { validateLogin } = require('../utils/validate-login');
router.post('/login',adminController.loginAdmin);

// Apply authenticateUser middleware to all routes defined after this point
router.use(authenticateUser);

//category 
router.post('/create-category', adminController.createCategory);
router.delete('/delete-category/:categoryId', adminController.deleteCategory);
router.patch('/change-category-status/:categoryId', adminController.changeCategoryStatus);
router.get('/get-category', adminController.getAllCategory);

// user
router.post('/create-user', adminController.createUser);
router.patch('/change-user-status/:userId', adminController.changeUserStatus);
router.get('/get-users', adminController.getAllUsers);
router.patch('/update-password/:userId', adminController.updatePassword);

//post
router.get('/view-posts', adminController.viewPosts);
router.delete('/delete-post/:articleId', adminController.deletePost);

//comment
router.delete('/delete-comment/:commentId', adminController.deleteComment);

module.exports = router;
