const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

class CourseRole extends Model {
  static associate(models) {
    CourseRole.belongsTo(models.Course, {
      foreignKey: 'course_id',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      as: 'Course', // Consistent alias
    });
    // Define associations here
    CourseRole.belongsTo(models.User, {
      foreignKey: 'username',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      as: 'User',
    });
  }

  // Define any static methods if needed
}

CourseRole.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token_count: {
    type: DataTypes.INTEGER,
    allowNull: true // since course role can be more than a student
  }
}, {
  sequelize,
  modelName: 'CourseRole',
  tableName: 'course_role',
  timestamps: false
},

);

module.exports = CourseRole;
