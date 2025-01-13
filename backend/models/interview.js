const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Interview extends Model {
  static associate(models) {
    Interview.belongsTo(models.Task, { foreignKey: 'task_id', targetKey: 'id' });
    Interview.belongsTo(models.User, { foreignKey: 'host', targetKey: 'username' });
    Interview.belongsTo(models.Group, { foreignKey: 'group_id' });
  }
}

Interview.init({
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'task',
      key: 'id'
    }
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true // group_id is not necessary to schedule an interview
  },
  cancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hide_interview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  length: {
    type: DataTypes.NUMERIC,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  note: {
    type: DataTypes.STRING
  },
  time: {
    type: DataTypes.TIME
  },
  date: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Interview',
  tableName: 'interviews',
  timestamps: false
});

module.exports = Interview;