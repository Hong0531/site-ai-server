/* src/routes/coding.js */

import Router from 'koa-router';
import fs from 'fs/promises';
import path from 'path';

const router = new Router();

// HTML 파일이 저장될 디렉토리 생성
const HTML_DIR = './public';
const HTML_FILE = 'index.html';

// 디렉토리가 없으면 생성하는 함수
async function ensureDirectoryExists() {
  try {
    await fs.access(HTML_DIR);
  } catch {
    await fs.mkdir(HTML_DIR, { recursive: true });
  }
}

/**
 * @swagger
 * /api/coding/update:
 *   post:
 *     summary: HTML 코드 저장
 *     description: 제공된 HTML 코드를 파일에 저장합니다.
 *     tags: [코딩]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 저장할 HTML 코드
 *     responses:
 *       200:
 *         description: 코드 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
/* POST /coding/update → 코드를 받아서 HTML 파일에 덮어씌우기 */
router.post('/update', async (ctx) => {
  try {
    const { code } = ctx.request.body;
    
    if (!code) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '코드가 제공되지 않았습니다.'
      };
      return;
    }

    // 디렉토리 확인 및 생성
    await ensureDirectoryExists();
    
    // HTML 파일 경로
    const filePath = path.join(HTML_DIR, HTML_FILE);
    
    // 코드를 HTML 파일에 덮어씌우기
    await fs.writeFile(filePath, code, 'utf8');
    
    ctx.body = {
      success: true,
      message: '코드가 성공적으로 HTML 파일에 저장되었습니다.',
      filePath: filePath,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('코드 저장 중 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '코드 저장 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/**
 * @swagger
 * /api/coding/view:
 *   get:
 *     summary: HTML 파일 내용 조회
 *     description: 현재 저장된 HTML 파일의 내용을 조회합니다.
 *     tags: [코딩]
 *     responses:
 *       200:
 *         description: 파일 내용 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 content:
 *                   type: string
 *                   nullable: true
 *                 filePath:
 *                   type: string
 *                 message:
 *                   type: string
 *                   nullable: true
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
/* GET /coding/view → 현재 HTML 파일 내용 조회 */
router.get('/view', async (ctx) => {
  try {
    const filePath = path.join(HTML_DIR, HTML_FILE);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      ctx.body = {
        success: true,
        content: content,
        filePath: filePath,
        timestamp: new Date().toISOString()
      };
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        ctx.body = {
          success: true,
          content: null,
          message: 'HTML 파일이 아직 생성되지 않았습니다.',
          filePath: filePath
        };
      } else {
        throw fileError;
      }
    }
    
  } catch (error) {
    console.error('파일 읽기 중 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '파일 읽기 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/**
 * @swagger
 * /api/coding/reset:
 *   delete:
 *     summary: HTML 파일 삭제
 *     description: 현재 저장된 HTML 파일을 삭제합니다.
 *     tags: [코딩]
 *     responses:
 *       200:
 *         description: 파일 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
/* DELETE /coding/reset → HTML 파일 삭제 */
router.delete('/reset', async (ctx) => {
  try {
    const filePath = path.join(HTML_DIR, HTML_FILE);
    
    try {
      await fs.unlink(filePath);
      ctx.body = {
        success: true,
        message: 'HTML 파일이 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString()
      };
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        ctx.body = {
          success: true,
          message: '삭제할 HTML 파일이 존재하지 않습니다.',
          timestamp: new Date().toISOString()
        };
      } else {
        throw fileError;
      }
    }
    
  } catch (error) {
    console.error('파일 삭제 중 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '파일 삭제 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/* GET /coding → HTML 페이지 렌더링 */
router.get('/', async (ctx) => {
  try {
    const filePath = path.join(HTML_DIR, HTML_FILE);
    
    try {
      const htmlContent = await fs.readFile(filePath, 'utf8');
      ctx.type = 'text/html';
      ctx.body = htmlContent;
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        // HTML 파일이 없으면 기본 페이지 보여주기
        ctx.type = 'text/html';
        ctx.body = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 코딩 플랫폼</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 60px;
        }
        
        .logo {
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            text-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .subtitle {
            font-size: 1.3rem;
            color: rgba(255,255,255,0.9);
            font-weight: 300;
            margin-bottom: 10px;
        }
        
        .status-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .status-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .status-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            box-shadow: 0 8px 16px rgba(255,107,107,0.3);
        }
        
        .status-icon i {
            font-size: 24px;
            color: white;
        }
        
        .status-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: #333;
        }
        
        .status-description {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 20px;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .progress-fill {
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 4px;
            transition: width 2s ease-in-out;
        }
        
        .api-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .api-title {
            font-size: 2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .api-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 30px;
        }
        
        .api-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #dee2e6;
            transition: all 0.3s ease;
        }
        
        .api-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        
        .api-method {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
        
        .method-post {
            background: #28a745;
            color: white;
        }
        
        .method-get {
            background: #007bff;
            color: white;
        }
        
        .method-delete {
            background: #dc3545;
            color: white;
        }
        
        .api-endpoint {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1rem;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .api-description {
            color: #666;
            font-size: 0.9rem;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .feature-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }
        
        .feature-icon i {
            font-size: 20px;
            color: white;
        }
        
        .feature-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        
        .feature-description {
            color: #666;
            font-size: 0.9rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 60px;
            color: rgba(255,255,255,0.8);
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px 15px;
            }
            
            .logo {
                font-size: 2.5rem;
            }
            
            .status-card, .api-section {
                padding: 24px;
            }
            
            .api-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .animate-pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 AI 코딩 플랫폼</div>
            <p class="subtitle">실시간 HTML 코드 업데이트 및 렌더링 시스템</p>
        </div>
        
        <div class="status-card">
            <div class="status-header">
                <div class="status-icon animate-pulse">
                    <i class="fas fa-code"></i>
                </div>
                <div>
                    <h2 class="status-title">현재 상태</h2>
                </div>
            </div>
            <p class="status-description">HTML 파일이 아직 생성되지 않았습니다. API를 사용하여 코드를 업로드하고 실시간으로 페이지를 업데이트해보세요!</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 25%"></div>
            </div>
            <p style="color: #666; font-size: 0.9rem;">준비 완료 - API 사용 가능</p>
        </div>
        
        <div class="api-section">
            <h2 class="api-title">🔧 API 엔드포인트</h2>
            <div class="api-grid">
                <div class="api-card">
                    <span class="api-method method-post">POST</span>
                    <div class="api-endpoint">/coding/update</div>
                    <div class="api-description">HTML 코드를 받아서 파일에 저장하고 페이지를 업데이트합니다.</div>
                </div>
                
                <div class="api-card">
                    <span class="api-method method-get">GET</span>
                    <div class="api-endpoint">/coding/view</div>
                    <div class="api-description">현재 저장된 HTML 파일의 내용을 JSON 형태로 조회합니다.</div>
                </div>
                
                <div class="api-card">
                    <span class="api-method method-delete">DELETE</span>
                    <div class="api-endpoint">/coding/reset</div>
                    <div class="api-description">저장된 HTML 파일을 삭제하고 초기 상태로 되돌립니다.</div>
                </div>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3 class="feature-title">실시간 업데이트</h3>
                <p class="feature-description">API 호출 즉시 HTML 페이지가 업데이트됩니다</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3 class="feature-title">안전한 저장</h3>
                <p class="feature-description">파일 시스템에 안전하게 HTML 코드를 저장합니다</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3 class="feature-title">반응형 디자인</h3>
                <p class="feature-description">모든 디바이스에서 완벽하게 작동합니다</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h3 class="feature-title">고성능</h3>
                <p class="feature-description">빠른 응답 속도와 효율적인 처리</p>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 AI 코딩 플랫폼. 모든 권리 보유.</p>
        </div>
    </div>
    
    <script>
        // 프로그레스 바 애니메이션
        setTimeout(() => {
            document.querySelector('.progress-fill').style.width = '100%';
        }, 500);
        
        // 카드 호버 효과
        document.querySelectorAll('.api-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    </script>
</body>
</html>`;
      } else {
        throw fileError;
      }
    }
    
  } catch (error) {
    console.error('HTML 페이지 렌더링 중 오류:', error);
    ctx.status = 500;
    ctx.body = `
<!DOCTYPE html>
<html>
<head>
    <title>오류 발생</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1 class="error">오류가 발생했습니다</h1>
    <p>서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
</body>
</html>`;
  }
});

export { router }; 