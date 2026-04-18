const Metric = require('../models/Metric');

exports.getMetrics = async (req, res) => {
  try {
    const metrics = await Metric.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics',
    });
  }
};

exports.createMetric = async (req, res) => {
  try {
    const { id, dateISO, type, value, unit, notes, createdAt } = req.body;

    if (!id || !dateISO || !type || value == null || !unit || !createdAt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required metric fields',
      });
    }

    const metric = await Metric.create({
      id,
      dateISO,
      type,
      value,
      unit,
      notes: notes || '',
      createdAtClient: createdAt,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: metric,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create metric',
    });
  }
};