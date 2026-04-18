const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  validateRegisterRequest,
  validateLoginRequest,
} = require('../validators/authValidators');

router.post('/register', validateRegisterRequest, authController.register);
router.post('/login', validateLoginRequest, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;