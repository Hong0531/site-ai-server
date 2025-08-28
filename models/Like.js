import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '좋아요를 누른 사용자 ID',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  templateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '좋아요를 받은 템플릿 ID',
    references: {
      model: 'templates',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'likes',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    {
      name: 'idx_likes_user_template',
      unique: true,
      fields: ['userId', 'templateId']
    },
    {
      name: 'idx_likes_template_id',
      fields: ['templateId']
    },
    {
      name: 'idx_likes_user_id',
      fields: ['userId']
    }
  ]
});

export default Like;
