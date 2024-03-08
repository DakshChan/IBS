const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Criteria extends Model {
  static associate(models) {
    Criteria.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  }
}

Criteria.init({
  criteria: DataTypes.STRING,
  total: DataTypes.NUMERIC,
  task_id: DataTypes.INTEGER,
  description: DataTypes.TEXT,
}, {
  sequelize,
  modelName: 'Criteria',
  tableName: 'criteria'
});

module.exports = Criteria;
