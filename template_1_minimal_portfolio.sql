-- 템플릿 1: 미니멀 포트폴리오
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
        '미니멀 포트폴리오',
        '깔끔하고 모던한 디자인의 포트폴리오 템플릿',
        '<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>미니멀 포트폴리오</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.5; color: #2c3e50; background: #fff; font-weight: 300; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Header */
    .header { background: #fff; border-bottom: 1px solid #ecf0f1; position: sticky; top: 0; z-index: 100; }
    .header .container { display: flex; justify-content: space-between; align-items: center; padding: 24px 20px; }
    .logo { font-size: 20px; font-weight: 400; color: #2c3e50; letter-spacing: 1px; }
    .nav { display: flex; gap: 32px; }
    .nav a { text-decoration: none; color: #7f8c8d; font-weight: 300; font-size: 14px; letter-spacing: 0.5px; transition: color 0.2s ease; }
    .nav a:hover { color: #2c3e50; }
    
    /* About Section */
    .about { padding: 120px 0; text-align: center; }
    .title { font-size: 42px; font-weight: 300; color: #2c3e50; margin-bottom: 24px; line-height: 1.3; }
    .highlight { color: #3498db; font-weight: 400; }
    .description { font-size: 18px; color: #7f8c8d; max-width: 580px; margin: 0 auto 48px; line-height: 1.6; }
    .skills { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
    .skill { background: #f8f9fa; color: #5a6c7d; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: 300; border: 1px solid #ecf0f1; }
    
    /* Projects Section */
    .projects { padding: 100px 0; background: #f9fafb; }
    .section-title { font-size: 36px; font-weight: 700; color: #1f2937; text-align: center; margin-bottom: 60px; }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; }
    .project-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .project-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
    .project-image { width: 100%; height: 200px; overflow: hidden; }
    .project-image img { width: 100%; height: 100%; object-fit: cover; }
    .project-content { padding: 24px; }
    .project-content h3 { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
    .project-content p { color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
    .project-tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .project-tags span { background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
    
    /* Contact Section */
    .contact { padding: 100px 0; }
    .contact-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
    .contact-info { display: flex; flex-direction: column; gap: 24px; }
    .contact-item { display: flex; flex-direction: column; gap: 8px; }
    .contact-label { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .contact-value { font-size: 18px; color: #1f2937; font-weight: 500; }
    .social-links { display: flex; flex-direction: column; gap: 16px; }
    .social-link { text-decoration: none; color: #3b82f6; font-weight: 500; font-size: 16px; transition: color 0.2s ease; }
    .social-link:hover { color: #1d4ed8; }
    
    /* Footer */
    .footer { background: #1f2937; color: #9ca3af; text-align: center; padding: 40px 0; }
    .footer p { font-size: 14px; }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .container { padding: 0 16px; }
      .title { font-size: 36px; }
      .section-title { font-size: 28px; }
      .about, .projects, .contact { padding: 60px 0; }
      .contact-content { grid-template-columns: 1fr; gap: 40px; }
      .project-grid { grid-template-columns: 1fr; }
      .nav { gap: 20px; }
    }
    @media (max-width: 480px) {
      .title { font-size: 28px; }
      .description { font-size: 16px; }
      .header .container { padding: 16px; }
      .about, .projects, .contact { padding: 40px 0; }
    }
  </style>
</head>
<body>
  <div class="portfolio">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="logo">Portfolio</div>
        <nav class="nav">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>

    <!-- About Section -->
    <section id="about" class="about">
      <div class="container">
        <h1 class="title">안녕하세요, 저는 <span class="highlight">개발자</span>입니다</h1>
        <p class="description">
          사용자 경험을 중시하며, 깔끔하고 효율적인 코드를 작성하는 것을 좋아합니다.
          새로운 기술을 배우고 적용하는 것에 열정을 가지고 있습니다.
        </p>
        <div class="skills">
          <span class="skill">HTML/CSS</span>
          <span class="skill">JavaScript</span>
          <span class="skill">Vue.js</span>
          <span class="skill">Node.js</span>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="projects">
      <div class="container">
        <h2 class="section-title">프로젝트</h2>
        <div class="project-grid">
          <div class="project-card">
            <div class="project-image">
              <img src="https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Project+1" alt="Project 1" />
            </div>
            <div class="project-content">
              <h3>웹 애플리케이션</h3>
              <p>사용자 친화적인 인터페이스를 가진 모던 웹 애플리케이션</p>
              <div class="project-tags">
                <span>Vue.js</span>
                <span>Node.js</span>
              </div>
            </div>
          </div>
          
          <div class="project-card">
            <div class="project-image">
              <img src="https://via.placeholder.com/400x300/50E3C2/FFFFFF?text=Project+2" alt="Project 2" />
            </div>
            <div class="project-content">
              <h3>모바일 앱</h3>
              <p>반응형 디자인과 직관적인 사용자 경험을 제공하는 앱</p>
              <div class="project-tags">
                <span>React Native</span>
                <span>Firebase</span>
              </div>
            </div>
          </div>
          
          <div class="project-card">
            <div class="project-image">
              <img src="https://via.placeholder.com/400x300/F5A623/FFFFFF?text=Project+3" alt="Project 3" />
            </div>
            <div class="project-content">
              <h3>데이터 시각화</h3>
              <p>복잡한 데이터를 이해하기 쉽게 표현하는 대시보드</p>
              <div class="project-tags">
                <span>D3.js</span>
                <span>Python</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
      <div class="container">
        <h2 class="section-title">연락처</h2>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-label">이메일</span>
              <span class="contact-value">hello@example.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">전화번호</span>
              <span class="contact-value">010-1234-5678</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">위치</span>
              <span class="contact-value">서울, 대한민국</span>
            </div>
          </div>
          <div class="social-links">
            <a href="#" class="social-link">GitHub</a>
            <a href="#" class="social-link">LinkedIn</a>
            <a href="#" class="social-link">Twitter</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 Portfolio. All rights reserved.</p>
      </div>
    </footer>
  </div>
</body>
</html>',
        '',
        '',
        'portfolio',
        '["미니멀", "모던", "반응형"]',
        true,
        'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Project+1',
        '1.0.0',
        1247,
        0,
        0,
        'published',
        1,
        NOW(),
        NOW()
    );