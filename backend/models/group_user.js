const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class GroupUser extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    GroupUser.belongsTo(models.Group, {
      foreignKey: "group_id",
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });

    GroupUser.belongsTo(models.Task, {
      foreignKey: "task_id",
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT'
    });

    GroupUser.belongsTo(models.User, {
      foreignKey: "username",
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT'
    })
  }
}

GroupUser.init({
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'pending'),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'GroupUser',
  tableName: 'group_user',
  timestamps: false
});

module.exports = GroupUser;