const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

class Course extends Model {
  static associate(models) {
    // Define association here
    Course.hasMany(models.CourseRole, {
      foreignKey: 'course_id',
      as: 'CourseRole', // Consistent alias
    });
    Course.hasMany(models.Task, {
      foreignKey: 'id',
      as: 'Task', // Consistent alias
    });
  }

  // Define any static methods if needed
  static async getAllCourses() {
    return await this.findAll({
      order: [['course_id', 'ASC']]
    });
  }
}

Course.init({
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  course_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course_session: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gitlab_group_id: {
    type: DataTypes.STRING,
    unique: true,
  },
  default_token_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  token_length: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  sequelize,
  modelName: 'Course',
  tableName: 'courses', // Ensure this matches your actual table name
  timestamps: false, // Set to true if you have createdAt and updatedAt columns
  uniqueKeys: {
    UniqueCourseCodeAndSession: {
      fields: ['course_code', 'course_session']
    }
  }
});


module.exports = Course;
