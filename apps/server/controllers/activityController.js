const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
    });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { id, dateISO, type, duration, notes, createdAt } = req.body;

    if (!id || !dateISO || !type || duration == null || !createdAt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required activity fields',
      });
    }

    const activity = await Activity.create({
      id,
      dateISO,
      type,
      duration,
      notes: notes || '',
      createdAtClient: createdAt,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create activity',
    });
  }
};