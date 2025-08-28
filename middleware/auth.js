import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

// JWT 토큰 검증 미들웨어
export const authenticateToken = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ctx.status = 401;
      ctx.body = { error: '액세스 토큰이 필요합니다.' };
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      ctx.status = 403;
      ctx.body = { error: '유효하지 않은 토큰입니다.' };
      return;
    }

    // 사용자 정보 조회
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      ctx.status = 403;
      ctx.body = { error: '사용자를 찾을 수 없습니다.' };
      return;
    }

    // ctx.state에 사용자 정보 저장
    ctx.state.user = user;
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    ctx.status = 500;
    ctx.body = { error: '인증 처리 중 오류가 발생했습니다.' };
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 사용자 정보를, 없으면 null을 설정)
export const optionalAuth = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findByPk(decoded.id);
        if (user && user.isActive) {
          ctx.state.user = user;
        }
      }
    }

    await next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    await next();
  }
};
