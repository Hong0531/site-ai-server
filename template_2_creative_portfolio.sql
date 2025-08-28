-- 템플릿 2: 크리에이티브 포트폴리오
INSERT INTO
    templates (
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
        downloadCount,
        viewCount,
        likeCount,
        status,
        userId,
        createdAt,
        updatedAt
    )
VALUES (
        '크리에이티브 포트폴리오',
        '창의적이고 독특한 디자인의 포트폴리오',
        '<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>크리에이티브 포트폴리오</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #ffffff; overflow-x: hidden; } .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; } .hero { position: relative; min-height: 100vh; display: flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow: hidden; } .hero-content { position: relative; z-index: 2; width: 100%; } .hero-content .container { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; } .hero-title { font-size: 4rem; font-weight: 800; color: #ffffff; margin-bottom: 20px; line-height: 1.1; } .btn { padding: 15px 30px; border: none; border-radius: 50px; font-size: 1rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.3s ease; display: inline-block; } .btn-primary { background: #ffffff; color: #667eea; } .btn-primary:hover { background: #f8f9fa; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); } .btn-outline { background: transparent; color: #ffffff; border: 2px solid #ffffff; } .btn-outline:hover { background: #ffffff; color: #667eea; transform: translateY(-2px); }</style></head><body><div class="creative-portfolio"><section class="hero"><div class="hero-content"><div class="container"><div class="hero-text"><h1 class="hero-title">Creative Portfolio</h1><p>아이디어를 시각적 경험으로 만드는 크리에이터</p><div class="hero-cta"><button class="btn btn-primary">프로젝트 보기</button><button class="btn btn-outline">연락하기</button></div></div></div></div></section></div></body></html>',
        '',
        '',
        'portfolio',
        '["크리에이티브", "독특", "애니메이션"]',
        true,
        'http://v1api.gosky.kr/file/files/test_backimage2_ea4cfa7d-b40d-4473-be70-db0b750da3cf.jpg',
        '1.0.0',
        892,
        0,
        0,
        'published',
        1,
        NOW(),
        NOW()
    );