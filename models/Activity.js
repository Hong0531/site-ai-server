import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('project_created', 'project_updated', 'project_published', 'project_unpublished', 'project_deleted', 'project_duplicated', 'file_uploaded', 'file_updated', 'code_updated', 'publication_created', 'publication_archived'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  icon: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: '📝'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'blue'
  }
}, {
  tableName: 'activities',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['projectId', 'createdAt']
    },
    {
      fields: ['type', 'createdAt']
    }
  ]
});

// 활동 타입별 아이콘과 색상 매핑
Activity.getActivityDisplay = function(type) {
  const displayMap = {
    project_created: { icon: '✨', color: 'green' },
    project_updated: { icon: '✏️', color: 'blue' },
    project_published: { icon: '🚀', color: 'purple' },
    project_unpublished: { icon: '⏸️', color: 'orange' },
    project_deleted: { icon: '🗑️', color: 'red' },
    project_duplicated: { icon: '📋', color: 'orange' },
    file_uploaded: { icon: '📁', color: 'teal' },
    file_updated: { icon: '📝', color: 'indigo' },
    code_updated: { icon: '💻', color: 'cyan' },
    publication_created: { icon: '📢', color: 'purple' },
    publication_archived: { icon: '📦', color: 'gray' }
  };
  
  return displayMap[type] || { icon: '📝', color: 'gray' };
};

export default Activity;
