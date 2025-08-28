import Router from 'koa-router';
import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

const router = new Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 활동 로그 고유 ID
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         project:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: 프로젝트 ID
 *             name:
 *               type: string
 *               description: 프로젝트 이름
 *           description: 관련 프로젝트 정보
 *         type:
 *           type: string
 *           enum: [project_created, project_updated, project_published, project_deleted, project_duplicated, file_uploaded, file_updated]
 *           description: 활동 타입
 *         description:
 *           type: string
 *           description: 활동 설명
 *         metadata:
 *           type: object
 *           description: 추가 메타데이터
 *         icon:
 *           type: string
 *           description: 활동 아이콘
 *         color:
 *           type: string
 *           description: 활동 색상
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 활동 발생 시간
 *     
 *     ActivityPagination:
 *       type: object
 *       properties:
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *           description: 활동 로그 목록
 *         pagination:
 *           type: object
 *           properties:
 *             current:
 *               type: number
 *               description: 현재 페이지
 *             limit:
 *               type: number
 *               description: 페이지당 항목 수
 *             total:
 *               type: number
 *               description: 전체 항목 수
 *             pages:
 *               type: number
 *               description: 전체 페이지 수
 *     
 *     ActivitySummary:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *           description: 통계 기간
 *         totalActivities:
 *           type: number
 *           description: 전체 활동 수
 *         byType:
 *           type: object
 *           description: 활동 타입별 통계
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: 사용자 활동 로그 조회
 *     description: 로그인한 사용자의 활동 로그를 페이지네이션과 함께 조회합니다.
 *     tags: [Activities]
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
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [project_created, project_updated, project_published, project_deleted, project_duplicated, file_uploaded, file_updated]
 *         description: 활동 타입 필터
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: 특정 프로젝트의 활동만 조회
 *     responses:
 *       200:
 *         description: 활동 로그 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityPagination'
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/activities - 사용자 활동 로그 조회
router.get('/', authenticateToken, async (ctx) => {
  try {
    const { page = 1, limit = 20, type, projectId } = ctx.query;
    
    // 쿼리 조건 구성
    const whereClause = { userId: ctx.state.user.id };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }
    
    // 페이지네이션
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const activities = await Activity.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: parseInt(limit)
    });
    
    // 각 활동에 아이콘과 색상 추가
    const activitiesWithDisplay = activities.rows.map(activity => {
      const display = Activity.getActivityDisplay(activity.type);
      return {
        ...activity.toJSON(),
        icon: display.icon,
        color: display.color
      };
    });
    
    ctx.body = {
      activities: activitiesWithDisplay,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total: activities.count,
        pages: Math.ceil(activities.count / parseInt(limit))
      }
    };
  } catch (error) {
    console.error('활동 로그 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '활동 로그를 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/activities/recent:
 *   get:
 *     summary: 최근 활동 조회
 *     description: 대시보드용으로 사용자의 최근 활동을 조회합니다.
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 조회할 활동 수
 *     responses:
 *       200:
 *         description: 최근 활동 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/activities/recent - 최근 활동 (대시보드용)
router.get('/recent', authenticateToken, async (ctx) => {
  try {
    const { limit = 10 } = ctx.query;
    
    const recentActivities = await Activity.findAll({
      where: { userId: ctx.state.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    // 각 활동에 아이콘과 색상 추가
    const activitiesWithDisplay = recentActivities.map(activity => {
      const display = Activity.getActivityDisplay(activity.type);
      return {
        ...activity.toJSON(),
        icon: display.icon,
        color: display.color
      };
    });
    
    ctx.body = activitiesWithDisplay;
  } catch (error) {
    console.error('최근 활동 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '최근 활동을 불러올 수 없습니다.' };
  }
});

/**
 * @swagger
 * /api/activities/summary:
 *   get:
 *     summary: 활동 요약 통계
 *     description: 지정된 기간 동안의 사용자 활동 통계를 제공합니다.
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 통계 기간 (일)
 *     responses:
 *       200:
 *         description: 활동 요약 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivitySummary'
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

// GET /api/activities/summary - 활동 요약 통계
router.get('/summary', authenticateToken, async (ctx) => {
  try {
    const { days = 30 } = ctx.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const summary = await Activity.findAll({
      where: {
        userId: ctx.state.user.id,
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });
    
    // 활동 타입별 통계 구성
    const activityStats = {};
    let totalActivities = 0;
    
    summary.forEach(item => {
      const type = item.getDataValue('type');
      const count = parseInt(item.getDataValue('count'));
      activityStats[type] = count;
      totalActivities += count;
    });
    
    ctx.body = {
      period: `${days}일`,
      totalActivities,
      byType: activityStats
    };
  } catch (error) {
    console.error('활동 요약 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { error: '활동 요약을 불러올 수 없습니다.' };
  }
});

export { router };
