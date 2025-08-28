#!/bin/bash

# API 테스트 스크립트
# 환경 변수로 서버 URL 설정 가능
BASE_URL=${SERVER_URL:-"http://localhost:4000"}

echo "🚀 API 테스트 시작"
echo "서버: $BASE_URL"
echo "---"
echo "시간: $(date)"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 결과 저장
PASS=0
FAIL=0

# 테스트 함수
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local expected_status="$4"
    
    echo -e "${BLUE}🔍 테스트: $name${NC}"
    echo "   $method $url"
    
    # API 호출
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -X GET "$url")
        status_code="${response: -3}"
        body="${response%???}"
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d '{"name":"테스트프로젝트","description":"API 테스트용"}')
        status_code="${response: -3}"
        body="${response%???}"
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "%{http_code}" -X PUT "$url" -H "Content-Type: application/json" -d '{"name":"수정된프로젝트"}')
        status_code="${response: -3}"
        body="${response%???}"
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "%{http_code}" -X DELETE "$url")
        status_code="${response: -3}"
        body="${response%???}"
    fi
    
    # 결과 확인
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "   ${GREEN}✅ 성공 (상태코드: $status_code)${NC}"
        ((PASS++))
    else
        echo -e "   ${RED}❌ 실패 (예상: $expected_status, 실제: $status_code)${NC}"
        echo "   응답: $body"
        ((FAIL++))
    fi
    echo ""
}

# 서버 상태 확인
echo -e "${YELLOW}📡 서버 상태 확인${NC}"
if curl -s "$BASE_URL/api" > /dev/null; then
    echo -e "${GREEN}✅ 서버 정상 실행 중${NC}"
else
    echo -e "${RED}❌ 서버 연결 실패${NC}"
    exit 1
fi
echo ""

# 1. GET /api/projects - 프로젝트 목록 조회 (인증 없음 = 401)
test_api "프로젝트 목록 조회" "GET" "$BASE_URL/api/projects" "401"

# 2. POST /api/projects - 새 프로젝트 생성 (인증 없음 = 401)
test_api "새 프로젝트 생성" "POST" "$BASE_URL/api/projects" "401"

# 3. GET /api/projects/:id - 특정 프로젝트 조회 (인증 없음 = 401)
test_api "특정 프로젝트 조회" "GET" "$BASE_URL/api/projects/test123" "401"

# 4. PUT /api/projects/:id - 프로젝트 수정 (인증 없음 = 401)
test_api "프로젝트 수정" "PUT" "$BASE_URL/api/projects/test123" "401"

# 5. DELETE /api/projects/:id - 프로젝트 삭제 (인증 없음 = 401)
test_api "프로젝트 삭제" "DELETE" "$BASE_URL/api/projects/test123" "401"

# 6. POST /api/projects/:id/duplicate - 프로젝트 복제 (인증 없음 = 401)
test_api "프로젝트 복제" "POST" "$BASE_URL/api/projects/test123/duplicate" "401"

# 7. POST /api/projects/:id/publish - 프로젝트 발행 (인증 없음 = 401)
test_api "프로젝트 발행" "POST" "$BASE_URL/api/projects/test123/publish" "401"

# 8. GET /api/projects/:id/download - 프로젝트 다운로드 (인증 없음 = 401)
test_api "프로젝트 다운로드" "GET" "$BASE_URL/api/projects/test123/download" "401"

# 9. GET /api/projects/:id/stats - 프로젝트 통계 (인증 없음 = 401)
test_api "프로젝트 통계" "GET" "$BASE_URL/api/projects/test123/stats" "401"

# 10. GET /api/activities - 활동 로그 조회 (인증 없음 = 401)
test_api "활동 로그 조회" "GET" "$BASE_URL/api/activities" "401"

# 11. GET /api/activities/recent - 최근 활동 조회 (인증 없음 = 401)
test_api "최근 활동 조회" "GET" "$BASE_URL/api/activities/recent" "401"

# 12. GET /api/activities/summary - 활동 요약 통계 (인증 없음 = 401)
test_api "활동 요약 통계" "GET" "$BASE_URL/api/activities/summary" "401"

# Swagger UI 테스트
echo -e "${YELLOW}📚 Swagger UI 테스트${NC}"
if curl -s -I "$BASE_URL/api/swagger" | grep -q "200"; then
    echo -e "${GREEN}✅ Swagger UI 정상${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Swagger UI 실패${NC}"
    ((FAIL++))
fi
echo ""

# 결과 요약
echo "=== 📊 테스트 결과 요약 ==="
echo -e "${GREEN}✅ 성공: $PASS${NC}"
echo -e "${RED}❌ 실패: $FAIL${NC}"
echo -e "총 테스트: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트 통과!${NC}"
    exit 0
else
    echo -e "${RED}⚠️ 일부 테스트 실패${NC}"
    exit 1
fi
