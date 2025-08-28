export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('project_logs', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
    action: {
      type: Sequelize.ENUM('created', 'updated', 'deleted', 'published', 'unpublished', 'viewed', 'duplicated'),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    },
    ipAddress: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    userAgent: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // 인덱스 생성
  await queryInterface.addIndex('project_logs', ['projectId', 'createdAt']);
  await queryInterface.addIndex('project_logs', ['userId', 'createdAt']);
  await queryInterface.addIndex('project_logs', ['action', 'createdAt']);
  await queryInterface.addIndex('project_logs', ['createdAt']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('project_logs');
}
