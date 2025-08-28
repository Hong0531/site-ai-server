/* ----------------------------------------
 * src/app.js
 * -------------------------------------- */

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';
import dotenv from 'dotenv';
import serve from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// DB & Auto-Router 헬퍼
import { initDB } from './config/database.js';
import { loadRoutes } from './autoRouter.js';

// Swagger
import { koaSwagger } from 'koa2-swagger-ui';
import { specs } from './swagger.js';

/* 1. 환경변수 */
dotenv.config();

// __dirname 대체 (ES 모듈)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* 2. App 인스턴스 */
const app = new Koa();

/* 3. 전역 미들웨어 */
app.use(cors({
  origin: '*', // 개발 환경에서는 모든 도메인 허용
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
app.use(logger());          // 콘솔 로그
app.use(bodyParser());      // JSON, 폼 파싱
app.use(serve(path.join(__dirname, 'public'))); // 정적 파일 제공
app.use(serve(path.join(__dirname, 'uploads'), { prefix: '/api/uploads' })); // 업로드된 파일을 /api/uploads 경로로 제공

/* 4. Swagger UI */5
app.use(koaSwagger({
  routePrefix: '/api/swagger',
  swaggerOptions: {
    url: '/api/swagger.json',
    spec: specs
  }
}));

/* 5. 라우트 자동 등록 */
await loadRoutes(app);      // routes/**  → URL 매핑

/* 6. 글로벌 에러 핸들러 (선택) */
app.on('error', (err, ctx) => {
  console.error('Server error', err, ctx);
});

/* 7. DB 연결 & 서버 기동 */
const PORT = process.env.PORT || 4000;

(async () => {
  await initDB();                 // Sequelize authenticate()
  app.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT}`);
    console.log(`📚  API Documentation: http://localhost:${PORT}/api/docs`);
  });
})();
