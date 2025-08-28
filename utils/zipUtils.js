import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 프로젝트 파일들을 ZIP으로 압축
 * @param {Object} project - 프로젝트 객체 (files 배열 포함)
 * @returns {Promise<Buffer>} ZIP 파일 버퍼
 */
async function createZipArchive(project) {
  try {
    const zip = new JSZip();
    
    // 프로젝트 메타데이터 파일 생성
    const projectMeta = {
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      settings: project.settings,
      stats: project.stats
    };
    
    zip.file('project.json', JSON.stringify(projectMeta, null, 2));
    
    // 프로젝트 파일들 추가
    if (project.files && project.files.length > 0) {
      for (const file of project.files) {
        try {
          // 파일 경로 구성 (실제 파일 시스템 경로)
          const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', file.path);
          
          // 파일 읽기
          const fileContent = await fs.readFile(filePath);
          
          // ZIP에 파일 추가 (상대 경로 사용)
          const relativePath = file.path.replace(/^uploads\//, '');
          zip.file(relativePath, fileContent);
          
        } catch (fileError) {
          console.warn(`파일 ${file.path} 추가 실패:`, fileError.message);
          // 파일이 없어도 계속 진행
        }
      }
    }
    
    // ZIP 파일 생성
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    return zipBuffer;
    
  } catch (error) {
    console.error('ZIP 생성 오류:', error);
    throw new Error('프로젝트 압축 파일을 생성할 수 없습니다.');
  }
}

/**
 * 파일 경로를 안전하게 정리
 * @param {string} filePath - 파일 경로
 * @returns {string} 정리된 경로
 */
function sanitizeFilePath(filePath) {
  // 경로 정규화 및 보안 검사
  const normalized = path.normalize(filePath);
  
  // 상위 디렉토리 접근 방지
  if (normalized.startsWith('..') || normalized.includes('..')) {
    throw new Error('잘못된 파일 경로입니다.');
  }
  
  return normalized;
}

export {
  createZipArchive,
  sanitizeFilePath
};
