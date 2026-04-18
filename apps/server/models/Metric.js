const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Metric = sequelize.define(
  'Metric',
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
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
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
    tableName: 'metrics',
    timestamps: true,
  }
);

User.hasMany(Metric, { foreignKey: 'userId', as: 'metrics' });
Metric.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Metric;