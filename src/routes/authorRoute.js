const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { authenticateAuthor } = require('../middleware/authorAuth.middlewere');

router.post('/login', authorController.loginAuthor);

router.use(authenticateAuthor);
// create article
router.post('/create-article', authorController.createArticle);
// get author post only
router.get('/get-post', authorController.getArticles);
// get all author posts
router.get('/view-all-posts', authorController.viewALLPosts);
// update article
router.put('/update-article/:id', authorController.updateArticle);
// delete article
router.delete('/delete-article/:id', authorController.deleteArticle);
// update password
router.put('/update-password', authorController.updatePassword);

module.exports = router;
