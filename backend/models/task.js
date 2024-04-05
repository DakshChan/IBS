const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Task extends Model {
  static associate(models) {
    Task.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    Task.belongsTo(models.TaskGroup, { foreignKey: 'task_group_id', as: 'taskGroup' });
  }
}

Task.init({
  course_id: DataTypes.INTEGER,
  task: DataTypes.STRING,
  long_name: DataTypes.STRING,
  due_date: DataTypes.DATE,
  weight: DataTypes.INTEGER,
  hidden: DataTypes.BOOLEAN,
  min_member: DataTypes.INTEGER,
  max_member: DataTypes.INTEGER,
  max_token: DataTypes.INTEGER,
  hide_interview: DataTypes.BOOLEAN,

  hide_file: DataTypes.BOOLEAN,
  change_group: DataTypes.BOOLEAN,
  interview_group: DataTypes.STRING,
  task_group_id: DataTypes.INTEGER,
  starter_code_url: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks'
});

module.exports = Task;
