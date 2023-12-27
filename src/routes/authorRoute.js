const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.post('/create-article', authorController.createArticle);

module.exports = router;
