# 공식 bun 이미지 사용
FROM oven/bun:1

# curl 설치 (헬스체크용)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY bun.lock ./

# 의존성 설치
RUN bun install --frozen-lockfile

# 소스 코드 복사
COPY . .

# public 디렉토리 생성
RUN mkdir -p public

# 포트 노출
EXPOSE 6010

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f ${HEALTH_CHECK_URL:-http://localhost:6010}/ || exit 1

# 애플리케이션 실행
CMD ["bun", "run", "app.js"] 