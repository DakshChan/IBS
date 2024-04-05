const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

class User extends Model {
  // If you have any instance methods, you can define them here
  static associate(models) {
    // Define association here
    User.hasMany(models.CourseRole, {
      foreignKey: 'username',
      as: 'CourseRole', // Consistent alias
    });
  }
}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  user_id: {
    primaryKey: false,
    unique: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
  // Add any additional fields as needed
}, {
  sequelize,
  modelName: 'User',
  tableName: 'user_info', // Ensure this matches your actual table name
  timestamps: false // Set to true if you have createdAt and updatedAt columns
});

// Define any associations here. For example:
// User.hasMany(models.SomeOtherModel);

module.exports = User;
