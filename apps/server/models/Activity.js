const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Activity = sequelize.define(
  'Activity',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    dateISO: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAtClient: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: 'activities',
    timestamps: true,
  }
);

User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Activity;