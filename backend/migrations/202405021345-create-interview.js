'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('interviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            task_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            host: {
                type: Sequelize.STRING,
                allowNull: false
            },
            group_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            cancelled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            hide_interview: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            length: {
                type: Sequelize.NUMERIC,
                allowNull: false
            },
            location: {
                type: Sequelize.STRING,
                allowNull: false
            },
            note: {
                type: Sequelize.STRING
            },
            time: {
                type: Sequelize.DATE
            },
            date: {
                type: Sequelize.DATEONLY
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        // await queryInterface.addConstraint('tasks', {
        //     fields: ['task'],
        //     type: 'foreign key',
        //     name: 'fkey_task_name',
        //     references: {
        //         table: 'tasks',
        //         field: 'task',
        //     },
        //     onDelete: 'RESTRICT',
        //     onUpdate: 'RESTRICT',
        // });

        await queryInterface.addConstraint('user_info', {
            fields: ['username'],
            type: 'foreign key',
            name: 'fkey_username',
            references: {
                table: 'user_info',
                field: 'username',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        });

        await queryInterface.addConstraint('groups', {
            fields: ['group_id'],
            type: 'foreign key',
            name: 'fkey_group_id',
            references: {
                table: 'groups',
                field: 'group_id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('interviews');
    }
};