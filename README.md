# 🚀 SaaS Web Builder – Server

**Node.js 20 + Koa 2 + Sequelize(MySQL 8)** 백엔드 저장소입니다.

> 🎯 목적: 템플릿·플러그인 구조를 지원하는 멀티테넌트 SaaS REST API 제공

---

## ⚙️ 기술 스택

| 영역 | 기술 |
|------|------|
| **런타임** | Node.js 20 (Bun 1.x 호환) |
| **웹 프레임워크** | [Koa 2](https://koajs.com/) (JavaScript) |
| **ORM** | [Sequelize 6](https://sequelize.org/) + `sequelize-cli` |
| **데이터베이스** | MySQL 8.x (InnoDB, utf8mb4) |
| **인증** | JWT + Social OAuth (Google, Kakao) |
| **테스트** | Jest · Supertest(Koa) |
| **DevOps** | Docker Compose · GitHub Actions · AWS Lightsail |

---

## 📦 설치 및 실행

```bash
# 1. 의존성 설치
npm install            # 또는 bun install

# 2. 환경 변수 복사 및 설정
cp .env.example .env
# .env 파일을 편집하여 실제 값으로 설정

# 3. 로컬 DB 준비 (Docker)
docker compose up -d db

# 4. Sequelize 마이그레이션 & 시드
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 5. 개발 서버 실행
npm run dev            # nodemon app.js
```

---

## 🗂️ 프로젝트 구조

```
server/
├── app.js            # Koa 인스턴스 & 전역 미들웨어
├── routes/           # 기능별 Router (auth, tenant, site, plugin…)
├── middlewares/      # 공통 미들웨어 (auth, error, logger)
├── models/           # Sequelize 모델 & 관계 정의
├── migrations/       # Sequelize 마이그레이션
├── utils/            # 공용 유틸리티 함수
├── docker/
│   └── Dockerfile    # prod 이미지 빌드
└── docker-compose.yml # db 등 개발용 서비스
```

---

## 🔑 환경 변수 (.env)

**⚠️ 중요: .env 파일은 절대 Git에 커밋하지 마세요!**

| 변수 | 설명 | 필수 여부 |
|------|------|-----------|
| `DB_HOST` | DB 호스트 | ✅ |
| `DB_PORT` | MySQL 포트 | ✅ |
| `DB_USER` | DB 사용자 | ✅ |
| `DB_PASS` | DB 비밀번호 | ✅ |
| `DB_NAME` | DB 이름 | ✅ |
| `JWT_SECRET` | JWT 서명 키 (최소 32자) | ✅ |
| `PORT` | API 포트 | ✅ |
| `NODE_ENV` | 실행 모드 | ✅ |

### 보안 권장사항
- `JWT_SECRET`은 최소 32자 이상의 복잡한 문자열 사용
- 프로덕션 환경에서는 데이터베이스 비밀번호를 강력하게 설정
- 환경별로 다른 설정값 사용 (개발/스테이징/프로덕션)

---

## 🔒 보안 가이드라인

### 인증 및 권한
- JWT 토큰 만료 시간을 적절히 설정 (기본: 7일)
- 모든 보호된 라우트에 인증 미들웨어 적용
- 사용자 권한 검증을 모든 민감한 작업에 적용

### 데이터베이스 보안
- 데이터베이스 사용자에게 최소 권한만 부여
- SQL 인젝션 방지를 위해 Sequelize ORM 사용
- 민감한 데이터는 암호화하여 저장

### API 보안
- CORS 설정을 프로덕션 환경에 맞게 구성
- Rate limiting 적용하여 DDoS 공격 방지
- 입력 데이터 검증 및 sanitization 적용

### 환경 보안
- `.env` 파일을 `.gitignore`에 추가
- 프로덕션 환경 변수를 안전하게 관리
- 로그에 민감한 정보가 포함되지 않도록 주의

---

## 🧩 플러그인 시스템

- **Core**: Auth · Tenant · Site · Payment API
- **플러그인**: 예약(booking) · 리뷰(review) · 멤버십(membership) 등
- 플러그인마다 `routes/` + `middlewares/` + 모델·마이그레이션을 모듈 단위로 분리
- `tenant_id` 스코프 미들웨어로 설치/비활성화 온디맨드 지원

---

## 📚 Publication 시스템

- **프로젝트 게시**: 프로젝트를 게시할 때마다 `publications` 테이블에 버전별로 저장
- **버전 관리**: 각 게시마다 자동으로 버전 번호 부여 (v1, v2, v3...)
- **내용 보존**: 게시 시점의 HTML 코드, 설정, 메타데이터를 완벽하게 보존
- **활동 추적**: 게시 이력과 통계 정보를 `activities` 테이블에 기록
- **공개 목록**: 게시된 프로젝트들을 검색하고 조회할 수 있는 API 제공

---

## 📊 프로젝트 로그 시스템

- **활동 추적**: 프로젝트 생성, 수정, 삭제, 발행, 조회 등의 모든 활동을 자동으로 로깅
- **상세 정보**: 각 로그에는 사용자 ID, 프로젝트 ID, 액션 타입, 설명, 메타데이터, IP 주소, 사용자 에이전트 등이 포함
- **통계 제공**: 액션별 로그 수, 일별 통계, 상위 프로젝트/사용자 등의 통계 정보 제공
- **필터링**: 액션, 프로젝트 ID, 사용자 ID, 날짜 범위 등으로 로그를 필터링하여 조회 가능

---

## 🎨 템플릿 시스템

- **HTML 템플릿 관리**: HTML, CSS, JavaScript 코드를 포함한 완전한 웹 템플릿 저장 및 관리
- **카테고리 분류**: 랜딩 페이지, 블로그, 포트폴리오, 이커머스, 대시보드 등 카테고리별 분류
- **태그 시스템**: 템플릿 검색을 위한 태그 기반 분류 및 검색
- **버전 관리**: 템플릿 버전 관리 및 상태 관리 (초안, 발행됨, 보관됨)
- **미리보기 기능**: HTML 렌더링을 통한 실시간 템플릿 미리보기
- **통계 추적**: 조회수, 다운로드 수 등 사용 통계 제공
- **권한 관리**: 사용자별 템플릿 소유권 및 공개/비공개 설정

---

## 🛠️ 스크립트

| 명령 | 작업 |
|------|------|
| `npm run dev` | nodemon 핫리로드 개발 모드 |
| `npm run start` | 프로덕션 실행 |
| `npx sequelize-cli db:migrate` | 마이그레이션 실행 |
| `npx sequelize-cli db:seed:all` | 시드 데이터 삽입 |

---

## 📈 API 문서

- `/api/docs` → Swagger UI 자동 생성

---

## 📅 로드맵

- [ ] 멀티테넌트 스코프 완성 (`tenant_id` 핸들링)
- [ ] 결제 Webhook 파이프라인 구축
- [ ] SaaS 플러그인 SDK & Webhook 문서화
- [ ] Prometheus + Grafana 모니터링 대시보드
- [ ] 보안 강화 및 취약점 점검

---


## 📝 라이선스

본 저장소는 내부 상업용 SaaS 백엔드로, 별도 허가 없이 복제·배포·상업적 이용을 금합니다.

---

## 🚨 보안 이슈 신고

보안 취약점을 발견하신 경우, 즉시 개발팀에 연락해주세요.
공개적으로 이슈를 등록하지 마시고, 비공개 채널을 통해 연락해주세요.

---

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 20.x 이상
- MySQL 8.x
- Docker & Docker Compose

### 권장 개발 도구
- VS Code + ESLint 확장
- MySQL Workbench 또는 DBeaver
- Postman 또는 Insomnia (API 테스트)
