import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  templateId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      theme: 'default',
      layout: 'standard'
    }
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      views: 0,
      edits: 0,
      lastPublished: null
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    {
      fields: ['ownerId', 'createdAt']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isPublic']
    }
  ]
});

// 가상 필드: 프로젝트 URL
Project.prototype.getUrl = function() {
  return `/projects/${this.id}`;
};

// Publication과의 관계 설정 (hasMany)
Project.associate = function(models) {
  if (models.Publication) {
    Project.hasMany(models.Publication, { 
      foreignKey: 'projectId', 
      as: 'publications',
      onDelete: 'CASCADE'
    });
  }
};

export default Project;
