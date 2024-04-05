const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Criteria extends Model {
  static associate(models) {
    Criteria.belongsTo(models.Task, { foreignKey: 'task_name', as: 'task' });
  }
}

Criteria.init({
  // id is automatically defined by Sequelize
  criteria: DataTypes.STRING,
  total: DataTypes.NUMERIC,
  description: DataTypes.TEXT,
}, {
  sequelize,
  modelName: 'Criteria',
  tableName: 'criteria'
});

module.exports = Criteria;
