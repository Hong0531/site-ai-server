import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ProjectLog = sequelize.define('ProjectLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true, // 프로젝트 삭제 시에도 로그를 남기기 위해 nullable
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
  action: {
    type: DataTypes.ENUM('created', 'updated', 'deleted', 'published', 'unpublished', 'viewed', 'duplicated'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 지원
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'project_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['projectId', 'createdAt']
    },
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['action', 'createdAt']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Project와의 관계 설정
ProjectLog.associate = function(models) {
  if (models.Project) {
    ProjectLog.belongsTo(models.Project, { 
      foreignKey: 'projectId', 
      as: 'project',
      onDelete: 'SET NULL' // 프로젝트 삭제 시 로그는 유지
    });
  }
  
  if (models.User) {
    ProjectLog.belongsTo(models.User, { 
      foreignKey: 'userId', 
      as: 'user',
      onDelete: 'CASCADE'
    });
  }
};

export default ProjectLog;
