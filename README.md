# 게시판 (Simple Board)

Vue 3 + Nuxt 3 + Tailwind CSS로 구축된 모던 웹 게시판 애플리케이션입니다.

## 🚀 주요 기능

### 📝 게시글 관리
- 게시글 작성, 수정, 삭제
- 실시간 검색 (제목, 내용, 작성자별)
- 페이지네이션
- 게시글 조회수 기능

### 💬 댓글 시스템
- 댓글 작성, 수정, 삭제
- 실시간 댓글 카운트
- 작성자 및 작성일 표시

### 📎 파일 관리
- 다중 파일 업로드 지원
- 드래그 앤 드롭 인터페이스
- 파일 미리보기 (이미지, PDF, 텍스트)
- 파일 다운로드 기능
- 파일 크기 및 형식 제한

### 🎨 사용자 인터페이스
- 반응형 디자인
- 다크/라이트 모드 지원
- 직관적인 모달 시스템
- 로딩 상태 표시
- 에러 핸들링

## 🛠 기술 스택

### Frontend
- **Framework**: [Nuxt 3](https://nuxt.com/) - Vue 3 기반 풀스택 프레임워크
- **스타일링**: [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 기반 CSS 프레임워크
- **상태 관리**: [Pinia](https://pinia.vuejs.org/) - Vue 3 전용 상태 관리 라이브러리
- **아이콘**: 커스텀 SVG 아이콘 컴포넌트

### Backend API
- Spring Boot 백엔드 연동
- RESTful API 통신
- 파일 업로드/다운로드 지원

## 📁 프로젝트 구조

```
├── assets/
│   └── css/
│       └── main.css              # 글로벌 스타일 및 Tailwind 설정
├── components/
│   ├── CommentList.vue           # 댓글 목록 및 관리
│   ├── FileListReadonly.vue      # 읽기 전용 파일 목록
│   ├── FilePreview.vue           # 파일 미리보기 모달
│   ├── FileUpload.vue            # 파일 업로드 인터페이스
│   ├── GlobalModal.vue           # 전역 모달 관리
│   ├── Icon.vue                  # 커스텀 아이콘 컴포넌트
│   ├── Modal.vue                 # 범용 모달 컴포넌트
│   └── PostCard.vue              # 게시글 카드 컴포넌트
├── composables/
│   ├── useApi.js                 # API 통신 관리
│   └── useFileManager.js         # 파일 관리 유틸리티
├── layouts/
│   └── default.vue               # 기본 레이아웃
├── pages/
│   ├── index.vue                 # 메인 페이지 (게시글 목록)
│   └── posts/
│       ├── create.vue            # 게시글 작성
│       └── [id]/
│           ├── index.vue         # 게시글 상세보기
│           └── edit.vue          # 게시글 수정
├── stores/
│   ├── comments.js               # 댓글 상태 관리
│   ├── files.js                  # 파일 상태 관리
│   ├── modal.js                  # 모달 상태 관리
│   └── posts.js                  # 게시글 상태 관리
├── nuxt.config.ts                # Nuxt 설정
├── tailwind.config.js            # Tailwind CSS 설정
└── package.json                  # 의존성 관리
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Spring Boot 백엔드 서버 (별도 실행 필요)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd simple-board
   ```

2. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **환경 변수 설정**
   ```bash
   # .env 파일 생성
   API_BASE_URL=http://localhost:8081/api
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

5. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 백엔드 서버 설정

이 프론트엔드 애플리케이션은 Spring Boot 백엔드와 연동됩니다.
백엔드 서버는 기본적으로 `http://localhost:8081`에서 실행되어야 합니다.

## 📊 주요 컴포넌트

### 1. 게시글 관리 (PostCard, Post Pages)
- 게시글 CRUD 기능
- 검색 및 필터링
- 페이지네이션

### 2. 댓글 시스템 (CommentList)
- 실시간 댓글 추가/수정/삭제
- 중첩 답글 지원 준비

### 3. 파일 관리 (FileUpload, FileListReadonly, FilePreview)
- 다중 파일 업로드
- 파일 유형별 아이콘 표시
- 이미지/PDF 미리보기
- 파일 크기 제한 및 유효성 검사

### 4. 모달 시스템 (Modal, GlobalModal)
- 확인/취소 다이얼로그
- 에러/성공 알림
- 비동기 상태 관리

## 🎨 스타일링

### Tailwind CSS 클래스
- `btn-primary`, `btn-secondary`, `btn-danger` - 버튼 스타일
- `card` - 카드 레이아웃
- `form-input`, `form-textarea` - 폼 요소
- 반응형 유틸리티 클래스 활용

### 커스텀 컴포넌트
- 재사용 가능한 Icon 컴포넌트
- 일관된 디자인 시스템

## 🔧 설정 및 환경변수

### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8081/api',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/*', 'application/pdf', 'text/*']
    }
  }
})
```

### 지원하는 환경변수
- `API_BASE_URL`: 백엔드 API 서버 주소

## 🧪 개발 모드

### 디버깅 기능
- 콘솔 로그를 통한 API 요청/응답 추적
- 에러 상태 시각적 표시
- 개발자 도구 연동

### 핫 리로드
- 파일 변경 시 자동 새로고침
- CSS 변경 시 즉시 반영

## 📱 반응형 디자인

- **모바일**: 320px+
- **태블릿**: 768px+
- **데스크톱**: 1024px+

모든 컴포넌트는 모바일 우선으로 설계되었습니다.

## 🔒 보안 고려사항

- 파일 업로드 시 타입 및 크기 검증
- XSS 방지를 위한 입력값 검증
- CORS 설정을 통한 도메인 제한

## 🐛 문제 해결

### 일반적인 문제들

1. **defineProps 에러**
   ```bash
   # .nuxt 폴더 삭제 후 재시작
   rm -rf .nuxt
   npm run dev
   ```

2. **API 연결 실패**
    - 백엔드 서버 실행 상태 확인
    - 환경변수 설정 확인
    - CORS 설정 확인

3. **파일 업로드 실패**
    - 파일 크기 제한 확인
    - 지원되는 파일 형식 확인
    - 백엔드 파일 저장 경로 확인

## 🚧 개발 예정 기능

- [ ] 사용자 인증 시스템
- [ ] 실시간 알림
- [ ] 게시글 좋아요/북마크
- [ ] 댓글 답글 기능
- [ ] 이미지 리사이징
- [ ] PWA 지원

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트 링크: [GitHub Repository URL]

---

**Made with ❤️ using Vue 3, Nuxt 3, and Tailwind CSS**