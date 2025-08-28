import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Publication = sequelize.define('Publication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '게시 시점의 프로젝트 내용 (HTML 코드, 설정 등)'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    allowNull: false,
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '게시 관련 추가 정보 (태그, 카테고리, 공개 설정 등)'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'publications',
  timestamps: true,
  indexes: [
    {
      fields: ['projectId', 'publishedAt']
    },
    {
      fields: ['userId', 'publishedAt']
    },
    {
      fields: ['status', 'publishedAt']
    },
    {
      fields: ['publishedAt']
    }
  ]
});

// 가상 필드: 게시 URL
Publication.prototype.getUrl = function() {
  return `/publications/${this.id}`;
};

// 가상 필드: 프로젝트 URL
Publication.prototype.getProjectUrl = function() {
  return `/projects/${this.projectId}`;
};

// Project와의 관계 설정 (belongsTo)
Publication.associate = function(models) {
  if (models.Project) {
    Publication.belongsTo(models.Project, { 
      foreignKey: 'projectId', 
      as: 'project',
      onDelete: 'CASCADE'
    });
  }
  if (models.User) {
    Publication.belongsTo(models.User, { 
      foreignKey: 'userId', 
      as: 'user',
      onDelete: 'CASCADE'
    });
  }
};

export default Publication;
