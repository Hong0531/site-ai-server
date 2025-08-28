export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('publications', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    version: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    content: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '게시 시점의 프로젝트 내용 (HTML 코드, 설정 등)'
    },
    publishedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    status: {
      type: Sequelize.ENUM('active', 'archived', 'deleted'),
      allowNull: false,
      defaultValue: 'active'
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '게시 관련 추가 정보 (태그, 카테고리, 공개 설정 등)'
    },
    viewCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    downloadCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  // 인덱스 생성
  await queryInterface.addIndex('publications', ['projectId', 'publishedAt']);
  await queryInterface.addIndex('publications', ['userId', 'publishedAt']);
  await queryInterface.addIndex('publications', ['status', 'publishedAt']);
  await queryInterface.addIndex('publications', ['publishedAt']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('publications');
}
