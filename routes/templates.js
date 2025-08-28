import Router from 'koa-router';
import { authenticateToken } from '../middleware/auth.js';
import Template from '../models/Template.js';
import { sequelize } from '../config/database.js';

const router = new Router();

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: 템플릿 목록 조회
 *     description: 페이지네이션, 검색, 필터링을 지원하는 템플릿 목록을 조회합니다.
 *     tags: [Templates]
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
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (이름, 설명, 태그)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: 상태 필터
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 공개 여부 필터
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: 정렬 기준
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 정렬 순서
 *     responses:
 *       200:
 *         description: 성공적으로 템플릿 목록을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TemplateListResponse'
 *       500:
 *         description: 서버 오류
 */
// 템플릿 목록 조회 (페이지네이션, 검색, 필터링 지원)
router.get('/', async (ctx) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      isPublic,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = ctx.query;

    const offset = (page - 1) * limit;
    
    // 검색 조건 구성
    const whereClause = {};
    
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.like]: `%${search}%` } },
        { description: { [sequelize.Op.like]: `%${search}%` } },
        { tags: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }

    // 정렬 조건
    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await Template.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'name', 'description', 'category', 'tags', 'isPublic',
        'thumbnail', 'version', 'downloadCount', 'viewCount', 'likeCount', 'status',
        'htmlContent', 'cssContent', 'jsContent', 'createdAt', 'updatedAt'
      ]
    });

    ctx.body = {
      success: true,
      data: {
        templates: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    };
  } catch (error) {
    console.error('템플릿 목록 조회 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '템플릿 목록을 불러오는 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: 특정 템플릿 조회
 *     description: ID로 특정 템플릿을 조회하고 조회수를 증가시킵니다.
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 템플릿 ID
 *     responses:
 *       200:
 *         description: 성공적으로 템플릿을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Template'
 *       404:
 *         description: 템플릿을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
// 특정 템플릿 조회 (조회수 증가)
router.get('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const template = await Template.findByPk(id);
    
    if (!template) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      };
      return;
    }

    // 조회수 증가
    await template.increment('viewCount');

    ctx.body = {
      success: true,
      data: template
    };
  } catch (error) {
    console.error('템플릿 조회 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '템플릿을 불러오는 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: 새 템플릿 생성
 *     description: 새로운 HTML 템플릿을 생성합니다. 인증이 필요합니다.
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - htmlContent
 *             properties:
 *               name:
 *                 type: string
 *                 description: 템플릿 이름
 *                 example: "랜딩 페이지 템플릿"
 *               description:
 *                 type: string
 *                 description: 템플릿 설명
 *                 example: "모던한 랜딩 페이지를 위한 템플릿"
 *               htmlContent:
 *                 type: string
 *                 description: HTML 코드 내용
 *                 example: "<div class='container'><h1>안녕하세요!</h1></div>"
 *               cssContent:
 *                 type: string
 *                 description: CSS 코드 내용
 *               jsContent:
 *                 type: string
 *                 description: JavaScript 코드 내용
 *               category:
 *                 type: string
 *                 description: 템플릿 카테고리
 *                 example: "landing"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 템플릿 태그 배열
 *                 example: ["랜딩페이지", "모던"]
 *               isPublic:
 *                 type: boolean
 *                 description: 공개 여부
 *                 default: true
 *               thumbnail:
 *                 type: string
 *                 description: 썸네일 이미지 URL
 *               version:
 *                 type: string
 *                 description: 템플릿 버전
 *                 default: "1.0.0"
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: 템플릿 상태
 *                 default: "draft"
 *     responses:
 *       201:
 *         description: 템플릿이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "템플릿이 성공적으로 생성되었습니다."
 *                 data:
 *                   $ref: '#/components/schemas/Template'
 *       400:
 *         description: 필수 필드가 누락되었습니다.
 *       401:
 *         description: 인증이 필요합니다.
 *       500:
 *         description: 서버 오류
 */
// 새 템플릿 생성 (인증 필요)
router.post('/', authenticateToken, async (ctx) => {
  try {
    const {
      name,
      description,
      htmlContent,
      cssContent,
      jsContent,
      category,
      tags,
      isPublic,
      thumbnail,
      version,
      status
    } = ctx.request.body;

    // 필수 필드 검증
    if (!name || !htmlContent) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '템플릿 이름과 HTML 내용은 필수입니다.'
      };
      return;
    }

    const template = await Template.create({
      name,
      description,
      htmlContent,
      cssContent,
      jsContent,
      category,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      thumbnail,
      version: version || '1.0.0',
      status: status || 'draft',
      userId: ctx.state.user.id
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '템플릿이 성공적으로 생성되었습니다.',
      data: template
    };
  } catch (error) {
    console.error('템플릿 생성 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '템플릿 생성 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

// 템플릿 수정 (인증 필요, 본인 템플릿만)
router.put('/:id', authenticateToken, async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const template = await Template.findByPk(id);
    
    if (!template) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      };
      return;
    }

    // 권한 확인 (본인 템플릿이거나 관리자인 경우)
    if (template.userId !== ctx.state.user.id && ctx.state.user.role !== 'admin') {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: '템플릿을 수정할 권한이 없습니다.'
      };
      return;
    }

    const {
      name,
      description,
      htmlContent,
      cssContent,
      jsContent,
      category,
      tags,
      isPublic,
      thumbnail,
      version,
      status
    } = ctx.request.body;

    // 업데이트할 필드만 구성
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (cssContent !== undefined) updateData.cssContent = cssContent;
    if (jsContent !== undefined) updateData.jsContent = jsContent;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (version !== undefined) updateData.version = version;
    if (status !== undefined) updateData.status = status;

    await template.update(updateData);

    ctx.body = {
      success: true,
      message: '템플릿이 성공적으로 수정되었습니다.',
      data: template
    };
  } catch (error) {
    console.error('템플릿 수정 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '템플릿 수정 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

// 템플릿 삭제 (인증 필요, 본인 템플릿만)
router.delete('/:id', authenticateToken, async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const template = await Template.findByPk(id);
    
    if (!template) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      };
      return;
    }

    // 권한 확인 (본인 템플릿이거나 관리자인 경우)
    if (template.userId !== ctx.state.user.id && ctx.state.user.role !== 'admin') {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: '템플릿을 삭제할 권한이 없습니다.'
      };
      return;
    }

    await template.destroy();

    ctx.body = {
      success: true,
      message: '템플릿이 성공적으로 삭제되었습니다.'
    };
  } catch (error) {
    console.error('템플릿 삭제 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '템플릿 삭제 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

// 템플릿 다운로드 (다운로드 수 증가)
router.post('/:id/download', async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const template = await Template.findByPk(id);
    
    if (!template) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      };
      return;
    }

    // 다운로드 수 증가
    await template.increment('downloadCount');

    ctx.body = {
      success: true,
      message: '다운로드가 완료되었습니다.',
      data: {
        id: template.id,
        name: template.name,
        downloadCount: template.downloadCount + 1
      }
    };
  } catch (error) {
    console.error('템플릿 다운로드 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '다운로드 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

// 템플릿 미리보기 (HTML 렌더링)
router.get('/:id/preview', async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const template = await Template.findByPk(id, {
      attributes: ['id', 'name', 'htmlContent', 'cssContent', 'jsContent']
    });
    
    if (!template) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      };
      return;
    }

    // HTML 미리보기 페이지 생성
    const previewHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} - 미리보기</title>
    <style>
        ${template.cssContent || ''}
        .preview-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #333;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 1000;
        }
        .preview-content {
            margin-top: 60px;
        }
    </style>
