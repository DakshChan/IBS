'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Group extends Model {
  static associate(models) {
    Group.belongsTo(models.Task, {
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT'
    }); // foreignKey will default to the primary key of Task model
  }
}

Group.init({
  group_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  extension: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gitlab_group_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gitlab_project_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gitlab_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Group',
  tableName: 'groups'
});


module.exports = Group;