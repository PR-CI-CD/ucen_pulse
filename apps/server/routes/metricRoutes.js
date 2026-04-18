const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const metricController = require('../controllers/metricController');
const { validateMetricRequest } = require('../validators/metricValidators');

router.get('/', authMiddleware, metricController.getMetrics);
router.post('/', authMiddleware, validateMetricRequest, metricController.createMetric);

module.exports = router;