import Router from 'koa-router';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 오토 라우터
 * @param {Koa} app Koa 인스턴스
 * @param {String} routesDir 기본 routes 디렉터리 (default: ./routes)
 */
export async function loadRoutes(app, routesDir = './routes') {
  const router = new Router();
  const baseDir = path.join(__dirname, routesDir);

  /** 재귀적으로 routesDir 스캔 */
  async function scan(dir, prefix = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // 디렉토리인 경우 재귀적으로 스캔하면서 프리픽스 추가
        await scan(fullPath, `${prefix}/${entry.name}`);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        // routes/ai.js => /api/ai, routes/coding.js => /api/coding
        const routePrefix = prefix ? `/api${prefix}` : '/api';
        
        console.log(`📁 Processing file: ${entry.name} with prefix: ${routePrefix}`);
        
        /* 동적 import */
        const mod = await import(pathToFileURL(fullPath).href);
        
        // 1) export default async (ctx)=>{}  2) export const router = new Router()
        if (typeof mod.default === 'function') {
          // index.js의 경우 /api에 등록
          if (entry.name === 'index.js') {
            router.get(routePrefix, mod.default);
            console.log(`🛣️  route loaded: [GET] ${routePrefix}`);
          } else {
            // 다른 파일들은 파일명을 경로로 사용
            const routePath = `${routePrefix}/${entry.name.replace('.js', '')}`;
            router.get(routePath, mod.default);
            console.log(`🛣️  route loaded: [GET] ${routePath}`);
          }
        } else if (mod.router && typeof mod.router.routes === 'function') {
          // Router 인스턴스인 경우 /api 프리픽스와 함께 등록
          if (entry.name === 'index.js') {
            router.use(routePrefix, mod.router.routes());
            console.log(`🛣️  router loaded: ${routePrefix}`);
          } else {
            // ai.js, coding.js 등의 경우 해당 프리픽스로 등록
            const filePrefix = entry.name.replace('.js', '');
            const fullPrefix = `/api/${filePrefix}`;
            router.use(fullPrefix, mod.router.routes());
            console.log(`🛣️  router loaded: ${fullPrefix}`);
          }
        } else {
          console.warn(`⚠️  ${fullPath} 는 유효한 라우트가 아님`);
          console.log(`   - mod.default: ${typeof mod.default}`);
          console.log(`   - mod.router: ${mod.router ? typeof mod.router : 'undefined'}`);
          if (mod.router) {
            console.log(`   - mod.router.routes: ${typeof mod.router.routes}`);
          }
        }
      }
    }
  }

  await scan(baseDir);
  app.use(router.routes()).use(router.allowedMethods());
  console.log('✅ Auto routes registered with /api prefix');
}
