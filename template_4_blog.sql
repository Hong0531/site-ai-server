-- 템플릿 4: 블로그 템플릿
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
        '블로그 템플릿',
        '독서와 지식을 공유하는 블로그',
        '<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>블로그 템플릿</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; } .container { max-width: 800px; margin: 0 auto; padding: 0 20px; } .header { background: #fff; border-bottom: 1px solid #e9ecef; padding: 20px 0; } .header h1 { font-size: 24px; font-weight: 700; color: #212529; } .nav { margin-top: 15px; } .nav a { color: #6c757d; text-decoration: none; margin-right: 20px; font-weight: 500; } .nav a:hover { color: #495057; } .main { padding: 40px 0; } .post { background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .post h2 { font-size: 28px; margin-bottom: 15px; color: #212529; } .post-meta { color: #6c757d; font-size: 14px; margin-bottom: 20px; } .post-content { line-height: 1.8; color: #495057; } .sidebar { background: #fff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .sidebar h3 { font-size: 18px; margin-bottom: 15px; color: #212529; } .tag { display: inline-block; background: #e9ecef; color: #495057; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 12px; }</style></head><body><header class="header"><div class="container"><h1>독서 블로그</h1><nav class="nav"><a href="#home">홈</a><a href="#books">도서</a><a href="#reviews">서평</a><a href="#about">소개</a></nav></div></header><main class="main"><div class="container"><div class="post"><h2>오늘의 독서: "생각하는 방법"</h2><div class="post-meta">2024년 8월 15일 | 카테고리: 자기계발</div><div class="post-content"><p>이 책은 우리가 어떻게 생각하고, 어떻게 더 나은 생각을 할 수 있는지에 대해 다룹니다. 저자의 경험과 연구를 바탕으로 한 실용적인 조언들이 가득합니다.</p><p>특히 인상 깊었던 부분은 "생각의 질을 높이는 7가지 방법"이었습니다. 이 방법들을 실천해보니 정말로 생각이 더 명확해지고 깊어지는 것을 느낄 수 있었습니다.</p></div></div></div></main></body></html>',
        '',
        '',
        'blog',
        '["독서", "서평", "지식"]',
        true,
        'http://v1api.gosky.kr/file/files/test_backimage3_2fc5c4ea-f4bc-41c1-8132-6186275f79fd.jpg',
        '1.0.0',
        756,
        0,
        0,
        'published',
        1,
        NOW(),
        NOW()
    );