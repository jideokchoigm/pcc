# 행성 크기 그리기 챌린지 (Planet Circle Challenge)

지구를 기준으로 여덟 행성의 **상대적인 크기**를 손으로 그려 보며 익히는 초등 과학 학습 게임입니다.
태블릿·크롬북·PC 모두에서 동작하며, 서버 없이 브라우저 안에서만 돌아갑니다.

- 대상: 초등 5~6학년 (태양계와 별 단원)
- 기술: React 18 + TypeScript + Vite + Tailwind CSS + HTML5 Canvas
- 배포: GitHub Pages (정적 호스팅)

---

## 1. 로컬에서 실행하기

```bash
npm install     # 처음 한 번만
npm run dev     # http://localhost:5173 에서 실행
```

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm test` | 점수·원 근사 유틸 단위 테스트 (Vitest) |
| `npm run build` | 타입 검사 후 `dist/` 로 빌드 |
| `npm run preview` | 빌드 결과를 로컬에서 확인 |
| `npm run deploy` | `gh-pages` 브랜치로 수동 배포 |

Node.js 18 이상을 권장합니다.

---

## 2. GitHub Pages 배포

### 방법 A. GitHub Actions (권장 · 푸시하면 자동 배포)

1. 저장소를 만들고 코드를 `main` 브랜치에 올립니다.
2. 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 바꿉니다.
3. 끝입니다. 이후 `main` 에 푸시할 때마다 `.github/workflows/deploy.yml` 이 테스트 → 빌드 → 배포를 실행합니다.

주소는 `https://<아이디>.github.io/<저장소이름>/` 형태가 됩니다.

### 방법 B. gh-pages 패키지로 수동 배포

```bash
npm run deploy
```

빌드 결과가 `gh-pages` 브랜치에 올라갑니다.
**Settings → Pages → Source** 를 `gh-pages` 브랜치 / `/ (root)` 로 지정해 주세요.

> `vite.config.ts` 의 `base` 를 `'./'` 로 두었기 때문에 저장소 이름이 무엇이든 경로 수정 없이 동작합니다.

---

## 3. 교육 설계 노트

### 축척을 화면에 담는 방법

목성(11.21배)과 수성(0.38배)은 **약 30배** 차이가 납니다.
두 행성을 같은 화면에 정직하게 담으려면 기준이 되는 지구 원이 작아질 수밖에 없습니다.
그래서 지구 기준 원의 반지름을 `min(가로, 세로) × 0.46 ÷ 11.21` 로 계산합니다.
**게임 내내 지구 원의 크기는 바뀌지 않습니다.** 크기 비교의 기준이 흔들리면 학습이 성립하지 않기 때문입니다.

### 점수 계산 (`src/utils/scoring.ts`)

```
비(ratio) = 학생이 그린 배율 ÷ 실제 배율
오차 e    = |ln(비)|
점수      = 100 × e^(-1.05 × e)
```

로그를 쓴 이유는 **절반으로 작게 그린 것과 두 배로 크게 그린 것을 같은 오차로 채점**하기 위해서입니다.
단순 백분율 오차를 쓰면 큰 행성에서 불리해지고, 학생이 "무조건 크게 그리면 손해"라는 잘못된 전략을 배우게 됩니다.

| 점수 | 등급 |
| --- | --- |
| 100 | 완벽해요 |
| 95–99 | 훌륭해요 |
| 85–94 | 아주 좋아요 |
| 70–84 | 좋아요 |
| 69 이하 | 다시 도전 |

### 손그림을 원으로 바꾸는 방법 (`src/utils/circleFit.ts`)

1. **걸러 내기** — 3px 이내로 붙은 점을 제거해 특정 구간에 계산이 치우치지 않게 합니다.
2. **부드럽게 하기** — 앞뒤 2개 점의 이동 평균으로 손떨림을 줄입니다.
3. **최소제곱 원 근사(Kåsa 방법)** — 점들을 가장 잘 지나는 원의 중심과 반지름을 한 번에 계산합니다.
4. **원다움 검사** — 각 점이 근사한 원에서 벗어난 정도(RMS)를 반지름과 비교해 0~1 값으로 냅니다.
   0.45 미만이면 "동그라미로 보이지 않아요"라고 안내하고 다시 그리게 합니다.

