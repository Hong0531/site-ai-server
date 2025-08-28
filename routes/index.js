/* src/routes/index.js */

import Router from 'koa-router';

const router = new Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API 상태 확인
 *     description: 서버가 정상적으로 작동하는지 확인합니다.
 *     tags: [시스템]
 *     responses:
 *       200:
 *         description: 서버 정상 작동
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: API OK
 */
/* GET / → 기본 헬스체크 */
router.get('/', (ctx) => {
  ctx.body = 'API OK';
});

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: 테스트 라우트
 *     description: API 테스트를 위한 라우트입니다.
 *     tags: [시스템]
 *     responses:
 *       200:
 *         description: 테스트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is a test route 🎉
 *                 timestamp:
 *                   type: integer
 *                   description: 현재 타임스탬프
 */
/* GET /test → 테스트 라우트 */
router.get('/test', (ctx) => {
  ctx.body = {
    message: 'This is a test route 🎉',
    timestamp: Date.now(),
  };
});

/* GET /swagger.json → Swagger 스펙 */
router.get('/swagger.json', async (ctx) => {
  const { specs } = await import('../swagger.js');
  ctx.body = specs;
});

export { router };    // autoRouter.js 가 인식
