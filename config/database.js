import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true,
      // 추가 인코딩 설정
      multipleStatements: true,
      dateStrings: true,
      timezone: '+09:00'
    },
    // 추가 설정
    timezone: '+09:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function initDB() {
  // 데이터베이스 설정이 없으면 스킵
  if (!process.env.DB_HOST || !process.env.DB_NAME) {
    console.log('⚠️  DB 설정이 없어 데이터베이스 연결을 건너뜁니다.');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');
    
    // 모델 동기화 (테이블 생성)
    try {
      // User 모델 import 및 동기화
      const User = (await import('../models/User.js')).default;
      
      // File 모델 import
      const File = (await import('../models/File.js')).default;
      
      // Project 모델 import
      const Project = (await import('../models/Project.js')).default;
      
      // Activity 모델 import
      const Activity = (await import('../models/Activity.js')).default;
      
      // Publication 모델 import
      const Publication = (await import('../models/Publication.js')).default;
      
      // ProjectLog 모델 import
      const ProjectLog = (await import('../models/ProjectLog.js')).default;
      
      // Template 모델 import
      const Template = (await import('../models/Template.js')).default;
      
      // Like 모델 import
      const Like = (await import('../models/Like.js')).default;
      
      // 기존 테이블이 없으면 순서대로 생성
      try {
        // users 테이블 존재 여부 확인 (테이블명은 소문자 'users')
        await sequelize.query('SELECT 1 FROM users LIMIT 1');
        console.log('✅ 기존 테이블이 존재합니다. 데이터를 유지합니다.');
        
        // Publication 테이블이 없으면 생성
        try {
          await sequelize.query('SELECT 1 FROM publications LIMIT 1');
          console.log('✅ Publications 테이블이 존재합니다.');
        } catch (pubError) {
          console.log('⚠️ Publications 테이블이 없습니다. 새로 생성합니다.');
          await Publication.sync({ force: true });
          console.log('✅ Publications 테이블 생성 완료');
        }
        
        // ProjectLog 테이블이 없으면 생성
        try {
          await sequelize.query('SELECT 1 FROM project_logs LIMIT 1');
          console.log('✅ ProjectLogs 테이블이 존재합니다.');
        } catch (logError) {
          console.log('⚠️ ProjectLogs 테이블이 없습니다. 새로 생성합니다.');
          await ProjectLog.sync({ force: true });
          console.log('✅ ProjectLogs 테이블 생성 완료');
        }
        
        // Template 테이블 처리 (기존 테이블이 있으면 삭제 후 재생성)
        try {
          await sequelize.query('DROP TABLE IF EXISTS templates');
          console.log('⚠️ 기존 Templates 테이블을 삭제했습니다.');
        } catch (dropError) {
          console.log('⚠️ Templates 테이블 삭제 중 오류 (무시):', dropError.message);
        }
        
        try {
          await Template.sync({ force: false });
          console.log('✅ Templates 테이블 생성 완료');
        } catch (templateError) {
          console.log('⚠️ Templates 테이블 생성 오류:', templateError.message);
        }
        
        await sequelize.sync({ force: false });
        
        // 기존 테이블이 있어도 관계 설정은 필요
        console.log('🔄 기존 테이블에 대한 관계 설정을 진행합니다.');
        
        // 관계 설정
        User.hasMany(Project, { foreignKey: 'ownerId', as: 'projects' });
        Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
        
        User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
        Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Project.hasMany(Activity, { foreignKey: 'projectId', as: 'activities' });
        Activity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
        
        // Publication 관계 설정
        User.hasMany(Publication, { foreignKey: 'userId', as: 'publications' });
        Publication.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Project.hasMany(Publication, { foreignKey: 'projectId', as: 'publications' });
        Publication.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
        
        // ProjectLog 관계 설정
        User.hasMany(ProjectLog, { foreignKey: 'userId', as: 'projectLogs' });
        ProjectLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Project.hasMany(ProjectLog, { foreignKey: 'projectId', as: 'projectLogs' });
        ProjectLog.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
        
        // Template 관계 설정
        User.hasMany(Template, { foreignKey: 'userId', as: 'templates' });
        Template.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        // Like 관계 설정
        User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
        Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Template.hasMany(Like, { foreignKey: 'templateId', as: 'likes' });
        Like.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });
        
        console.log('✅ 기존 테이블 관계 설정 완료');
      } catch (tableError) {
        console.log('⚠️ 기존 테이블이 없습니다. 순서대로 새로 생성합니다.');
        
        // 1. User 테이블 먼저 생성 (외래키 참조 없음)
        await User.sync({ force: false });
        console.log('✅ Users 테이블 생성 완료');
        
        // 2. File 테이블 생성
        await File.sync({ force: false });
        console.log('✅ Files 테이블 생성 완료');
        
        // 3. Project 테이블 생성 (User 참조)
        await Project.sync({ force: false });
        console.log('✅ Projects 테이블 생성 완료');
        
        // 4. Activity 테이블 생성 (User, Project 참조)
        await Activity.sync({ force: false });
        console.log('✅ Activities 테이블 생성 완료');
        
        // 5. Publication 테이블 생성 (User, Project 참조)
        await Publication.sync({ force: false });
        console.log('✅ Publications 테이블 생성 완료');
        
        // 6. ProjectLog 테이블 생성 (User, Project 참조)
        await ProjectLog.sync({ force: false });
        console.log('✅ ProjectLogs 테이블 생성 완료');
        
        // 7. Template 테이블 생성 (User 참조)
        await Template.sync({ force: false });
        console.log('✅ Templates 테이블 생성 완료');
        
        // 8. Like 테이블 생성 (User, Template 참조)
        await Like.sync({ force: false });
        console.log('✅ Likes 테이블 생성 완료');
        
        // 8. 관계 설정
        User.hasMany(Project, { foreignKey: 'ownerId', as: 'projects' });
        Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
        
        User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
        Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Project.hasMany(Activity, { foreignKey: 'projectId', as: 'activities' });
        Activity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
        
        // Publication 관계 설정
        User.hasMany(Publication, { foreignKey: 'userId', as: 'publications' });
        Publication.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Project.hasMany(Publication, { foreignKey: 'projectId', as: 'publications' });
        Publication.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
        
        // ProjectLog 관계 설정
        User.hasMany(ProjectLog, { foreignKey: 'userId', as: 'user' });
        ProjectLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Project.hasMany(ProjectLog, { foreignKey: 'projectId', as: 'projectLogs' });
        ProjectLog.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
        
        // Template 관계 설정
        User.hasMany(Template, { foreignKey: 'userId', as: 'templates' });
        Template.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        // Like 관계 설정
        User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
        Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        
        Template.hasMany(Like, { foreignKey: 'templateId', as: 'likes' });
        Like.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });
        
        console.log('✅ 모델 관계 설정 완료');
      }
      
      console.log('✅ 데이터베이스 테이블 동기화 완료');
    } catch (syncError) {
      console.error('⚠️  테이블 동기화 실패:', syncError);
    }
  } catch (error) {
    console.error('❌ DB 연결 실패:', error);
    console.log('⚠️  데이터베이스 없이 애플리케이션을 계속 실행합니다.');
    // process.exit(1); // DB 연결 실패해도 앱 종료하지 않음
  }
} 