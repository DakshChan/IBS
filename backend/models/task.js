const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Task extends Model {
  static associate(models) {
    Task.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    Task.belongsTo(models.TaskGroup, { foreignKey: 'task_group_id', as: 'taskGroup' });
  }
}

Task.init({
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  task: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  long_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  min_member: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  max_member: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  max_token: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hide_interview: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hide_file: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  change_group: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  interview_group: {
    type: DataTypes.STRING,
    allowNull: true
  },
  task_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  starter_code_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks'
});

module.exports = Task;
