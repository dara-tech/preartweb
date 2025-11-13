const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InfantVisit = sequelize.define('InfantVisit', {
  clinicId: {
    type: DataTypes.STRING(10),
    allowNull: false,
    primaryKey: true
  },
  visitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  typeVisit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sex: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  pulse: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  respiration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  head: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  malnutrition: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  wh: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bcg: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  opv: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  measles: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  vaccinOther: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  feeding: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dna: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dbsDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  sentDbsDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  receiveDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  result: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  resultDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  antibody: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  antibodyDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  outcome: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  outcomeDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  visitId: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  pcrPos: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  antiaffeeding: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dnapre: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'tblevmain',
  timestamps: false
});

module.exports = InfantVisit;
