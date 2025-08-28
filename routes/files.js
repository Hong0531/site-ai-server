import Router from 'koa-router';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import multer from '@koa/multer';
import File from '../models/File.js';
import { Op } from 'sequelize';
import path from 'path';
import { promises as fs, createReadStream } from 'fs';
import { fileURLToPath } from 'url';

/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 파일 고유 ID
 *         filename:
 *           type: string
 *           description: 서버에 저장된 파일명
 *         originalName:
 *           type: string
 *           description: 원본 파일명
 *         fileSize:
 *           type: integer
 *           description: 파일 크기 (bytes)
 *         mimeType:
 *           type: string
 *           description: 파일 MIME 타입
 *         description:
 *           type: string
 *           nullable: true
 *           description: 파일 설명
 *         isPublic:
 *           type: boolean
 *           description: 공개 여부
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 업로드 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 시간
 *     
 *     FileUploadRequest:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: 업로드할 파일
 *         description:
 *           type: string
 *           description: 파일 설명
 *         isPublic:
 *           type: boolean
 *           default: false
 *           description: 공개 여부
 *     
 *     FileListResponse:
 *       type: object
 *       properties:
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/File'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalItems:
 *               type: integer
 *             itemsPerPage:
 *               type: integer
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = new Router();

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../uploads');
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir().then(() => cb(null, uploadDir)).catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    // 고유한 파일명 생성 (timestamp + random + 원본확장자)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: 단일 파일 업로드
 *     description: 사용자가 파일을 업로드합니다.
 *     tags: [파일 관리]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FileUploadRequest'
 *     responses:
 *       201:
 *         description: 파일 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 파일이 성공적으로 업로드되었습니다.
 *                 file:
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 파일 업로드 (단일 파일)
router.post('/upload', authenticateToken, upload.single('file'), async (ctx) => {
  try {
    const file = ctx.file;
    if (!file) {
      ctx.status = 400;
      ctx.body = { error: '업로드할 파일이 없습니다.' };
      return;
    }

    const { description, isPublic } = ctx.request.body;
    const user = ctx.state.user;

    // 파일 정보 저장
    const fileRecord = await File.create({
      userId: user.id,
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      description: description || null,
      isPublic: isPublic === 'true'
    });

    ctx.status = 201;
    ctx.body = {
      message: '파일이 성공적으로 업로드되었습니다.',
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        description: fileRecord.description,
        isPublic: fileRecord.isPublic,
        createdAt: fileRecord.createdAt
      }
    };
  } catch (error) {
    console.error('File upload error:', error);
    ctx.status = 500;
    ctx.body = { error: '파일 업로드 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: 다중 파일 업로드
 *     description: 여러 파일을 동시에 업로드합니다 (최대 5개).
 *     tags: [파일 관리]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 파일들
 *               description:
 *                 type: string
 *                 description: 파일 설명
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: 공개 여부
 *     responses:
 *       201:
 *         description: 다중 파일 업로드 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 파일 업로드 (다중 파일)
router.post('/upload-multiple', authenticateToken, upload.array('files', 5), async (ctx) => {
  try {
    const files = ctx.files;
    if (!files || files.length === 0) {
      ctx.status = 400;
      ctx.body = { error: '업로드할 파일이 없습니다.' };
      return;
    }

    const { description, isPublic } = ctx.request.body;
    const user = ctx.state.user;
    const uploadedFiles = [];

    // 각 파일에 대해 레코드 생성
    for (const file of files) {
      const fileRecord = await File.create({
        userId: user.id,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        description: description || null,
        isPublic: isPublic === 'true'
      });

      uploadedFiles.push({
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        description: fileRecord.description,
        isPublic: fileRecord.isPublic,
        createdAt: fileRecord.createdAt
      });
    }

    ctx.status = 201;
    ctx.body = {
      message: `${uploadedFiles.length}개의 파일이 성공적으로 업로드되었습니다.`,
      files: uploadedFiles
    };
  } catch (error) {
    console.error('Multiple file upload error:', error);
    ctx.status = 500;
    ctx.body = { error: '파일 업로드 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/files/my-files:
 *   get:
 *     summary: 내 파일 목록 조회
 *     description: 현재 로그인한 사용자의 파일 목록을 조회합니다.
 *     tags: [파일 관리]
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
 *           maximum: 100
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 파일명 검색어
 *     responses:
 *       200:
 *         description: 파일 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileListResponse'
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
// 내 파일 목록 조회
router.get('/my-files', authenticateToken, async (ctx) => {
  try {
    const user = ctx.state.user;
    const { page = 1, limit = 20, search } = ctx.query;
    
    const offset = (page - 1) * limit;
    const whereClause = { userId: user.id };
    
    if (search) {
      whereClause.originalName = { [Op.like]: `%${search}%` };
    }

    const { count, rows: files } = await File.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    ctx.body = {
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        description: file.description,
        isPublic: file.isPublic,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  } catch (error) {
    console.error('Get my files error:', error);
    ctx.status = 500;
    ctx.body = { error: '파일 목록 조회 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/files/public-files:
 *   get:
 *     summary: 공개 파일 목록 조회
 *     description: 모든 사용자가 공개한 파일 목록을 조회합니다.
 *     tags: [파일 관리]
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
 *         description: 파일명 검색어
 *     responses:
 *       200:
 *         description: 공개 파일 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
// 공개 파일 목록 조회
router.get('/public-files', async (ctx) => {
  try {
    const { page = 1, limit = 20, search } = ctx.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { isPublic: true };
    if (search) {
      whereClause.originalName = { [Op.like]: `%${search}%` };
    }

    const { count, rows: files } = await File.findAndCountAll({
      where: whereClause,
      include: [{
        model: User.sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    ctx.body = {
      files: files.map(file => ({
        id: file.id,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        description: file.description,
        createdAt: file.createdAt,
        user: file.user
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  } catch (error) {
    console.error('Get public files error:', error);
    ctx.status = 500;
    ctx.body = { error: '공개 파일 목록 조회 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/files/download/{id}:
 *   get:
 *     summary: 파일 다운로드
 *     description: 파일을 다운로드합니다. 공개 파일이거나 소유자인 경우만 다운로드 가능합니다.
 *     tags: [파일 관리]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 파일 ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 파일 다운로드 성공
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 파일을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 파일 다운로드
router.get('/download/:id', optionalAuth, async (ctx) => {
  try {
    const fileId = ctx.params.id;
    const file = await File.findByPk(fileId);
    
    if (!file) {
      ctx.status = 404;
      ctx.body = { error: '파일을 찾을 수 없습니다.' };
      return;
    }

    // 공개 파일이거나 파일 소유자인 경우만 다운로드 가능
    if (!file.isPublic && (!ctx.state.user || ctx.state.user.id !== file.userId)) {
      ctx.status = 403;
      ctx.body = { error: '이 파일에 대한 접근 권한이 없습니다.' };
      return;
    }

    // 파일 존재 확인
    try {
      await fs.access(file.filePath);
    } catch {
      ctx.status = 404;
      ctx.body = { error: '파일이 서버에 존재하지 않습니다.' };
      return;
    }

    // 파일 스트림으로 응답
    ctx.attachment(file.originalName);
    ctx.type = file.mimeType;
    ctx.body = createReadStream(file.filePath);
  } catch (error) {
    console.error('File download error:', error);
    ctx.status = 500;
    ctx.body = { error: '파일 다운로드 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   put:
 *     summary: 파일 정보 수정
 *     description: 파일의 설명이나 공개 여부를 수정합니다.
 *     tags: [파일 관리]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 파일 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: 파일 설명
 *               isPublic:
 *                 type: boolean
 *                 description: 공개 여부
 *     responses:
 *       200:
 *         description: 파일 정보 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 파일을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 파일 정보 수정
router.put('/:id', authenticateToken, async (ctx) => {
  try {
    const fileId = ctx.params.id;
    const { description, isPublic } = ctx.request.body;
    const user = ctx.state.user;

    const file = await File.findOne({
      where: { id: fileId, userId: user.id }
    });

    if (!file) {
      ctx.status = 404;
      ctx.body = { error: '파일을 찾을 수 없습니다.' };
      return;
    }

    // 업데이트할 데이터 준비
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic === 'true';

    if (Object.keys(updateData).length === 0) {
      ctx.status = 400;
      ctx.body = { error: '수정할 정보가 없습니다.' };
      return;
    }

    await file.update(updateData);

    ctx.body = {
      message: '파일 정보가 성공적으로 수정되었습니다.',
      file: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        description: file.description,
        isPublic: file.isPublic,
        updatedAt: file.updatedAt
      }
    };
  } catch (error) {
    console.error('Update file error:', error);
    ctx.status = 500;
    ctx.body = { error: '파일 정보 수정 중 오류가 발생했습니다.' };
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: 파일 삭제
 *     description: 파일을 삭제합니다. 소유자만 삭제할 수 있습니다.
 *     tags: [파일 관리]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 파일 ID
 *     responses:
 *       200:
 *         description: 파일 삭제 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 파일을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 파일 삭제
router.delete('/:id', authenticateToken, async (ctx) => {
  try {
    const fileId = ctx.params.id;
    const user = ctx.state.user;

    const file = await File.findOne({
      where: { id: fileId, userId: user.id }
    });

    if (!file) {
      ctx.status = 404;
      ctx.body = { error: '파일을 찾을 수 없습니다.' };
      return;
    }

    // 실제 파일 삭제
    try {
      await fs.unlink(file.filePath);
    } catch (unlinkError) {
      console.warn('파일 삭제 실패 (DB 레코드는 삭제됨):', unlinkError);
    }

    // DB 레코드 삭제
    await file.destroy();

    ctx.body = {
      message: '파일이 성공적으로 삭제되었습니다.'
    };
  } catch (error) {
    console.error('Delete file error:', error);
    ctx.status = 500;
    ctx.body = { error: '파일 삭제 중 오류가 발생했습니다.' };
  }
});

export { router };
