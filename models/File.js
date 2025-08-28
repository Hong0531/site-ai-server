import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'files',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  engine: 'InnoDB',
  comment: '사용자 파일 테이블'
});

// User와의 관계 설정
File.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(File, { foreignKey: 'userId', as: 'files' });

export default File;
