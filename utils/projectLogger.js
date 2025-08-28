import ProjectLog from '../models/ProjectLog.js';

/**
 * 프로젝트 활동을 로깅하는 유틸리티 함수
 */
class ProjectLogger {
  /**
   * 프로젝트 로그 생성
   * @param {Object} options - 로그 옵션
   * @param {number} options.userId - 사용자 ID
   * @param {number} options.projectId - 프로젝트 ID (선택사항)
   * @param {string} options.action - 액션 타입
   * @param {string} options.description - 액션 설명
   * @param {Object} options.metadata - 추가 메타데이터
   * @param {string} options.ipAddress - IP 주소 (선택사항)
   * @param {string} options.userAgent - 사용자 에이전트 (선택사항)
   * @returns {Promise<ProjectLog>} 생성된 로그
   */
  static async log(options) {
    try {
      const {
        userId,
        projectId,
        action,
        description,
        metadata = {},
        ipAddress,
        userAgent
      } = options;

      if (!userId || !action) {
        throw new Error('userId와 action은 필수입니다.');
      }

      const logData = {
        userId,
        projectId,
        action,
        description,
        metadata,
        ipAddress,
        userAgent
      };

      const log = await ProjectLog.create(logData);
      console.log(`프로젝트 로그 생성: ${action} - ${description}`);
      
      return log;
    } catch (error) {
      console.error('프로젝트 로그 생성 오류:', error);
      // 로그 생성 실패는 애플리케이션 동작에 영향을 주지 않도록 함
      return null;
    }
  }

  /**
   * 프로젝트 생성 로그
   */
  static async logProjectCreated(userId, projectId, projectName, templateId, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'created',
      description: `새 프로젝트 "${projectName}"을 생성했습니다.`,
      metadata: { templateId, projectName },
      ipAddress,
      userAgent
    });
  }

  /**
   * 프로젝트 수정 로그
   */
  static async logProjectUpdated(userId, projectId, projectName, updatedFields, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'updated',
      description: `프로젝트 "${projectName}"을 수정했습니다.`,
      metadata: { updatedFields, projectName },
      ipAddress,
      userAgent
    });
  }

  /**
   * 프로젝트 삭제 로그
   */
  static async logProjectDeleted(userId, projectId, projectName, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'deleted',
      description: `프로젝트 "${projectName}"을 삭제했습니다.`,
      metadata: { projectName },
      ipAddress,
      userAgent
    });
  }

  /**
   * 프로젝트 발행 로그
   */
  static async logProjectPublished(userId, projectId, projectName, publicationId, version, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'published',
      description: `프로젝트 "${projectName}"을 발행했습니다.`,
      metadata: { 
        publicationId, 
        version, 
        projectName,
        publishedAt: new Date()
      },
      ipAddress,
      userAgent
    });
  }

  /**
   * 프로젝트 게시 취소 로그
   */
  static async logProjectUnpublished(userId, projectId, projectName, previousStatus, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'unpublished',
      description: `프로젝트 "${projectName}"의 게시를 취소했습니다.`,
      metadata: { 
        previousStatus, 
        newStatus: 'draft',
        projectName,
        unpublishedAt: new Date()
      },
      ipAddress,
      userAgent
    });
  }

  /**
   * 프로젝트 조회 로그
   */
  static async logProjectViewed(userId, projectId, projectName, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'viewed',
      description: `프로젝트 "${projectName}"을 조회했습니다.`,
      metadata: { projectName },
      ipAddress,
      userAgent
    });
  }

  /**
   * 프로젝트 복제 로그
   */
  static async logProjectDuplicated(userId, projectId, projectName, originalProjectId, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'duplicated',
      description: `프로젝트 "${projectName}"을 복제했습니다.`,
      metadata: { 
        originalProjectId, 
        projectName 
      },
      ipAddress,
      userAgent
    });
  }

  /**
   * 코드 업데이트 로그
   */
  static async logCodeUpdated(userId, projectId, projectName, codeLength, ipAddress, userAgent) {
    return this.log({
      userId,
      projectId,
      action: 'updated',
      description: `프로젝트 "${projectName}"의 코드를 업데이트했습니다.`,
      metadata: { 
        codeLength, 
        updateType: 'code',
        projectName 
      },
      ipAddress,
      userAgent
    });
  }
}

export default ProjectLogger;
