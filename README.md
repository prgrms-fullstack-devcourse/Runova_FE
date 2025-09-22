# Runova FE (Expo + Emotion + Navigation)

Runova는 GPS ART 기반 런닝 어플리케이션입니다.

### 배포 링크
Runova는 React Native 기반으로 개발되었으며, 하단 링크에서 .apk 파일을 설치하여 실행할 수 있습니다. 
https://runova-web.vercel.app/

### 프로젝트 구조



```
Runova_FE/
├── 📁 apps/                         # 웹 애플리케이션
│   └── 📁 web/                      # React 웹앱
│       ├── 📁 public/               # 정적 파일
│       ├── 📁 scripts/              # 빌드 스크립트
│       └── 📁 src/                  # 웹앱 소스코드
│           ├── 📁 api/              # API 호출 함수
│           ├── 📁 assets/           # 웹앱 리소스
│           ├── 📁 components/       # 재사용 컴포넌트
│           │   ├── 📁 common/       # 공통 컴포넌트
│           │   └── 📁 layout/       # 레이아웃 컴포넌트
│           ├── 📁 constants/        # 상수 정의
│           ├── 📁 hooks/            # 커스텀 훅
│           ├── 📁 lib/              # 유틸리티 라이브러리
│           ├── 📁 pages/            # 페이지 컴포넌트
│           │   ├── 📁 Community/    # 커뮤니티 관련
│           │   │   ├── 📁 CommunityDetail/    # 상세 페이지
│           │   │   │   └── 📁 _components/    # 페이지별 컴포넌트
│           │   │   ├── 📁 CommunityEdit/      # 편집 페이지
│           │   │   │   └── 📁 _components/    # 페이지별 컴포넌트
│           │   │   ├── 📁 CommunityFeed/      # 피드 페이지
│           │   │   ├── 📁 CommunityList/      # 목록 페이지
│           │   │   │   └── 📁 _components/    # 페이지별 컴포넌트
│           │   │   └── 📁 _components/        # 공통 컴포넌트
│           │   ├── 📁 MyPage/       # 마이페이지
│           │   │   └── 📁 _components/        # 페이지별 컴포넌트
│           │   └── 📁 MyStats/      # 통계 페이지
│           ├── 📁 stores/           # 상태 관리
│           ├── 📁 styles/           # 스타일 정의
│           └── 📁 types/            # 타입 정의
├── 📁 assets/                       # 앱 아이콘/이미지
├── 📁 credentials/                  # 인증서 파일
│   └── 📁 android/                  # 안드로이드 인증서
├── 📁 node_modules/                 # 의존성 패키지
└── 📁 src/                          # 메인 모바일 앱 소스코드
    ├── 📁 __mocks__/                # 모킹 데이터
    ├── 📁 assets/                   # 앱 리소스
    ├── 📁 components/               # 재사용 컴포넌트
    ├── 📁 constants/                # 상수 정의
    ├── 📁 hooks/                    # 커스텀 훅
    │   └── 📁 api/                  # API 관련 훅
    ├──📁 lib/                      # 유틸리티 라이브러리
    ├── 📁 navigation/               # 네비게이션 설정
    ├── 📁 pages/                    # 페이지 컴포넌트
    │   ├── 📁 Auth/                 # 인증 페이지
    │   ├── 📁 Detail/               # 상세 페이지
    │   ├── 📁 Draw/                 # 그리기 페이지
    │   │   └── 📁 _components/      # 페이지별 컴포넌트
    │   ├── 📁 Home/                 # 홈 페이지
    │   │   └── 📁 _components/      # 페이지별 컴포넌트
    │   ├── 📁 Map/                  # 지도 페이지
    │   ├── 📁 PhotoDecoration/      # 사진 꾸미기
    │   │   └── 📁 _components/      # 페이지별 컴포넌트
    │   ├── 📁 PhotoEdit/            # 사진 편집
    │   ├── 📁 RecordDetail/         # 기록 상세
    │   ├── 📁 Records/              # 기록 목록
    │   │   └── 📁 _components/      # 페이지별 컴포넌트
    │   ├── 📁 Route/                # 경로 페이지
    │   │   └── 📁 _components/      # 페이지별 컴포넌트
    │   ├── 📁 RouteSave/            # 경로 저장
    │   ├── 📁 Run/                  # 러닝 페이지
    │   │   └── 📁 _components/      # 페이지별 컴포넌트
    │   ├── 📁 RunDetail/            # 러닝 상세
    │   ├── 📁 Settings/             # 설정 페이지
    │   ├── 📁 WebCommunity/         # 웹 커뮤니티
    │   └── 📁 WebMyPage/            # 웹 마이페이지
    ├── 📁 services/                 # 서비스 레이어
    ├── 📁 store/                    # 상태 관리
    ├── 📁 styles/                   # 스타일 정의
    ├── 📁 types/                    # 타입 정의
    └── 📁 utils/                    # 유틸리티 함수
│
├── 📄 .easignore                    # EAS 빌드 무시 파일
├── 📄 .gitignore                    # Git 무시 파일
├── 📄 .prettierrc                   # Prettier 설정
├── 📄 app.config.js                 # Expo 앱 설정
├── 📄 App.tsx                       # 메인 앱 컴포넌트
├── 📄 babel.config.js               # Babel 설정
├── 📄 credentials.js                # 인증서 설정
├── 📄 eas.json                      # EAS 빌드 설정
├── 📄 eslint.config.mjs             # ESLint 설정
├── 📄 index.ts                      # 진입점
├── 📄 package-lock.json             # 패키지 잠금 파일
├── 📄 package.json                  # 프로젝트 의존성
├── 📄 README.md                     # 프로젝트 문서
└── 📄 tsconfig.json                 # TypeScript 설정
```

