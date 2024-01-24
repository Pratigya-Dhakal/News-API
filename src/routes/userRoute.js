const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/user.middlewere');


router.post('/login', userController.loginUser);

router.use(authenticateUser);

router.post('/comment', userController.createComment);
router.patch('/update-comment/:commentId', userController.updateComment);
router.put('/update-password', userController.updatePassword);
router.delete('/delete-comment/:commentId', userController.deleteComment);


module.exports = router;
