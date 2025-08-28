-- 템플릿 3: 기업 사이트 A
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
        '기업 사이트 A',
        '전문적이고 신뢰감 있는 기업 사이트',
        '<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>기업 사이트 A</title><style>:root { --primary: #2563eb; --primary-600: #1d4ed8; --text-strong: #0f172a; --text: #334155; --muted: #64748b; --bg: #ffffff; --surface: #ffffff; --ring: rgba(37, 99, 235, 0.18); --border: rgba(2, 6, 23, 0.08); } * { box-sizing: border-box; } body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; color: var(--text); background: #fff; } .container { max-width: 1120px; margin: 0 auto; padding: 0 20px; } .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px 18px; border-radius:10px; font-weight:700; cursor:pointer; text-decoration:none; border:1px solid transparent; transition: .2s ease; } .btn-primary { background: var(--primary); color: #fff; } .btn-primary:hover { background: var(--primary-600); } .btn-outline { background: transparent; color: var(--primary); border-color: var(--primary); } .section { padding: 72px 0; } .section-header { text-align:center; margin-bottom: 28px; } .section-header h2 { margin: 0 0 10px; font-size: 30px; font-weight: 800; color: var(--text-strong); } .section-header p { margin: 0; color: #475569; } .hero { background: linear-gradient(180deg, #ffffff 0%, rgba(240,245,255,0.7) 35%, #ffffff 100%); padding: 80px 0 64px; } .hero-grid { display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; } .eyebrow { display:inline-block; font-weight:600; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color: var(--primary); background: rgba(37,99,235,.08); border:1px solid var(--ring); padding:6px 10px; border-radius:999px; margin-bottom:14px; } .headline { font-size: 42px; line-height: 1.15; font-weight: 800; margin: 0 0 12px; color: var(--text-strong); } .subhead { font-size: 18px; line-height: 1.6; color: var(--text); margin: 0 0 22px; } .hero-quick { display:flex; gap: 16px; margin-top: 18px; color: #475569; } .visual { border-radius:20px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,.08); background:#e2e8f0; } .visual img { width: 100%; height: 360px; object-fit: cover; display:block; }</style></head><body><header class="site-header"><div class="container header-inner"><div class="logo"><div class="logo-mark">A</div>기업 사이트 A</div><nav class="nav"><a href="#about">회사소개</a><a href="#services">서비스</a><a href="#portfolio">포트폴리오</a><a href="#testimonials">후기</a><a href="#news">뉴스</a><a href="#contact">문의</a></nav><div class="nav-cta"><a class="btn btn-primary" href="#contact">문의하기</a></div></div></header><section class="hero"><div class="container hero-grid"><div><div class="eyebrow">Trusted by leading companies</div><h1 class="headline">신뢰와 혁신으로 비즈니스를 성장시키는 파트너</h1><p class="subhead">핵심 서비스에 집중한 전문 솔루션으로 고객의 성장을 가속합니다.</p><div><a class="btn btn-primary" href="#contact">상담 요청</a><a class="btn btn-outline" href="#services" style="margin-left:8px">서비스 소개</a></div><div class="hero-quick"><span>✔ 10+년 업력</span><span>✔ 300+ 프로젝트</span><span>✔ 만족도 4.9/5.0</span></div></div><div class="visual"><img src="http://v1api.gosky.kr/file/files/test_backimage1_1c232094-aed4-4e49-b5c8-b6078e718eb6.jpg" alt="Company Visual"/></div></div></section></body></html>',
        '',
        '',
        'business',
        '["전문적", "신뢰감", "기업"]',
        true,
        'http://v1api.gosky.kr/file/files/test_backimage2_ea4cfa7d-b40d-4473-be70-db0b750da3cf.jpg',
        '1.0.0',
        1563,
        0,
        0,
        'published',
        1,
        NOW(),
        NOW()
    );