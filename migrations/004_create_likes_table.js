'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 인덱스 생성
    await queryInterface.addIndex('likes', ['userId', 'templateId'], {
      unique: true,
      name: 'idx_likes_user_template'
    });

    await queryInterface.addIndex('likes', ['templateId'], {
      name: 'idx_likes_template_id'
    });

    await queryInterface.addIndex('likes', ['userId'], {
      name: 'idx_likes_user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  }
};
