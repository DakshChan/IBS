'use strict';

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');


class TaskGroup extends Model {

  static associate(models) {
    // define association here
    TaskGroup.belongsTo(models.Course, {
      foreignKey: 'course_id',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      as: 'Course'
    });
  }
}


TaskGroup.init({
  task_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: false,
  },
  max_token: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
}, {
  sequelize,
  modelName: 'TaskGroup',
  tableName: 'task_group',
});

module.exports = TaskGroup;