import Router from 'koa-router';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import Publication from '../models/Publication.js';
import { sequelize } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { createZipArchive } from '../utils/zipUtils.js';
import ProjectLogger from '../utils/projectLogger.js';

const router = new Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 프로젝트 고유 ID
 *         name:
 *           type: string
 *           description: 프로젝트 이름
 *         description:
 *           type: string
 *           description: 프로젝트 설명
 *         templateId:
 *           type: string
 *           description: 템플릿 ID
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: 프로젝트 상태
 *         ownerId:
 *           type: integer
 *           description: 소유자 ID
 *         settings:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               description: 테마 설정
 *             layout:
 *               type: string
 *               description: 레이아웃 설정
 *         stats:
 *           type: object
 *           properties:
 *             views:
 *               type: number
 *               description: 조회수
 *             edits:
 *               type: number
 *               description: 수정 횟수
 *             lastPublished:
 *               type: string
 *               format: date-time
 *               description: 마지막 발행일
 *         isPublic:
 *           type: boolean
 *           description: 공개 여부
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *     
 *     ProjectCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: 프로젝트 이름
 *         description:
 *           type: string
 *           description: 프로젝트 설명
 *         templateId:
 *           type: string
 *           description: 템플릿 ID
 *     
 *     ProjectUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 프로젝트 이름
 *         description:
 *           type: string
 *           description: 프로젝트 설명
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: 프로젝트 상태
 *         isPublic:
 *           type: boolean
 *           description: 공개 여부
 *         settings:
 *           type: object
 *           description: 설정 객체
 *     
 *     Publication:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 게시 고유 ID
 *         projectId:
 *           type: integer
 *           description: 프로젝트 ID
 *         userId:
 *           type: integer
 *           description: 게시한 사용자 ID
 *         version:
 *           type: integer
 *           description: 게시 버전 (v1, v2, v3...)
 *         title:
 *           type: string
 *           description: 게시 제목
 *         description:
 *           type: string
 *           description: 게시 설명
 *         content:
 *           type: object
 *           properties:
 *             htmlCode:
 *               type: string
 *               description: 게시 시점의 HTML 코드
 *             settings:
 *               type: object
 *               description: 게시 시점의 프로젝트 설정
 *             templateId:
 *               type: string
 *               description: 템플릿 ID
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: 게시 일시
 *         status:
 *           type: string
 *           enum: [active, archived, deleted]
 *           description: 게시 상태
 *         metadata:
 *           type: object
 *           properties:
 *             projectStatus:
 *               type: string
 *               description: 게시 시점의 프로젝트 상태
 *             isPublic:
 *               type: boolean
 *               description: 공개 여부
 *             theme:
 *               type: string
 *               description: 테마 설정
 *             layout:
 *               type: string
 *               description: 레이아웃 설정
 *         viewCount:
 *           type: integer
 *           description: 조회수
 *         downloadCount:
 *           type: integer
 *           description: 다운로드 수
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *     
 *     PublicationListResponse:
 *       type: object
 *       properties:
 *         publications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Publication'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               description: 현재 페이지
 *             limit:
 *               type: integer
 *               description: 페이지당 항목 수
 *             total:
 *               type: integer
 *               description: 전체 항목 수
 *             totalPages:
 *               type: integer
 *               description: 전체 페이지 수
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: 사용자의 프로젝트 전체 목록 조회
 *     description: 로그인한 사용자의 프로젝트 전체 목록을 조회합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로젝트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 *   
 *   post:
 *     summary: 새 프로젝트 생성
 *     description: 템플릿을 기반으로 새 프로젝트를 생성합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCreate'
 *     responses:
 *       201:
 *         description: 프로젝트 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects - 사용자의 프로젝트 전체 목록 조회
