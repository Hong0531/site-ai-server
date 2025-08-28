import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '템플릿 이름'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '템플릿 설명'
  },
  htmlContent: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: 'HTML 코드 내용'
  },
  cssContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'CSS 코드 내용'
  },
  jsContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'JavaScript 코드 내용'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '템플릿 카테고리'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '템플릿 태그 배열'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '공개 여부'
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '썸네일 이미지 URL'
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0.0',
    comment: '템플릿 버전'
  },
          downloadCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: '다운로드 횟수'
        },
                viewCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: '조회 횟수'
        },
        likeCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: '좋아요 수'
        },

    status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    comment: '템플릿 상태'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '템플릿 생성자 ID',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'templates',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    {
      name: 'idx_templates_name',
      fields: ['name']
    },
    {
      name: 'idx_templates_category',
      fields: ['category']
    },
    {
      name: 'idx_templates_status',
      fields: ['status']
    }
  ]
});

export default Template;
