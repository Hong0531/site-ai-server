import Router from 'koa-router';
import ProjectLog from '../models/ProjectLog.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

const router = new Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 로그 고유 ID
 *         projectId:
 *           type: integer
 *           description: 프로젝트 ID (삭제된 프로젝트는 null)
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         action:
 *           type: string
 *           enum: [created, updated, deleted, published, unpublished, viewed, duplicated]
 *           description: 수행된 액션
 *         description:
 *           type: string
 *           description: 액션에 대한 설명
 *         metadata:
 *           type: object
 *           description: 추가 메타데이터
 *         ipAddress:
 *           type: string
 *           description: 사용자 IP 주소
 *         userAgent:
 *           type: string
 *           description: 사용자 에이전트
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 로그 생성 시간
 *         project:
 *           $ref: '#/components/schemas/Project'
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     ProjectLogStats:
 *       type: object
 *       properties:
 *         totalLogs:
 *           type: integer
 *           description: 전체 로그 수
 *         actionCounts:
 *           type: object
 *           description: 액션별 로그 수
 *         dailyStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               count:
 *                 type: integer
 *               actions:
 *                 type: object
 *         topProjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: integer
 *               projectName:
 *                 type: string
 *               logCount:
 *                 type: integer
 *         topUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               username:
 *                 type: string
 *               logCount:
 *                 type: integer
 */

/**
 * @swagger
 * /api/project-logs:
 *   get:
 *     summary: 프로젝트 로그 목록 조회
 *     description: 프로젝트 활동 로그를 조회합니다. 관리자만 접근 가능합니다.
 *     tags: [ProjectLogs]
 *     security:
 *       - bearerAuth: []
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
 *           default: 50
 *           maximum: 200
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [created, updated, deleted, published, unpublished, viewed, duplicated]
 *         description: 특정 액션으로 필터링
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: 특정 프로젝트 ID로 필터링
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 특정 사용자 ID로 필터링
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 시작 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 종료 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 로그 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectLog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: 서버 오류
 */

