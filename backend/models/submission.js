'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../helpers/database');

class Submission extends Model {
    static associate(models) {
        Submission.belongsTo(models.Group, { foreignKey: 'group_id', as: 'group' });
        Submission.belongsTo(models.Task, {
            foreignKey: 'task',
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        });
        
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
        references: {
            model: 'tasks',
            key: 'id'
        }
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
            key: 'group_id'
        }
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
    tableName: 'submissions',
    timestamps: false
});

module.exports = Submission;
