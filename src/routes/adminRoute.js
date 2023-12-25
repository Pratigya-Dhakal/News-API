const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/create-category', adminController.createCategory);
router.post('/create-user', adminController.createUser);
router.get('/view-posts', adminController.viewPosts);
router.get('/get-users', adminController.getAllUsers);
router.delete('/delete-comment/:commentId', adminController.deleteComment);
router.delete('/delete-post/:articleId', adminController.deletePost);
router.patch('/change-author-status/:authorId', adminController.changeAuthorStatus);
router.patch('/change-user-status/:userId', adminController.changeUserStatus);
router.patch('/change-category-status/:categoryId', adminController.changeCategoryStatus);
router.patch('/update-password/:userId', adminController.updatePassword);

module.exports = router;
