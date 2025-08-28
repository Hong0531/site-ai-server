-- 템플릿 6: 랜딩 페이지
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
        '랜딩 페이지',
        '고객 전환을 위한 효과적인 랜딩 페이지',
        '<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>랜딩 페이지</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; } .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; } .header { background: #fff; border-bottom: 1px solid #e9ecef; padding: 20px 0; position: sticky; top: 0; z-index: 100; } .header-content { display: flex; align-items: center; justify-content: space-between; } .logo { font-size: 24px; font-weight: 700; color: #007bff; } .nav { display: flex; gap: 20px; } .nav a { color: #333; text-decoration: none; font-weight: 500; } .nav a:hover { color: #007bff; } .hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 100px 0; text-align: center; } .hero h1 { font-size: 48px; margin-bottom: 20px; } .hero p { font-size: 20px; margin-bottom: 30px; opacity: 0.9; } .btn { display: inline-block; background: #fff; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 0 10px; } .btn-outline { background: transparent; color: #fff; border: 2px solid #fff; } .features { padding: 80px 0; background: #f8f9fa; } .features h2 { text-align: center; font-size: 36px; margin-bottom: 50px; } .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; } .feature-card { background: #fff; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); } .feature-icon { font-size: 48px; margin-bottom: 20px; } .feature-title { font-size: 20px; margin-bottom: 15px; } .cta { padding: 80px 0; text-align: center; background: #007bff; color: white; } .cta h2 { font-size: 36px; margin-bottom: 20px; } .cta p { font-size: 18px; margin-bottom: 30px; opacity: 0.9; }</style></head><body><header class="header"><div class="container"><div class="header-content"><div class="logo">LandingPage</div><nav class="nav"><a href="#home">홈</a><a href="#features">특징</a><a href="#pricing">가격</a><a href="#contact">연락처</a></nav></div></div></header><section class="hero"><div class="container"><h1>혁신적인 솔루션으로 비즈니스를 성장시키세요</h1><p>고객의 니즈를 정확히 파악하고 최적의 솔루션을 제공합니다</p><a href="#features" class="btn">자세히 보기</a><a href="#contact" class="btn btn-outline">무료 상담</a></div></section><section id="features" class="features"><div class="container"><h2>주요 특징</h2><div class="feature-grid"><div class="feature-card"><div class="feature-icon">*</div><h3 class="feature-title">빠른 성장</h3><p>효율적인 프로세스로 빠른 결과를 제공합니다</p></div><div class="feature-card"><div class="feature-icon">*</div><h3 class="feature-title">혁신적 아이디어</h3><p>최신 트렌드를 반영한 창의적인 솔루션</p></div><div class="feature-card"><div class="feature-icon">*</div><h3 class="feature-title">정확한 타겟팅</h3><p>데이터 기반의 정확한 고객 타겟팅</p></div></div></div></section><section class="cta"><div class="container"><h2>지금 시작하세요</h2><p>무료 상담을 통해 맞춤형 솔루션을 제안해드립니다</p><a href="#contact" class="btn" style="background: #fff; color: #007bff;">상담 신청</a></div></section></body></html>',
        '',
        '',
        'landing',
        '["랜딩페이지", "전환", "마케팅"]',
        true,
        'http://v1api.gosky.kr/file/files/test_backimage2_ea4cfa7d-b40d-4473-be70-db0b750da3cf.jpg',
        '1.0.0',
        1892,
        0,
        0,
        'published',
        1,
        NOW(),
        NOW()
    );