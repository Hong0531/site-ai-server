// src/routes/ai.js

import Router from 'koa-router';
import Activity from '../models/Activity.js';
import { authenticateToken } from '../middleware/auth.js';

const router = new Router();

// API 설정
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 프롬프트 생성 함수
function generatePrompt(prompt) {
  return `당신은 숙련된 웹 개발자입니다. 다음 사용자 요청에 따라 완전한 HTML 문서를 새로 작성하세요.

[사용자 요청]
"${prompt}"

[생성 지침]
1. <!DOCTYPE html>부터 시작하는 완전한 HTML5 문서를 작성하세요.
2. 시각적으로 아름답고 현대적인 반응형 디자인을 적용하세요.
3. CSS는 <style> 태그 내부에 포함하거나 필요한 경우 인라인 스타일을 사용할 수 있습니다.
4. JavaScript가 필요한 경우 <script> 태그 내부에 작성하세요.
5. 결과물에는 주석 없이 HTML 코드만 포함하세요.`;
}

// Gemini API 호출 함수
async function callGeminiAPI(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. GEMINI_API_KEY 환경변수를 설정해주세요.');
  }

  const fullPrompt = generatePrompt(prompt);

  const requestBody = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    }
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!result) throw new Error('Gemini API에서 유효한 응답을 받지 못했습니다.');
  
  // 마크다운 코드 블록 제거
  let cleanResult = result.trim();
  
  // ```html ... ``` 제거
  if (cleanResult.startsWith('```html')) {
    cleanResult = cleanResult.replace(/^```html\s*/, '');
  }
  if (cleanResult.startsWith('```')) {
    cleanResult = cleanResult.replace(/^```\s*/, '');
  }
  
  // 끝의 ``` 제거
  if (cleanResult.endsWith('```')) {
    cleanResult = cleanResult.replace(/\s*```$/, '');
  }
  
  return cleanResult.trim();
}

// OpenAI GPT API 호출 함수
async function callOpenAIAPI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. OPENAI_API_KEY 환경변수를 설정해주세요.');
  }

  const fullPrompt = generatePrompt(prompt);

  const requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '당신은 숙련된 웹 개발자입니다. HTML 코드만 반환하세요.'
      },
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4000
  };

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const result = data?.choices?.[0]?.message?.content;

  if (!result) throw new Error('OpenAI API에서 유효한 응답을 받지 못했습니다.');
  
  // 마크다운 코드 블록 제거
  let cleanResult = result.trim();
  
  // ```html ... ``` 제거
  if (cleanResult.startsWith('```html')) {
    cleanResult = cleanResult.replace(/^```html\s*/, '');
  }
  if (cleanResult.startsWith('```')) {
    cleanResult = cleanResult.replace(/^```\s*/, '');
  }
  
  // 끝의 ``` 제거
  if (cleanResult.endsWith('```')) {
    cleanResult = cleanResult.replace(/\s*```$/, '');
  }
  
  return cleanResult.trim();
}

// AI 모델 선택 함수
async function callAIAPI(model, prompt) {
  // model이 문자열이 아니거나 유효하지 않은 경우 기본값 설정
  const validModel = typeof model === 'string' && model.trim() ? model.trim() : 'gemini';
  
  console.log(`🔍 AI 모델 선택 - 입력: "${model}", 검증된 모델: "${validModel}"`);
  
  switch (validModel.toLowerCase()) {
    case 'gemini':
    case 'google':
      console.log(`✅ Gemini API 호출: ${validModel}`);
      return await callGeminiAPI(prompt);
    case 'gpt':
    case 'openai':
      console.log(`✅ OpenAI API 호출: ${validModel}`);
      return await callOpenAIAPI(prompt);
    default:
      console.log(`❌ 지원하지 않는 모델: ${validModel}`);
      throw new Error(`지원하지 않는 모델입니다: ${validModel}. 'gemini' 또는 'gpt'를 사용해주세요.`);
  }
}

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: AI로 HTML 코드 생성/수정
 *     description: AI 모델을 사용하여 HTML 코드를 생성하거나 기존 코드를 수정합니다.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: AI에게 전달할 프롬프트
 *               model:
 *                 type: string
 *                 enum: [gemini, gpt, google, openai]
 *                 default: gemini
 *                 description: 사용할 AI 모델
 *               projectId:
 *                 type: integer
 *                 description: 프로젝트 ID (선택사항)
 *     responses:
 *       200:
 *         description: HTML 코드 생성/수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 content:
 *                   type: string
 *                 prompt:
 *                   type: string
 *                 model:
 *                   type: string
 *                 projectId:
 *                   type: integer
 *                   nullable: true
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
// POST /ai/generate → AI로 HTML 코드 생성/수정
router.post('/generate', authenticateToken, async (ctx) => {
  try {
    const { prompt, model = 'gemini', projectId } = ctx.request.body || {};

    console.log(`📝 AI 생성 요청 - 프롬프트: "${prompt}", 모델: "${model}"`);

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '유효한 프롬프트가 제공되지 않았습니다.'
      };
      return;
    }

    const generatedHTML = await callAIAPI(model, prompt);

    // 사용된 모델 정보를 안전하게 가져오기
    const usedModel = typeof model === 'string' && model.trim() ? model.trim() : 'gemini';

    // 활동 로그 생성 (사용자 정보가 있을 때만)
    if (ctx.state.user && ctx.state.user.id) {
      try {
        await Activity.create({
          userId: ctx.state.user.id,
          projectId: projectId || null,
          type: 'code_updated',
          description: `AI(${usedModel})로 HTML 코드를 생성했습니다.`,
          metadata: {
            prompt,
            model: usedModel.toLowerCase(),
            contentLength: generatedHTML.length,
            projectId: projectId || null
          }
        });
      } catch (logError) {
        console.warn('활동 로그 생성 실패:', logError);
        // 활동 로그 생성 실패는 전체 요청을 실패시키지 않음
      }
    }

    ctx.body = {
      success: true,
      message: 'AI로 HTML 코드가 성공적으로 생성되었습니다.',
      content: generatedHTML, // AI가 생성한 HTML 코드를 응답에 포함
      prompt,
      model: usedModel.toLowerCase(),
      projectId: projectId || null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI 코드 생성 중 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'AI 코드 생성 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: AI 상태 확인
 *     description: 사용 가능한 AI 모델과 현재 상태를 확인합니다.
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI 상태 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 models:
 *                   type: object
 *                   properties:
 *                     gemini:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                         name:
 *                           type: string
 *                         key:
 *                           type: string
 *                     gpt:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                         name:
 *                           string
 *                         key:
 *                           type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
// GET /ai/status → AI 상태 확인
router.get('/status', async (ctx) => {
  try {
    const hasGeminiKey = !!GEMINI_API_KEY;
    const hasOpenAIKey = !!OPENAI_API_KEY;

    ctx.body = {
      success: true,
      models: {
        gemini: {
          available: hasGeminiKey,
          name: 'Google Gemini',
          key: hasGeminiKey ? '설정됨' : '설정되지 않음'
        },
        gpt: {
          available: hasOpenAIKey,
          name: 'OpenAI GPT',
          key: hasOpenAIKey ? '설정됨' : '설정되지 않음'
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI 상태 확인 중 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'AI 상태 확인 중 오류가 발생했습니다.',
      error: error.message
    };
  }
});

export { router };
