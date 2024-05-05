const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Interview extends Model {
  static associate(models) {
    Interview.belongsTo(models.Task, { foreignKey: 'task_name', targetKey: 'task' });
    Interview.belongsTo(models.User, { foreignKey: 'host', targetKey: 'username' });
    Interview.belongsTo(models.Group, { foreignKey: 'group_id' });
  }
}

Interview.init({
    // interview_id: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true,
    //   autoIncrement: true
    // },
    task_name: {
      type: DataTypes.STRING,
      allowNull: false
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