router.get('/', authenticateToken, async (ctx) => {
  try {
    const projects = await Project.findAll({ 
      where: { ownerId: ctx.state.user.id },
      attributes: ['id', 'name', 'description', 'status', 'createdAt', 'updatedAt', 'stats', 'isPublic'],
      order: [['updatedAt', 'DESC']]
    });
    
    ctx.body = projects;
  } catch (error) {
    console.error('프로젝트 목록 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 목록을 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/publications:
 *   get:
 *     summary: 게시된 프로젝트 목록 조회
 *     description: 모든 사용자가 게시한 프로젝트 목록을 조회합니다. (인증 불필요)
 *     tags: [Publications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (제목, 설명)
 *     responses:
 *       200:
 *         description: 게시된 프로젝트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicationListResponse'
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/publications - 게시된 프로젝트 목록 조회 (인증 불필요)
router.get('/publications', async (ctx) => {
  try {
    const { page = 1, limit = 20, search = '' } = ctx.query;
    const offset = (page - 1) * limit;
    
    let whereClause = { status: 'active' };
    
    if (search) {
      whereClause = {
        ...whereClause,
        [sequelize.Op.or]: [
          { title: { [sequelize.Op.like]: `%${search}%` } },
          { description: { [sequelize.Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const { count, rows: publications } = await Publication.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'projectId', 'userId', 'version', 'title', 'description', 
        'publishedAt', 'status', 'metadata', 'viewCount', 'downloadCount',
        'createdAt', 'updatedAt'
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    ctx.body = {
      publications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(page),
        total: count,
        totalPages
      }
    };
  } catch (error) {
    console.error('게시된 프로젝트 목록 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '게시된 프로젝트 목록을 불러올 수 없습니다.' };
  }
});



// POST /api/projects - 새 프로젝트 생성
router.post('/', authenticateToken, async (ctx) => {
  try {
    console.log('프로젝트 생성 요청:', ctx.request.body, '사용자:', ctx.state.user.id);
    
    const { templateId, name, description } = ctx.request.body;
    
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: '프로젝트 이름은 필수입니다.' };
      return;
    }
    
    const projectData = {
      name,
      description: description || '',
      templateId,
      ownerId: ctx.state.user.id,
      settings: {
        theme: 'default',
        layout: 'standard',
        htmlCode: '' // HTML 코드를 저장할 필드 초기화
      }
    };
    
    console.log('생성할 프로젝트 데이터:', projectData);
    
    const project = await Project.create(projectData);
    
    console.log('생성된 프로젝트:', { id: project.id, name: project.name, settings: project.settings });
    
    // 활동 로그 생성
    await Activity.create({
      userId: ctx.state.user.id,
      projectId: project.id,
      type: 'project_created',
      description: `새 프로젝트 "${name}"을 생성했습니다.`,
      metadata: { templateId }
    });
    
    // 프로젝트 로그 생성
    await ProjectLogger.logProjectCreated(
      ctx.state.user.id,
      project.id,
      name,
      templateId,
      ctx.ip,
      ctx.get('User-Agent')
    );
    
    ctx.status = 201;
    ctx.body = project;
    
    console.log('프로젝트 생성 성공');
  } catch (error) {
    console.error('프로젝트 생성 오류:', error);
    console.error('오류 스택:', error.stack);
    ctx.status = 500;
    ctx.body = { error: '프로젝트를 생성할 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: 특정 프로젝트 상세 정보 조회
 *     description: 프로젝트 ID로 특정 프로젝트의 상세 정보를 조회합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 프로젝트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 *   
 *   put:
 *     summary: 프로젝트 메타데이터 업데이트
 *     description: 프로젝트의 이름, 설명, 상태 등을 업데이트합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectUpdate'
 *     responses:
 *       200:
 *         description: 프로젝트 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 *   
 *   delete:
 *     summary: 프로젝트 삭제
 *     description: 프로젝트를 완전히 삭제합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 프로젝트 삭제 성공
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/:id - 특정 프로젝트 상세 정보 조회
router.get('/:id', authenticateToken, async (ctx) => {
  try {
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    // 조회수 증가
    const stats = project.stats || {};
    stats.views = (stats.views || 0) + 1;
    await project.update({ stats });
    
    // 프로젝트 로그 생성
    await ProjectLogger.logProjectViewed(
      ctx.state.user.id,
      project.id,
      project.name,
      ctx.ip,
      ctx.get('User-Agent')
    );
    
    ctx.body = project;
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트를 불러올 수 없습니다.' };
  }
});

// PUT /api/projects/:id - 프로젝트 메타데이터 업데이트
router.put('/:id', authenticateToken, async (ctx) => {
  try {
    const { name, description, status, isPublic, settings, htmlCode } = ctx.request.body;
    
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    // 업데이트할 필드들
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    // settings와 htmlCode 처리
    if (settings || htmlCode !== undefined) {
      const currentSettings = project.settings || {};
      updateData.settings = { ...currentSettings };
      
      if (settings) {
        updateData.settings = { ...updateData.settings, ...settings };
      }
      
      if (htmlCode !== undefined) {
        updateData.settings.htmlCode = htmlCode;
      }
    }
    
    // 수정 횟수 증가
    const stats = project.stats || {};
    stats.edits = (stats.edits || 0) + 1;
    updateData.stats = stats;
    
    await project.update(updateData);
    
    // 활동 로그 생성
    await Activity.create({
      userId: ctx.state.user.id,
      projectId: project.id,
      type: 'project_updated',
      description: `프로젝트 "${project.name}"을 수정했습니다.`,
      metadata: { updatedFields: Object.keys(ctx.request.body) }
    });
    
    // 프로젝트 로그 생성
    await ProjectLogger.logProjectUpdated(
      ctx.state.user.id,
      project.id,
      project.name,
      Object.keys(ctx.request.body),
      ctx.ip,
      ctx.get('User-Agent')
    );
    
    ctx.body = project;
  } catch (error) {
    console.error('프로젝트 업데이트 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트를 업데이트할 수 없습니다.' };
  }
});

// DELETE /api/projects/:id - 프로젝트 삭제
router.delete('/:id', authenticateToken, async (ctx) => {
  try {
    const projectId = ctx.params.id;
    const userId = ctx.state.user.id;
    
    console.log(`프로젝트 삭제 시도: ID ${projectId}, 사용자 ID ${userId}`);
    
    // 프로젝트 존재 여부 및 소유권 확인
    const project = await Project.findOne({
      where: { id: projectId, ownerId: userId }
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없거나 삭제 권한이 없습니다.' };
      return;
    }
    
    console.log(`프로젝트 상태: ${project.status}`);
    
    // 게시된 프로젝트인지 확인
    const publications = await Publication.findAll({
      where: { projectId: projectId }
    });
    
    console.log(`연관된 Publication 수: ${publications.length}`);
    
    if (publications.length > 0) {
      ctx.status = 400;
      ctx.body = { 
        error: '게시된 프로젝트는 삭제할 수 없습니다. 먼저 게시를 취소해주세요.',
        hasPublications: true,
        publicationCount: publications.length,
        projectId: projectId,
        projectStatus: project.status
      };
      return;
    }
    
    // 트랜잭션으로 안전하게 삭제
    await sequelize.transaction(async (t) => {
      console.log(`트랜잭션 시작: projectId ${projectId}`);
      
      // 1. Activity 삭제
      const activityResult = await Activity.destroy({
        where: { projectId: projectId },
        transaction: t
      });
      console.log(`Activity 삭제 완료: ${activityResult}개`);
      
      // 2. ProjectLogs 직접 SQL로 삭제 (중요!)
      try {
        const [logResult] = await sequelize.query(
          'DELETE FROM project_logs WHERE projectId = ?',
          {
            replacements: [projectId],
            transaction: t,
            type: sequelize.QueryTypes.DELETE
          }
        );
        console.log(`ProjectLogs 삭제 완료: projectId ${projectId}, 결과:`, logResult);
      } catch (logError) {
        console.error('ProjectLogs 삭제 실패:', logError.message);
        // ProjectLogs 삭제 실패해도 계속 진행
      }
      
      // 3. 기타 관련 테이블들도 확인하여 삭제
      try {
        const [fileResult] = await sequelize.query(
          'DELETE FROM files WHERE projectId = ?',
          {
            replacements: [projectId],
            transaction: t,
            type: sequelize.QueryTypes.DELETE
          }
        );
        console.log(`Files 삭제 완료: projectId ${projectId}, 결과:`, fileResult);
      } catch (fileError) {
        console.warn('Files 삭제 실패 (무시됨):', fileError.message);
      }
      
      // 4. 프로젝트 삭제
      console.log(`프로젝트 삭제 시도: ${projectId}`);
      await project.destroy({ transaction: t });
      console.log(`프로젝트 삭제 완료: ${projectId}`);
    });
    
    console.log(`프로젝트 ${projectId} 삭제 완료`);
    
    ctx.body = {
      success: true,
      message: '프로젝트가 성공적으로 삭제되었습니다.'
    };
    
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error);
    
    // 외래 키 제약 조건 오류인 경우
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('외래 키 제약 조건 오류 상세:', {
        table: error.table,
        constraint: error.index,
        fields: error.fields,
        value: error.value
      });
      
      ctx.status = 400;
      ctx.body = { 
        error: `프로젝트와 관련된 데이터가 있어 삭제할 수 없습니다. (${error.table} 테이블의 ${error.constraint} 제약 조건 위반)`,
        constraintError: true,
        table: error.table,
        constraint: error.index
      };
    } else {
      ctx.status = 500;
      ctx.body = { 
        error: '프로젝트 삭제 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
});

/**
 * @swagger
 * /api/projects/{id}/duplicate:
 *   post:
 *     summary: 프로젝트 복제
 *     description: 동일한 내용을 가진 프로젝트를 복제합니다. 이름에 "(복제)"가 추가됩니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 원본 프로젝트 ID
 *     responses:
 *       201:
 *         description: 프로젝트 복제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// POST /api/projects/:id/duplicate - 프로젝트 복제
router.post('/:id/duplicate', authenticateToken, async (ctx) => {
  try {
    const originalProject = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    if (!originalProject) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    const duplicatedProject = await Project.create({
      name: `${originalProject.name} (복제)`,
      description: originalProject.description,
      templateId: originalProject.templateId,
      ownerId: ctx.state.user.id,
      settings: originalProject.settings,
      isPublic: false,
      status: 'draft'
    });
    
    // 활동 로그 생성
    await Activity.create({
      userId: ctx.state.user.id,
      projectId: duplicatedProject.id,
      type: 'project_duplicated',
      description: `프로젝트 "${originalProject.name}"을 복제했습니다.`,
      metadata: { originalProjectId: ctx.params.id }
    });
    
    // 프로젝트 로그 생성
    await ProjectLogger.logProjectDuplicated(
      ctx.state.user.id,
      duplicatedProject.id,
      duplicatedProject.name,
      ctx.params.id,
      ctx.ip,
      ctx.get('User-Agent')
    );
    
    ctx.status = 201;
    ctx.body = duplicatedProject;
  } catch (error) {
    console.error('프로젝트 복제 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트를 복제할 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/{id}/publish:
 *   post:
 *     summary: 프로젝트 발행
 *     description: 프로젝트 상태를 published로 변경하고 마지막 발행일을 업데이트합니다.
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 프로젝트 발행 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *                 publication:
 *                   $ref: '#/components/schemas/Publication'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// POST /api/projects/:id/publish - 프로젝트 발행
router.post('/:id/publish', authenticateToken, async (ctx) => {
  try {
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    // 기존 게시 확인
    let publication = await Publication.findOne({
      where: { projectId: project.id }
    });
    
    if (publication) {
      // 기존 게시가 있으면 업데이트
      await publication.update({
        title: project.name,
        description: project.description,
        content: {
          htmlCode: project.settings?.htmlCode || '',
          settings: project.settings || {},
          templateId: project.templateId
        },
        publishedAt: new Date(),
        metadata: {
          projectStatus: project.status,
          isPublic: project.isPublic,
          theme: project.settings?.theme || 'default',
          layout: project.settings?.layout || 'standard'
        }
      });
    } else {
      // 새로 게시
      publication = await Publication.create({
        projectId: project.id,
        userId: ctx.state.user.id,
        version: 1,
        title: project.name,
        description: project.description,
        content: {
          htmlCode: project.settings?.htmlCode || '',
          settings: project.settings || {},
          templateId: project.templateId
        },
        publishedAt: new Date(),
        metadata: {
          projectStatus: project.status,
          isPublic: project.isPublic,
          theme: project.settings?.theme || 'default',
          layout: project.settings?.layout || 'standard'
        }
      });
    }
    
    const stats = project.stats || {};
    stats.lastPublished = new Date();
    stats.publicationCount = 1; // 항상 1로 설정 (덮어쓰기 방식)
    
    project.status = 'published';
    project.stats = stats;
    await project.save();
    
    // 업데이트된 프로젝트 데이터를 다시 조회
    const updatedProject = await Project.findByPk(project.id);
    
    // 활동 로그 생성
    await Activity.create({
      userId: ctx.state.user.id,
      projectId: project.id,
      type: 'project_published',
      description: `프로젝트 "${project.name}"을 발행했습니다.`,
      metadata: { 
        publishedAt: new Date(),
        publicationId: publication.id,
        version: publication.version
      }
    });
    
    // 프로젝트 로그 생성
    await ProjectLogger.logProjectPublished(
      ctx.state.user.id,
      project.id,
      project.name,
      publication.id,
      publication.version,
      ctx.ip,
      ctx.get('User-Agent')
    );
    
    ctx.body = {
      success: true,
      message: `프로젝트가 성공적으로 발행되었습니다.`,
      project: updatedProject,
      publication: publication
    };
  } catch (error) {
    console.error('프로젝트 발행 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트를 발행할 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/{id}/unpublish:
 *   post:
 *     summary: 프로젝트 게시 취소
 *     description: 게시된 프로젝트를 취소하고 draft 상태로 되돌립니다.
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 게시 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       400:
 *         description: 이미 draft 상태이거나 게시되지 않은 프로젝트
 *       500:
 *         description: 서버 오류
 */

// POST /api/projects/:id/unpublish - 프로젝트 게시 취소
router.post('/:id/unpublish', authenticateToken, async (ctx) => {
  try {
    const projectId = ctx.params.id;
    const userId = ctx.state.user.id;
    
    console.log(`프로젝트 게시 취소 시도: ID ${projectId}, 사용자 ID ${userId}`);
    
    // 프로젝트 존재 여부 및 소유권 확인
    const project = await Project.findOne({
      where: { id: projectId, ownerId: userId }
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없거나 권한이 없습니다.' };
      return;
    }
    
    if (project.status !== 'published') {
      ctx.status = 400;
      ctx.body = { error: '이미 게시되지 않은 프로젝트입니다.' };
      return;
    }
    
    // 트랜잭션으로 안전하게 처리
    await sequelize.transaction(async (t) => {
      // 1. 프로젝트 상태를 draft로 변경
      await project.update({ status: 'draft' }, { transaction: t });
      
      // 2. 관련된 Publication 레코드 삭제 (중요!)
      await Publication.destroy({
        where: { projectId: projectId },
        transaction: t
      });
      
      // 3. 활동 로그 생성 (임시로 비활성화)
      try {
        await Activity.create({
          userId: userId,
          projectId: project.id,
          type: 'project_unpublished',
          description: `프로젝트 "${project.name}"의 게시를 취소했습니다.`,
          metadata: {
            unpublishedAt: new Date(),
            previousStatus: 'published',
            newStatus: 'draft'
          }
        }, { transaction: t });
      } catch (activityError) {
        console.warn('활동 로그 생성 실패 (무시됨):', activityError.message);
      }
    });
    
    console.log(`프로젝트 ${projectId} 게시 취소 완료`);
    
    ctx.body = {
      success: true,
      message: '프로젝트 게시가 취소되었습니다.',
      projectId: project.id,
      newStatus: 'draft'
    };
    
  } catch (error) {
    console.error('프로젝트 게시 취소 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 게시 취소 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/{id}/download:
 *   get:
 *     summary: 프로젝트 ZIP 다운로드
 *     description: 프로젝트 파일 전체를 ZIP으로 압축하여 다운로드합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: ZIP 파일 다운로드 성공
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/:id/download - 프로젝트 ZIP 다운로드
router.get('/:id/download', authenticateToken, async (ctx) => {
  try {
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    // 프로젝트와 관련된 파일들 조회 (사용자 ID로 필터링)
    const files = await File.findAll({
      where: { userId: ctx.state.user.id },
      attributes: ['filename', 'originalName', 'filePath', 'mimeType', 'description']
    });
    
    // 프로젝트 객체에 파일들 추가
    const projectWithFiles = {
      ...project.toJSON(),
      files: files.map(file => ({
        path: file.filePath,
        name: file.originalName,
        type: file.mimeType,
        description: file.description
      }))
    };
    
    // 프로젝트 파일들과 함께 ZIP 압축 파일 생성
    const zipBuffer = await createZipArchive(projectWithFiles);
    
    // 파일명에서 특수문자 제거 및 안전한 파일명 생성
    const safeFileName = project.name.replace(/[^a-zA-Z0-9가-힣\s]/g, '').trim().replace(/\s+/g, '_');
    ctx.set('Content-Type', 'application/zip');
    ctx.set('Content-Disposition', `attachment; filename="${safeFileName}.zip"`);
    ctx.body = zipBuffer;
  } catch (error) {
    console.error('프로젝트 다운로드 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트를 다운로드할 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/{id}/stats:
 *   get:
 *     summary: 프로젝트 통계
 *     description: 프로젝트의 조회수, 수정 횟수, 마지막 발행일 등의 통계를 반환합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 프로젝트 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views:
 *                   type: number
 *                   description: 조회수
 *                 edits:
 *                   type: number
 *                   description: 수정 횟수
 *                 lastPublished:
 *                   type: string
 *                   format: date-time
 *                   description: 마지막 발행일
 *                 projectName:
 *                   type: string
 *                   description: 프로젝트 이름
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: 생성일
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: 수정일
 *                 totalFiles:
 *                   type: number
 *                   description: 총 파일 수
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/:id/stats - 프로젝트 통계
router.get('/:id/stats', authenticateToken, async (ctx) => {
  try {
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      },
      attributes: ['id', 'name', 'stats', 'createdAt', 'updatedAt']
    });
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    const stats = {
      ...project.stats,
      projectName: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      totalFiles: 0 // 현재는 파일 시스템 연동 없음
    };
    
    ctx.body = stats;
  } catch (error) {
    console.error('프로젝트 통계 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 통계를 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/{id}/code:
 *   get:
 *     summary: 프로젝트 HTML 코드 조회
 *     description: 프로젝트의 HTML 코드를 조회합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: HTML 코드 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: HTML 코드 내용
 *                 projectId:
 *                   type: integer
 *                   description: 프로젝트 ID
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 *   
 *   put:
 *     summary: 프로젝트 HTML 코드 저장
 *     description: 프로젝트의 HTML 코드를 저장합니다.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 저장할 HTML 코드
 *     responses:
 *       200:
 *         description: HTML 코드 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 projectId:
 *                   type: integer
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/:id/code - 프로젝트 HTML 코드 조회
router.get('/:id/code', authenticateToken, async (ctx) => {
  try {
    console.log('프로젝트 코드 조회 요청:', ctx.params.id, '사용자:', ctx.state.user.id);
    
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    console.log('찾은 프로젝트:', project ? { id: project.id, name: project.name, settings: project.settings } : 'null');
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    // 현재는 프로젝트의 settings에 코드를 저장하는 방식 사용
    let code = '';
    try {
      if (project.settings && typeof project.settings === 'object') {
        code = project.settings.htmlCode || '';
      } else if (typeof project.settings === 'string') {
        // settings가 문자열로 저장된 경우 파싱 시도
        try {
          const parsedSettings = JSON.parse(project.settings);
          code = parsedSettings.htmlCode || '';
        } catch (parseError) {
          console.warn('settings 파싱 실패:', parseError);
          code = '';
        }
      }
    } catch (error) {
      console.warn('settings 접근 오류:', error);
      code = '';
    }
    
    console.log('추출된 HTML 코드 길이:', code.length);
    
    ctx.body = {
      content: code,
      projectId: project.id
    };
    
    console.log('프로젝트 코드 조회 성공');
  } catch (error) {
    console.error('프로젝트 코드 조회 오류:', error);
    console.error('오류 스택:', error.stack);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 코드를 불러올 수 없습니다.' };
  }
});

// PUT /api/projects/:id/code - 프로젝트 HTML 코드 저장
router.put('/:id/code', authenticateToken, async (ctx) => {
  try {
    console.log('프로젝트 코드 저장 요청:', ctx.params.id, '사용자:', ctx.state.user.id);
    console.log('요청 본문:', ctx.request.body);
    
    const { content } = ctx.request.body;
    
    if (content === undefined) {
      ctx.status = 400;
      ctx.body = { error: 'HTML 코드가 제공되지 않았습니다.' };
      return;
    }
    
    const project = await Project.findOne({ 
      where: { 
        id: ctx.params.id, 
        ownerId: ctx.state.user.id 
      }
    });
    
    console.log('찾은 프로젝트:', project ? { id: project.id, name: project.name, settings: project.settings } : 'null');
    
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: '프로젝트를 찾을 수 없습니다.' };
      return;
    }
    
    // 프로젝트의 settings에 HTML 코드 저장
    let settings = {};
    try {
      if (project.settings && typeof project.settings === 'object') {
        settings = { ...project.settings };
      } else if (typeof project.settings === 'string') {
        try {
          settings = JSON.parse(project.settings);
        } catch (parseError) {
          console.warn('기존 settings 파싱 실패, 새로 생성:', parseError);
          settings = {};
        }
      }
    } catch (error) {
      console.warn('기존 settings 접근 오류, 새로 생성:', error);
      settings = {};
    }
    
    settings.htmlCode = content;
    
    console.log('업데이트할 settings:', settings);
    
    await project.update({ settings });
    
    // 활동 로그 생성 (기존 타입 사용)
    await Activity.create({
      userId: ctx.state.user.id,
      projectId: project.id,
      type: 'project_updated',
      description: `프로젝트 "${project.name}"의 코드를 업데이트했습니다.`,
      metadata: { codeLength: content.length, updateType: 'code' }
    });
    
    // 프로젝트 로그 생성
    await ProjectLogger.logCodeUpdated(
      ctx.state.user.id,
      project.id,
      project.name,
      content.length,
      ctx.ip,
      ctx.get('User-Agent')
    );
    
    ctx.body = {
      success: true,
      message: 'HTML 코드가 성공적으로 저장되었습니다.',
      projectId: project.id
    };
    
    console.log('프로젝트 코드 저장 성공');
  } catch (error) {
    console.error('프로젝트 코드 저장 오류:', error);
    console.error('오류 스택:', error.stack);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 코드를 저장할 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/publications/{id}/code:
 *   get:
 *     summary: 게시된 프로젝트의 HTML 코드 조회
 *     description: 특정 Publication ID의 HTML 코드를 조회합니다. (인증 불필요)
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Publication ID
 *       - in: query
 *         name: version
 *         schema:
 *           type: integer
 *         description: 조회할 버전 (입력하지 않으면 최신 버전)
 *     responses:
 *       200:
 *         description: HTML 코드 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 publicationId:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 htmlCode:
 *                   type: string
 *                 publishedAt:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: integer
 *                 viewCount:
 *                   type: integer
 *       404:
 *         description: Publication을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/publications/:id/code - 게시된 프로젝트의 HTML 코드 조회
router.get('/publications/:id/code', async (ctx) => {
  try {
    const publicationId = ctx.params.id;  // 이제 실제 Publication ID
    const { version } = ctx.query;
    
    let publication;
    
    if (version) {
      // 특정 버전 조회 - Publication ID로 조회
      publication = await Publication.findOne({
        where: { 
          id: parseInt(publicationId),  // Publication ID 사용
          version: parseInt(version),
          status: 'active'
        }
      });
    } else {
      // 최신 버전 조회 - Publication ID로 조회
      publication = await Publication.findOne({
        where: { 
          id: parseInt(publicationId),  // Publication ID 사용
          status: 'active'
        },
        order: [['version', 'DESC']]
      });
    }
    
    if (!publication) {
      ctx.status = 404;
      ctx.body = { error: 'Publication을 찾을 수 없습니다.' };
      return;
    }
    
    // 조회수 증가
    const viewCount = (publication.viewCount || 0) + 1;
    await publication.update({ viewCount });
    
    ctx.body = {
      success: true,
      publicationId: publication.id,
      projectId: publication.projectId,
      title: publication.title,
      htmlCode: publication.content?.htmlCode || '',
      publishedAt: publication.publishedAt,
      version: publication.version,
      viewCount: viewCount
    };
    
  } catch (error) {
    console.error('Publication 코드 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: 'Publication 코드를 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/projects/publications/{id}/versions:
 *   get:
 *     summary: 게시된 프로젝트의 모든 버전 목록 조회
 *     description: 특정 Publication ID의 모든 버전 목록을 조회합니다. (인증 불필요)
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Publication ID
 *     responses:
 *       200:
 *         description: 버전 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 publicationId:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 versions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       version:
 *                         type: integer
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                       viewCount:
 *                         type: integer
 *       404:
 *         description: Publication을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// GET /api/projects/publications/:id/versions - 게시된 프로젝트의 모든 버전 목록 조회
router.get('/publications/:id/versions', async (ctx) => {
  try {
    const projectId = ctx.params.id;  // 이건 실제로는 projectId
    
    // 해당 프로젝트의 모든 버전 조회 - projectId로 조회
    const publications = await Publication.findAll({
      where: { 
        projectId: parseInt(projectId),  // id → projectId로 변경
        status: 'active'
      },
      attributes: ['version', 'publishedAt', 'viewCount', 'title'],
      order: [['version', 'DESC']]
    });
    
    if (publications.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Publication을 찾을 수 없습니다.' };
      return;
    }
    
    ctx.body = {
      success: true,
      projectId: parseInt(projectId),  // projectId 반환
      title: publications[0].title,
      versions: publications.map(pub => ({
        version: pub.version,
        publishedAt: pub.publishedAt,
        viewCount: pub.viewCount
      }))
    };
    
  } catch (error) {
    console.error('Publication 버전 목록 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: 'Publication 버전 목록을 불러올 수 없습니다.' };
  }
});

// 테스트용: 모든 publications 조회
router.get('/publications-test', async (ctx) => {
  try {
    const publications = await Publication.findAll({
      attributes: ['id', 'projectId', 'title', 'status', 'version'],
      order: [['id', 'ASC']]
    });
    
    ctx.body = {
      success: true,
      count: publications.length,
      publications: publications
    };
  } catch (error) {
    console.error('Publications 테스트 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: 'Publications 조회 실패' };
  }
});

// 테스트용: 특정 projectId의 publications 조회
router.get('/publications-by-project/:projectId', async (ctx) => {
  try {
    const projectId = parseInt(ctx.params.projectId);
    
    const publications = await Publication.findAll({
      where: { 
        projectId: projectId,
        status: 'active'
      },
      attributes: ['id', 'projectId', 'title', 'status', 'version'],
      order: [['version', 'DESC']]
    });
    
    ctx.body = {
      success: true,
      projectId: projectId,
      count: publications.length,
      publications: publications
    };
  } catch (error) {
    console.error('Project Publications 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: 'Project Publications 조회 실패' };
  }
});

export { router };
