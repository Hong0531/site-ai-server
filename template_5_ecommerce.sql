-- 템플릿 5: 쇼핑몰 기본
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
        '쇼핑몰 기본',
        '온라인 쇼핑몰을 위한 기본 템플릿',
        '<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>쇼핑몰 기본</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; } .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; } .header { background: #fff; border-bottom: 1px solid #e9ecef; padding: 20px 0; } .header-content { display: flex; align-items: center; justify-content: space-between; } .logo { font-size: 24px; font-weight: 700; color: #007bff; } .nav { display: flex; gap: 20px; } .nav a { color: #333; text-decoration: none; font-weight: 500; } .nav a:hover { color: #007bff; } .hero { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 80px 0; text-align: center; } .hero h1 { font-size: 48px; margin-bottom: 20px; } .hero p { font-size: 20px; margin-bottom: 30px; } .btn { display: inline-block; background: #fff; color: #007bff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; } .products { padding: 80px 0; } .products h2 { text-align: center; font-size: 36px; margin-bottom: 50px; } .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; } .product-card { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); } .product-image { width: 100%; height: 200px; object-fit: cover; } .product-content { padding: 20px; } .product-title { font-size: 20px; margin-bottom: 10px; } .product-price { font-size: 24px; font-weight: 700; color: #007bff; margin-bottom: 15px; } .add-to-cart { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%; }</style></head><body><header class="header"><div class="container"><div class="header-content"><div class="logo">ShopMall</div><nav class="nav"><a href="#home">홈</a><a href="#products">상품</a><a href="#about">소개</a><a href="#contact">연락처</a></nav></div></div></header><section class="hero"><div class="container"><h1>최고의 상품을 만나보세요</h1><p>품질과 가격을 모두 만족하는 쇼핑몰</p><a href="#products" class="btn">상품 보기</a></div></section><section id="products" class="products"><div class="container"><h2>인기 상품</h2><div class="product-grid"><div class="product-card"><img src="http://v1api.gosky.kr/file/files/test_backimage1_1c232094-aed4-4e49-b5c8-b6078e718eb6.jpg" alt="상품1" class="product-image" /><div class="product-content"><h3 class="product-title">프리미엄 상품 A</h3><div class="product-price">₩29,900</div><button class="add-to-cart">장바구니 담기</button></div></div><div class="product-card"><img src="http://v1api.gosky.kr/file/files/test_backimage2_ea4cfa7d-b40d-4473-be70-db0b750da3cf.jpg" alt="상품2" class="product-image" /><div class="product-content"><h3 class="product-title">베스트 상품 B</h3><div class="product-price">₩39,900</div><button class="add-to-cart">장바구니 담기</button></div></div><div class="product-card"><img src="http://v1api.gosky.kr/file/files/test_backimage3_2fc5c4ea-f4bc-41c1-8132-6186275f79fd.jpg" alt="상품3" class="product-image" /><div class="product-content"><h3 class="product-title">신상품 C</h3><div class="product-price">₩49,900</div><button class="add-to-cart">장바구니 담기</button></div></div></div></div></section></body></html>',
        '',
        '',
        'ecommerce',
        '["쇼핑몰", "상품", "장바구니"]',
        true,
        'http://v1api.gosky.kr/file/files/test_backimage1_1c232094-aed4-4e49-b5c8-b6078e718eb6.jpg',
        '1.0.0',
        2341,
        0,
        0,
        'published',
        1,
        NOW(),
        NOW()
    );