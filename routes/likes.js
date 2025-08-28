import Router from '@koa/router';
import Like from '../models/Like.js';
import Template from '../models/Template.js';
import { authenticateToken } from '../middleware/auth.js';

const router = new Router({
  prefix: '/api/likes'
});

/**
 * @swagger
 * /api/likes/template/{templateId}:
 *   post:
 *     summary: 템플릿 좋아요 추가/제거
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 템플릿 ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 좋아요 상태 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 liked:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 템플릿을 찾을 수 없음
 */
router.post('/template/:templateId', authenticateToken, async (ctx) => {
  try {
    const { templateId } = ctx.params;
    const userId = ctx.state.user.id;

    // 템플릿 존재 확인
    const template = await Template.findByPk(templateId);
    if (!template) {
      ctx.status = 404;
      ctx.body = { success: false, message: '템플릿을 찾을 수 없습니다.' };
      return;
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await Like.findOne({
      where: { userId, templateId }
    });

    if (existingLike) {
      // 좋아요 제거
      await existingLike.destroy();
      
      // 템플릿의 좋아요 수 감소
      await template.decrement('likeCount');
      
      ctx.body = {
        success: true,
        liked: false,
        message: '좋아요가 제거되었습니다.'
      };
    } else {
      // 좋아요 추가
      await Like.create({ userId, templateId });
      
      // 템플릿의 좋아요 수 증가
      await template.increment('likeCount');
      
      ctx.body = {
        success: true,
        liked: true,
        message: '좋아요가 추가되었습니다.'
      };
    }
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: '서버 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/likes/template/{templateId}/status:
 *   get:
 *     summary: 사용자의 템플릿 좋아요 상태 확인
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 템플릿 ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 좋아요 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 liked:
 *                   type: boolean
 *       401:
 *         description: 인증 실패
 */
router.get('/template/:templateId/status', authenticateToken, async (ctx) => {
  try {
    const { templateId } = ctx.params;
    const userId = ctx.state.user.id;

    const like = await Like.findOne({
      where: { userId, templateId }
    });

    ctx.body = {
      success: true,
      liked: !!like
    };
  } catch (error) {
    console.error('좋아요 상태 확인 오류:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: '서버 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/likes/user:
 *   get:
 *     summary: 사용자가 좋아요한 템플릿 목록 조회
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 좋아요한 템플릿 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 templates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Template'
 *       401:
 *         description: 인증 실패
 */
router.get('/user', authenticateToken, async (ctx) => {
  try {
    const userId = ctx.state.user.id;

    const likedTemplates = await Template.findAll({
      include: [{
        model: Like,
        where: { userId },
        attributes: []
      }],
      attributes: ['id', 'name', 'description', 'category', 'thumbnail', 'likeCount', 'viewCount', 'createdAt']
    });

    ctx.body = {
      success: true,
      templates: likedTemplates
    };
  } catch (error) {
    console.error('사용자 좋아요 목록 조회 오류:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: '서버 오류가 발생했습니다.' };
  }
});

export { router };