이 두 유틸은 화면과 분리된 순수 함수라 `npm test` 로 단독 검증합니다. (20개 테스트)

### 수업 활용 팁

- **도입**: 지구 원 하나만 띄워 두고 "목성은 몇 배일까?" 를 손으로 예상하게 한 뒤 게임을 시작합니다.
- **정리**: 선생님 화면에서 평균이 가장 낮은 행성을 확인하고, 그 행성을 중심으로 다시 짚어 줍니다.
- **오개념 확인**: 선생님 화면의 "크게 %" 지표는 학생들이 실제보다 크게 그리는 경향을 보여 줍니다.
  천왕성·해왕성을 목성만큼 크게 그리는 오개념이 자주 나타납니다.

### 접근성

- 모든 버튼은 터치 목표 44~52px 이상
- 키보드만으로 답하기 지원 (화살표 키로 크기 조절 → Enter 제출)
- 캔버스·버튼에 한국어 ARIA 라벨, 포커스 링 표시
- 고대비 모드 토글
- 운영체제의 "동작 줄이기" 설정을 감지해 애니메이션 최소화

### 개인 정보

학생 이름 등 개인 정보는 **전혀 수집하지 않습니다.**
점수 기록은 그 기기의 브라우저(localStorage)에만 저장되며, 선생님 화면에서 언제든 지울 수 있습니다.

---

## 4. 프로젝트 구조

```
planet-circle-challenge/
├── .github/workflows/deploy.yml   GitHub Pages 자동 배포
├── index.html                     폰트 로드 및 진입 HTML
├── vite.config.ts                 base: './' (Pages 대응)
├── tailwind.config.js             색·서체 토큰
└── src/
    ├── main.tsx                   진입점
    ├── App.tsx                    화면 전환과 한 판의 기록 관리
    ├── types.ts                   공용 타입
    ├── index.css                  전역 스타일 · 고대비 · 동작 줄이기
    ├── data/
    │   └── planets.ts             8개 행성의 상대 지름과 과학 상식
    ├── utils/
    │   ├── smoothing.ts           점 걸러 내기 · 이동 평균
    │   ├── circleFit.ts           최소제곱 원 근사 · 원다움 계산
    │   ├── scoring.ts             점수 산식 · 등급 · 피드백 문구
    │   ├── badges.ts              배지 획득 판정
    │   ├── analytics.ts           행성별 정확도 · 추이 집계
    │   ├── storage.ts             localStorage 저장/불러오기
    │   └── sound.ts               Web Audio 효과음 (파일 없음)
    ├── hooks/
    │   ├── useReducedMotion.ts    동작 줄이기 감지
    │   └── useSettings.ts         소리·고대비 설정
    ├── components/
    │   ├── StartScreen.tsx        시작 화면
    │   ├── InstructionModal.tsx   게임 방법 안내
    │   ├── GameScreen.tsx         한 라운드 진행
    │   ├── DrawingCanvas.tsx      그리기 · 채점 · 정답 공개 애니메이션
    │   ├── FeedbackPanel.tsx      점수와 과학 상식
    │   ├── ProgressIndicator.tsx  진행 표시
    │   ├── ResultScreen.tsx       성적표
    │   ├── BadgeShelf.tsx         배지 목록
    │   ├── TeacherDashboard.tsx   교사용 분석
    │   ├── PlanetGlyph.tsx        SVG 행성 그림
    │   ├── StarField.tsx          배경 별
    │   └── Button.tsx             공용 버튼
    └── tests/
        ├── scoring.test.ts
        └── circleFit.test.ts
```

---

## 5. 행성 자료

| 행성 | 지구 기준 지름 |
| --- | --- |
| 수성 | 0.38 |
| 금성 | 0.95 |
| 지구 | 1.00 |
| 화성 | 0.53 |
| 목성 | 11.21 |
| 토성 | 9.45 |
| 천왕성 | 4.01 |
| 해왕성 | 3.88 |

새로운 행성이나 왜소행성을 넣고 싶다면 `src/data/planets.ts` 배열에 한 줄만 추가하면 됩니다.
나머지 화면과 통계는 자동으로 따라갑니다.

---

## 라이선스

교실에서 자유롭게 사용·수정하실 수 있습니다.
