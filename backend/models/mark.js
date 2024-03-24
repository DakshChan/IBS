const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Mark extends Model {
  static associate(models) {
    Mark.belongsTo(models.Criteria, { foreignKey: 'criteria_id', as: 'criteria' });
    Mark.belongsTo(models.User, { foreignKey: 'username', as: 'user' });
    Mark.belongsTo(models.Task, { foreignKey: 'task_name', as: 'task' });
  }
}

Mark.init({
  mark: {
    type: DataTypes.NUMERIC,
    allowNull: false,
  },
  old_mark: {
    type: DataTypes.NUMERIC,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Mark',
  tableName: 'marks'
});

module.exports = Mark;