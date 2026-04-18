const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const activityController = require('../controllers/activityController');
const { validateActivityRequest } = require('../validators/activityValidators');

router.get('/', authMiddleware, activityController.getActivities);
router.post('/', authMiddleware, validateActivityRequest, activityController.createActivity);

module.exports = router;