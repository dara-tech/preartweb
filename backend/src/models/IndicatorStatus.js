const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IndicatorStatus = sequelize.define('IndicatorStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  indicator_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  indicator_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    comment: '1 = Active, 0 = Inactive'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'indicator_status',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['indicator_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = IndicatorStatus;

