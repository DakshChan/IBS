'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Submission extends Model {
    static associate(models) {
        Submission.belongsTo(models.Group, { foreignKey: 'group_id', as: 'group'});
    }
}

Submission.init({
    submission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    task: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    commit_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_used: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Set the default value to current timestamp
    }
}, {
    sequelize,
    modelName: 'Submission',
    tableName: 'submissions'
});

module.exports = Submission;
