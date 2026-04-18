const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const metricController = require('../controllers/metricController');

router.get('/', authMiddleware, metricController.getMetrics);
router.post('/', authMiddleware, metricController.createMetric);

module.exports = router;