import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SaaS Web Builder API',
      version: '1.0.0',
      description: '템플릿 기반 웹사이트 제작 SaaS 플랫폼 API',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Publications',
        description: '게시된 프로젝트 관련 API (게시, 게시 취소, 게시 목록 조회, 버전별 조회 등)'
      },
      {
        name: 'Templates',
        description: 'HTML 템플릿 관리 API (생성, 수정, 삭제, 검색, 미리보기 등)'
      },
      {
        name: 'Likes',
        description: '템플릿 좋아요 관리 API (좋아요 추가/제거, 상태 확인, 목록 조회 등)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Template: {
          type: 'object',
          description: 'HTML 템플릿을 저장하는 모델',
          properties: {
            id: {
              type: 'integer',
              description: '템플릿 고유 ID'
            },
            name: {
              type: 'string',
              description: '템플릿 이름'
            },
            description: {
              type: 'string',
              description: '템플릿 설명'
            },
            htmlContent: {
              type: 'string',
              description: 'HTML 코드 내용'
            },
            cssContent: {
              type: 'string',
              description: 'CSS 코드 내용'
            },
            jsContent: {
              type: 'string',
              description: 'JavaScript 코드 내용'
            },
            category: {
              type: 'string',
              description: '템플릿 카테고리'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: '템플릿 태그 배열'
            },
            isPublic: {
              type: 'boolean',
              description: '공개 여부'
            },
            thumbnail: {
              type: 'string',
              description: '썸네일 이미지 URL'
            },
            version: {
              type: 'string',
              description: '템플릿 버전'
            },
            downloadCount: {
              type: 'integer',
              description: '다운로드 횟수'
            },
            viewCount: {
              type: 'integer',
              description: '조회 횟수'
            },
            likeCount: {
              type: 'integer',
              description: '좋아요 수'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: '템플릿 상태'
            },
            userId: {
              type: 'integer',
              description: '템플릿 생성자 ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '생성 일시'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '수정 일시'
            }
          }
        },
        TemplateListResponse: {
          type: 'object',
          description: '템플릿 목록 응답',
          properties: {
            templates: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Template'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'integer',
                  description: '현재 페이지'
                },
                totalPages: {
                  type: 'integer',
                  description: '전체 페이지 수'
                },
                totalItems: {
                  type: 'integer',
                  description: '전체 항목 수'
                },
                itemsPerPage: {
                  type: 'integer',
                  description: '페이지당 항목 수'
                }
              }
            }
          }
        },
        CategoryStats: {
          type: 'object',
          description: '카테고리별 통계',
          properties: {
            category: {
              type: 'string',
              description: '카테고리명'
            },
            count: {
              type: 'integer',
              description: '템플릿 수'
            },
            avgViews: {
              type: 'number',
              description: '평균 조회수'
            },
            avgDownloads: {
              type: 'number',
              description: '평균 다운로드 수'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js'] // 라우트 파일들에서 JSDoc 주석을 읽어옴
};

export const specs = swaggerJSDoc(options);
