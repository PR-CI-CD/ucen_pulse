const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const suggestionController = require('../controllers/suggestionController');

router.get('/daily', authMiddleware, suggestionController.getDailySuggestion);

module.exports = router;