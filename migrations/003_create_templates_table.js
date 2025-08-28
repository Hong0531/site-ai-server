export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('templates', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: '템플릿 이름'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '템플릿 설명'
    },
    htmlContent: {
      type: Sequelize.TEXT('long'),
      allowNull: false,
      comment: 'HTML 코드 내용'
    },
    cssContent: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'CSS 코드 내용'
    },
    jsContent: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'JavaScript 코드 내용'
    },
    category: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '템플릿 카테고리'
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '템플릿 태그 배열'
    },
    isPublic: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: '공개 여부'
    },
    thumbnail: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '썸네일 이미지 URL'
    },
    version: {
      type: Sequelize.STRING(20),
      defaultValue: '1.0.0',
      comment: '템플릿 버전'
    },
            downloadCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: '다운로드 횟수'
        },
        viewCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: '조회 횟수'
        },
        likeCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: '좋아요 수'
        },
    status: {
      type: Sequelize.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
      comment: '템플릿 상태'
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: '템플릿 생성자 ID'
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
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  // 인덱스 생성
  await queryInterface.addIndex('templates', ['name'], {
    name: 'idx_templates_name'
  });
  
  await queryInterface.addIndex('templates', ['category'], {
    name: 'idx_templates_category'
  });
  
  await queryInterface.addIndex('templates', ['status'], {
    name: 'idx_templates_status'
  });
  
  await queryInterface.addIndex('templates', ['userId'], {
    name: 'idx_templates_user_id'
  });
  
  await queryInterface.addIndex('templates', ['likeCount'], {
    name: 'idx_templates_like_count'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('templates');
}