// GET /api/project-logs - 프로젝트 로그 목록 조회
router.get('/', authenticateToken, async (ctx) => {
  try {
    // TODO: 관리자 권한 체크 추가
    const { 
      page = 1, 
      limit = 50, 
      action, 
      projectId, 
      userId, 
      startDate, 
      endDate 
    } = ctx.query;
    
    const offset = (page - 1) * limit;
    
    // 필터 조건 구성
    let whereClause = {};
    
    if (action) {
      whereClause.action = action;
    }
    
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }
    
    if (userId) {
      whereClause.userId = parseInt(userId);
    }
    
    if (startDate || endDate) {
      if (startDate) {
        whereClause.createdAt = { [Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        if (whereClause.createdAt) {
          whereClause.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
        } else {
          whereClause.createdAt = { [Op.lte]: new Date(endDate + ' 23:59:59') };
        }
      }
    }
    
    const { count, rows: logs } = await ProjectLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status'],
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    ctx.body = {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages
      }
    };
  } catch (error) {
    console.error('프로젝트 로그 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 로그를 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/project-logs/stats:
 *   get:
 *     summary: 프로젝트 로그 통계 조회
 *     description: 프로젝트 활동에 대한 통계 정보를 조회합니다. (인증 불필요)
 *     tags: [ProjectLogs]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 시작 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 종료 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectLogStats'
 *       500:
 *         description: 서버 오류
 */

// GET /api/project-logs/stats - 프로젝트 로그 통계 조회 (인증 불필요)
router.get('/stats', async (ctx) => {
  try {
    // TODO: 관리자 권한 체크 추가
    const { startDate, endDate } = ctx.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        if (dateFilter.createdAt) {
          dateFilter.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
        } else {
          dateFilter.createdAt = { [Op.lte]: new Date(endDate + ' 23:59:59') };
        }
      }
    }
    
    // 전체 로그 수
    const totalLogs = await ProjectLog.count({ where: dateFilter });
    
    // 액션별 로그 수
    const actionCounts = await ProjectLog.findAll({
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'count']
      ],
      where: dateFilter,
      group: ['action']
    });
    
    const actionCountsMap = {};
    actionCounts.forEach(item => {
      actionCountsMap[item.action] = parseInt(item.dataValues.count);
    });
    
    // 일별 통계 (최근 30일)
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyStats = await ProjectLog.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.between]: [startDateObj, endDateObj]
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });
    
    // 일별 액션별 통계
    const dailyActionStats = await ProjectLog.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        'action',
        [sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.between]: [startDateObj, endDateObj]
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt')), 'action'],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });
    
    // 일별 통계에 액션별 정보 추가
    const dailyStatsWithActions = dailyStats.map(day => {
      const dayStr = day.dataValues.date;
      const actions = {};
      
      dailyActionStats.forEach(actionStat => {
        if (actionStat.dataValues.date === dayStr) {
          actions[actionStat.action] = parseInt(actionStat.dataValues.count);
        }
      });
      
      return {
        date: dayStr,
        count: parseInt(day.dataValues.count),
        actions
      };
    });
    
    // 상위 프로젝트 (로그 수 기준)
    const topProjects = await ProjectLog.findAll({
      attributes: [
        'projectId',
        [sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'logCount']
      ],
      where: {
        ...dateFilter,
        projectId: { [Op.ne]: null }
      },
      group: ['projectId'],
      order: [[sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'DESC']],
      limit: 10,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['name'],
          required: false
        }
      ]
    });
    
    // 상위 사용자 (로그 수 기준)
    const topUsers = await ProjectLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'logCount']
      ],
      where: dateFilter,
      group: ['userId'],
      order: [[sequelize.fn('COUNT', sequelize.col('ProjectLog.id')), 'DESC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
          required: false
        }
      ]
    });
    
    ctx.body = {
      totalLogs,
      actionCounts: actionCountsMap,
      dailyStats: dailyStatsWithActions,
      topProjects: topProjects.map(item => ({
        projectId: item.projectId,
        projectName: item.project?.name || '삭제된 프로젝트',
        logCount: parseInt(item.dataValues.logCount)
      })),
      topUsers: topUsers.map(item => ({
        userId: item.userId,
        username: item.user?.name || '알 수 없는 사용자',
        logCount: parseInt(item.dataValues.logCount)
      }))
    };
  } catch (error) {
    console.error('프로젝트 로그 통계 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 로그 통계를 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/project-logs/count:
 *   get:
 *     summary: 프로젝트 로그 카운트 조회
 *     description: 특정 조건에 맞는 프로젝트 로그의 개수를 조회합니다. (인증 불필요)
 *     tags: [ProjectLogs]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [created, updated, deleted, published, unpublished, viewed, duplicated]
 *         description: 특정 액션으로 필터링
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: 특정 프로젝트 ID로 필터링
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 특정 사용자 ID로 필터링
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 시작 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 종료 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 카운트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: 로그 개수
 *                 filters:
 *                   type: object
 *                   description: 적용된 필터 조건
 *       500:
 *         description: 서버 오류
 */

// GET /api/project-logs/count - 프로젝트 로그 카운트 조회 (인증 불필요)
router.get('/count', async (ctx) => {
  try {
    const { action, projectId, userId, startDate, endDate } = ctx.query;
    
    // 필터 조건 구성
    let whereClause = {};
    
    if (action) {
      whereClause.action = action;
    }
    
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }
    
    if (userId) {
      whereClause.userId = parseInt(userId);
    }
    
    if (startDate || endDate) {
      if (startDate) {
        whereClause.createdAt = { [Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        if (whereClause.createdAt) {
          whereClause.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
        } else {
          whereClause.createdAt = { [Op.lte]: new Date(endDate + ' 23:59:59') };
        }
      }
    }
    
    const count = await ProjectLog.count({ where: whereClause });
    
    ctx.body = {
      count,
      filters: {
        action,
        projectId: projectId ? parseInt(projectId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        startDate,
        endDate
      }
    };
  } catch (error) {
    console.error('프로젝트 로그 카운트 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '프로젝트 로그 카운트를 불러올 수 없습니다.' };
  }
});

export { router };