</head>
<body>
    <div class="preview-header">
        <strong>${template.name}</strong> - 템플릿 미리보기
        <button onclick="window.close()" style="margin-left: 20px; padding: 5px 10px;">닫기</button>
    </div>
    <div class="preview-content">
        ${template.htmlContent}
    </div>
    <script>
        ${template.jsContent || ''}
    </script>
</body>
</html>`;

    ctx.type = 'text/html';
    ctx.body = previewHtml;
  } catch (error) {
    console.error('템플릿 미리보기 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '미리보기를 불러오는 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

// 카테고리별 템플릿 통계
router.get('/stats/categories', async (ctx) => {
  try {
    const stats = await Template.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('viewCount')), 'avgViews'],
        [sequelize.fn('AVG', sequelize.col('downloadCount')), 'avgDownloads']
      ],
      where: {
        category: { [sequelize.Op.ne]: null }
      },
      group: ['category'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    ctx.body = {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('카테고리 통계 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '통계를 불러오는 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/**
 * @swagger
 * /api/templates/{id}/like:
 *   post:
 *     summary: 템플릿 좋아요 추가/제거
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
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
 */
router.post('/:id/like', authenticateToken, async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;

    // 템플릿 존재 확인
    const template = await Template.findByPk(id);
    if (!template) {
      ctx.status = 404;
      ctx.body = { success: false, message: '템플릿을 찾을 수 없습니다.' };
      return;
    }

    // 간단한 좋아요 로직 (실제로는 Like 테이블을 사용해야 함)
    const currentLikes = template.likeCount || 0;
    
    // 임시로 좋아요 수를 증가시킴 (실제로는 사용자별 좋아요 상태를 추적해야 함)
    await template.update({ likeCount: currentLikes + 1 });
    
    ctx.body = {
      success: true,
      liked: true,
      message: '좋아요가 추가되었습니다.',
      likeCount: template.likeCount
    };
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: '서버 오류가 발생했습니다.' };
  }
});

export { router };
