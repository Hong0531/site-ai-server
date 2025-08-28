#!/bin/bash

echo "=== 🚀 JWT 토큰으로 API 테스트 시작 ==="
echo "시간: $(date)"
echo ""

# JWT 토큰 설정
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJnb3NreUBnb3NreS5rciIsImlhdCI6MTc1NTYxNTQ3OSwiZXhwIjoxNzU2MjIwMjc5fQ.MXtoqaVL97qSgZHJolXWb5G-oL9nZUAINNLgvBi9yBY"
# JWT 인증 테스트 스크립트
# 환경 변수로 서버 URL 설정 가능
BASE_URL=${SERVER_URL:-"http://localhost:4000"}

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 테스트 결과 저장
PASS=0
FAIL=0

# 테스트 함수
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    echo -e "${BLUE}🔍 테스트: $name${NC}"
    echo "   $method $endpoint"
    
    # API 호출
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $JWT_TOKEN" -X GET "$BASE_URL$endpoint")
        status_code="${response: -3}"
        body="${response%???}"
    elif [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" -X POST "$BASE_URL$endpoint" -d "$data")
        else
            response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $JWT_TOKEN" -X POST "$BASE_URL$endpoint")
        fi
        status_code="${response: -3}"
        body="${response%???}"
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" -X PUT "$BASE_URL$endpoint" -d "$data")
        status_code="${response: -3}"
        body="${response%???}"
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $JWT_TOKEN" -X DELETE "$BASE_URL$endpoint")
        status_code="${response: -3}"
        body="${response%???}"
    fi
    
    # 결과 확인
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "   ${GREEN}✅ 성공 (상태코드: $status_code)${NC}"
        echo "   응답: $(echo "$body" | head -c 100)..."
        ((PASS++))
    else
        echo -e "   ${RED}❌ 실패 (상태코드: $status_code)${NC}"
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

# 1. 프로젝트 목록 조회
test_api "프로젝트 목록 조회" "GET" "/api/projects"

# 2. 새 프로젝트 생성
test_api "새 프로젝트 생성" "POST" "/api/projects" '{"name":"JWT 테스트 프로젝트","description":"JWT 토큰으로 생성된 테스트 프로젝트입니다."}'

# 3. 프로젝트 목록 다시 조회 (새로 생성된 프로젝트 확인)
test_api "프로젝트 목록 재조회" "GET" "/api/projects"

# 4. 특정 프로젝트 조회 (첫 번째 프로젝트 ID 사용)
echo -e "${YELLOW}📋 프로젝트 ID 추출 중...${NC}"
PROJECTS_RESPONSE=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$BASE_URL/api/projects")
FIRST_PROJECT_ID=$(echo "$PROJECTS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$FIRST_PROJECT_ID" ]; then
    echo "   첫 번째 프로젝트 ID: $FIRST_PROJECT_ID"
    echo ""
    
    # 5. 특정 프로젝트 상세 조회
    test_api "프로젝트 상세 조회" "GET" "/api/projects/$FIRST_PROJECT_ID"
    
    # 6. 프로젝트 수정
    test_api "프로젝트 수정" "PUT" "/api/projects/$FIRST_PROJECT_ID" '{"name":"수정된 프로젝트","description":"JWT 테스트로 수정되었습니다."}'
    
    # 7. 프로젝트 통계 조회
    test_api "프로젝트 통계" "GET" "/api/projects/$FIRST_PROJECT_ID/stats"
    
    # 8. 프로젝트 복제
    test_api "프로젝트 복제" "POST" "/api/projects/$FIRST_PROJECT_ID/duplicate"
    
    # 9. 프로젝트 발행
    test_api "프로젝트 발행" "POST" "/api/projects/$FIRST_PROJECT_ID/publish"
    
    # 10. 프로젝트 다운로드 (헤더만 확인)
    echo -e "${BLUE}🔍 테스트: 프로젝트 다운로드${NC}"
    echo "   GET /api/projects/$FIRST_PROJECT_ID/download"
    DOWNLOAD_HEADERS=$(curl -s -I -H "Authorization: Bearer $JWT_TOKEN" "$BASE_URL/api/projects/$FIRST_PROJECT_ID/download")
    if echo "$DOWNLOAD_HEADERS" | grep -q "200 OK"; then
        echo -e "   ${GREEN}✅ 성공 (상태코드: 200)${NC}"
        echo "   Content-Type: $(echo "$DOWNLOAD_HEADERS" | grep "Content-Type" | head -1)"
        ((PASS++))
    else
        echo -e "   ${RED}❌ 실패${NC}"
        ((FAIL++))
    fi
    echo ""
    
else
    echo -e "${RED}❌ 프로젝트 ID를 찾을 수 없습니다.${NC}"
    ((FAIL++))
    echo ""
fi

# 11. 활동 로그 조회
test_api "활동 로그 조회" "GET" "/api/activities"

# 12. 최근 활동 조회
test_api "최근 활동 조회" "GET" "/api/activities/recent"

# 13. 활동 요약 통계
test_api "활동 요약 통계" "GET" "/api/activities/summary"

# 결과 요약
echo "=== 📊 테스트 결과 요약 ==="
echo -e "${GREEN}✅ 성공: $PASS${NC}"
echo -e "${RED}❌ 실패: $FAIL${NC}"
echo -e "총 테스트: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트 통과! JWT 인증이 정상적으로 작동합니다.${NC}"
    exit 0
else
    echo -e "${RED}⚠️ 일부 테스트 실패${NC}"
    exit 1
fi
