import Router from 'koa-router';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import multer from '@koa/multer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 업로드 디렉토리 생성 함수
const ensureUploadDir = async () => {
  try {
    await fs.access(path.join(__dirname, '../uploads'));
  } catch {
    await fs.mkdir(path.join(__dirname, '../uploads'), { recursive: true });
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 사용자 고유 ID
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         phone:
 *           type: string
 *           nullable: true
 *           description: 사용자 전화번호
 *         isActive:
 *           type: boolean
 *           description: 계정 활성화 상태
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 마지막 로그인 시간
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 계정 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 계정 수정 시간
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일
 *         password:
 *           type: string
 *           minLength: 6
 *           description: 사용자 비밀번호
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일
 *         password:
 *           type: string
 *           minLength: 6
 *           description: 사용자 비밀번호
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         phone:
 *           type: string
 *           nullable: true
 *           description: 사용자 전화번호
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: 응답 메시지
 *         token:
 *           type: string
 *           description: JWT 토큰
 *         user:
 *           $ref: '#/components/schemas/User'
 */

// multer 설정
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 아바타 URL 생성 함수
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  
  console.log('getAvatarUrl input:', avatarPath)
  
  // 외부 파일 서버 URL인 경우 그대로 반환
  if (avatarPath.startsWith('https://') || avatarPath.startsWith('http://')) {
    console.log('External file server URL:', avatarPath)
    return avatarPath
  }
  
  // 기존 로컬 파일 경로인 경우 (마이그레이션용)
  if (avatarPath.startsWith('/uploads/')) {
    const fullUrl = `${process.env.SERVER_URL || 'http://localhost:6010'}/api${avatarPath}`
    console.log('Local file URL:', fullUrl)
    return fullUrl
  }
  
  if (avatarPath.includes('avatar-')) {
    const fullUrl = `${process.env.SERVER_URL || 'http://localhost:6010'}/api/uploads/${avatarPath}`
    console.log('Local file URL:', fullUrl)
    return fullUrl
  }
  
  return avatarPath
}

// 외부 파일 서버 API
export const fileApi = {
  // 파일 업로드
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(process.env.FILE_SERVER_URL || 'https://your-file-server.com/file/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('파일 업로드 실패')
    }
    
    return response.json()
  },

  // 파일 목록 조회
  getFiles: async () => {
    const response = await fetch(process.env.FILE_SERVER_URL || 'https://your-file-server.com/file/files')
    
    if (!response.ok) {
      throw new Error('파일 목록 조회 실패')
    }
    
    return response.json()
  },

  // 파일 삭제
  deleteFile: async (filename) => {
    const response = await fetch(`${process.env.FILE_SERVER_URL || 'https://your-file-server.com/file/files'}/${filename}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('파일 삭제 실패')
    }
    
    return response.json()
  }
}

const router = new Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다.
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: 이메일 중복
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
// 회원가입
router.post('/register', async (ctx) => {
  try {
    const { email, password, name, phone } = ctx.request.body;

    // 필수 필드 검증
    if (!email || !password || !name) {
      ctx.status = 400;
      ctx.body = { error: '이메일, 비밀번호, 이름은 필수입니다.' };
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ctx.status = 400;
      ctx.body = { error: '유효한 이메일 형식이 아닙니다.' };
      return;
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      ctx.status = 400;
      ctx.body = { error: '비밀번호는 최소 6자 이상이어야 합니다.' };
      return;
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      ctx.status = 409;
      ctx.body = { error: '이미 등록된 이메일입니다.' };
      return;
    }

    // 사용자 생성
    const user = await User.create({
      email,
      password,
      name,
      phone
    });

    // 비밀번호 제외하고 응답
    const { password: _, ...userWithoutPassword } = user.toJSON();

    ctx.status = 201;
    ctx.body = {
      message: '회원가입이 완료되었습니다.',
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Register error:', error);
    ctx.status = 500;
    ctx.body = { error: '회원가입 처리 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자 인증 후 JWT 토큰을 발급합니다.
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그인이 완료되었습니다.
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
// 로그인
router.post('/login', async (ctx) => {
  try {
    const { email, password } = ctx.request.body;

    // 필수 필드 검증
    if (!email || !password) {
      ctx.status = 400;
      ctx.body = { error: '이메일과 비밀번호를 입력해주세요.' };
      return;
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email } });
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      return;
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      ctx.status = 401;
      ctx.body = { error: '비활성화된 계정입니다.' };
      return;
    }

    // 비밀번호 검증
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      return;
    }

    // 마지막 로그인 시간 업데이트
    await user.update({ lastLoginAt: new Date() });

    // JWT 토큰 생성
    const token = generateToken({ id: user.id, email: user.email });

    // 비밀번호 제외하고 응답
    const { password: _, ...userWithoutPassword } = user.toJSON();

    ctx.body = {
      message: '로그인이 완료되었습니다.',
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Login error:', error);
    ctx.status = 500;
    ctx.body = { error: '로그인 처리 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 비밀번호 찾기
 *     description: 이메일로 임시 비밀번호를 발송합니다.
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 이메일 발송 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
// 비밀번호 찾기 (이메일로 임시 비밀번호 발송)
router.post('/forgot-password', async (ctx) => {
  try {
    const { email } = ctx.request.body;

    if (!email) {
      ctx.status = 400;
      ctx.body = { error: '이메일을 입력해주세요.' };
      return;
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
      ctx.body = {
        message: '비밀번호 재설정 이메일이 발송되었습니다. (이메일이 등록되지 않은 경우 발송되지 않습니다.)'
      };
      return;
    }

    // 임시 비밀번호 생성 (8자리 랜덤)
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // 비밀번호 업데이트 (bcrypt로 해시화됨)
    await user.update({ password: tempPassword });

    // TODO: 실제 이메일 발송 로직 구현
    // 여기서는 콘솔에 출력 (개발용)
    console.log(`임시 비밀번호 발송: ${email} -> ${tempPassword}`);

    ctx.body = {
      message: '비밀번호 재설정 이메일이 발송되었습니다.',
      tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    ctx.status = 500;
    ctx.body = { error: '비밀번호 찾기 처리 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: 비밀번호 변경
 *     description: 로그인된 사용자의 비밀번호를 변경합니다.
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: 현재 비밀번호
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: 새 비밀번호
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요 또는 현재 비밀번호 불일치
 *       500:
 *         description: 서버 오류
 */
// 비밀번호 변경 (로그인된 사용자)
router.put('/change-password', authenticateToken, async (ctx) => {
  try {
    const { currentPassword, newPassword } = ctx.request.body;
    const user = ctx.state.user;

    if (!currentPassword || !newPassword) {
      ctx.status = 400;
      ctx.body = { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' };
      return;
    }

    // 새 비밀번호 길이 검증
    if (newPassword.length < 6) {
      ctx.status = 400;
      ctx.body = { error: '새 비밀번호는 최소 6자 이상이어야 합니다.' };
      return;
    }

    // 현재 비밀번호 검증
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = { error: '현재 비밀번호가 올바르지 않습니다.' };
      return;
    }

    // 새 비밀번호로 업데이트
    await user.update({ password: newPassword });

    ctx.body = {
      message: '비밀번호가 성공적으로 변경되었습니다.'
    };
  } catch (error) {
    console.error('Change password error:', error);
    ctx.status = 500;
    ctx.body = { error: '비밀번호 변경 처리 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: 현재 로그인한 사용자의 정보를 조회합니다.
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 내 정보 조회
router.get('/me', authenticateToken, async (ctx) => {
  try {
    const user = ctx.state.user;
    const { password: _, ...userWithoutPassword } = user.toJSON();

    ctx.body = {
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Get profile error:', error);
    ctx.status = 500;
    ctx.body = { error: '프로필 조회 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: 내 정보 수정
 *     description: 현재 로그인한 사용자의 정보를 수정합니다.
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phone:
 *                 type: string
 *                 description: 사용자 전화번호
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 내 정보 수정
router.put('/me', authenticateToken, async (ctx) => {
  try {
    const { name, phone, avatar } = ctx.request.body;
    const user = ctx.state.user;

    // 업데이트할 데이터 준비
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      ctx.status = 400;
      ctx.body = { error: '수정할 정보가 없습니다.' };
      return;
    }

    // 사용자 정보 업데이트
    await user.update(updateData);

    const { password: _, ...userWithoutPassword } = user.toJSON();

    ctx.body = {
      message: '프로필이 성공적으로 수정되었습니다.',
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Update profile error:', error);
    ctx.status = 500;
    ctx.body = { error: '프로필 수정 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/avatar:
 *   post:
 *     summary: 프로필 사진 업로드
 *     description: 사용자의 프로필 사진을 업로드하고 URL을 반환합니다.
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 프로필 사진
 *     responses:
 *       200:
 *         description: 프로필 사진 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 프로필 사진 업로드
router.post('/avatar', authenticateToken, upload.single('avatar'), async (ctx) => {
  try {
    const file = ctx.file;
    if (!file) {
      ctx.status = 400;
      ctx.body = { error: '파일이 업로드되지 않았습니다.' };
      return;
    }

    const user = ctx.state.user;
    
    // 외부 파일 서버로 업로드
    const formData = new FormData();
    
    // file.buffer를 Blob으로 변환하여 추가
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    
    let avatarUrl;
    // 외부 파일 서버에 업로드
    if (process.env.FILE_SERVER_URL) {
      const uploadResponse = await fetch(`${process.env.FILE_SERVER_URL}/file/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        const fileData = await uploadResponse.json();
        if (fileData.filename) {
          avatarUrl = `${process.env.FILE_SERVER_URL}/file/files/${fileData.filename}`;
        } else if (fileData.path) {
          avatarUrl = `${process.env.FILE_SERVER_URL}/file/files/${fileData.path}`;
        }
      }
    }
    
    if (!avatarUrl) {
      // 외부 파일 서버에 업로드하지 못한 경우 로컬 업로드 경로 사용
      avatarUrl = `${process.env.SERVER_URL || 'http://localhost:6010'}/api/uploads/${file.filename}`;
    }
    
    console.log('생성된 아바타 URL:', avatarUrl); // 디버깅용
    
    // 사용자 정보에 아바타 URL 업데이트
    await user.update({ avatar: avatarUrl });

    ctx.body = {
      message: '프로필 사진이 성공적으로 업로드되었습니다.',
      avatarUrl: avatarUrl
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    ctx.status = 400;
    ctx.body = { error: '프로필 사진 업로드 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 사용자 로그아웃을 처리합니다.
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', authenticateToken, async (ctx) => {
  try {
    // TODO: 토큰 블랙리스트에 추가하는 로직 구현 가능
    ctx.body = {
      message: '로그아웃되었습니다.'
    };
  } catch (error) {
    console.error('Logout error:', error);
    ctx.status = 500;
    ctx.body = { error: '로그아웃 처리 중 오류가 발생했습니다.' };
  }
});

export { router };
