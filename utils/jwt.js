import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yg';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT 토큰 생성
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT 토큰 검증
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// JWT 토큰에서 사용자 ID 추출
export const extractUserIdFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
};
