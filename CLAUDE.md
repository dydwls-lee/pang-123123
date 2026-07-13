# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기술 스택

- **React 19** + **TypeScript** (strict)
- **Vite 8** — 빌드 도구 (`@vitejs/plugin-react` 사용, Oxc 기반)
- **Oxlint** — 린터 (ESLint 대체, Rust 기반 고속 린터)
- 별도의 유닛 테스트 프레임워크는 아직 구성되어 있지 않음 (Vitest/Jest 등 미설치)

## 주요 명령어

```bash
npm run dev       # 개발 서버 실행 (Vite HMR)
npm run build     # tsc -b (프로젝트 참조 빌드) 후 vite build
npm run preview   # 빌드 결과 로컬 프리뷰
npm run lint      # oxlint 실행
```

타입 체크만 별도로 하려면:
```bash
npx tsc -b --noEmit
```

### 테스트 방법

현재 테스트 프레임워크가 설치되어 있지 않으므로, 코드 검증은 다음 순서로 진행:
1. `npm run lint` — Oxlint로 정적 분석
2. `npx tsc -b` — TypeScript 타입 체크 (빌드 시 자동 수행)
3. `npm run dev`로 브라우저에서 직접 동작 확인

유닛 테스트를 추가할 경우 Vite 생태계와 궁합이 좋은 Vitest 도입을 고려할 것.

## 아키텍처

- `tsconfig.json`은 파일을 직접 포함하지 않고 `tsconfig.app.json`(앱 소스용)과 `tsconfig.node.json`(Vite 설정 등 Node 환경용)을 참조하는 프로젝트 참조 구조.
- 엔트리포인트: `index.html` → `src/main.tsx` → `src/App.tsx`.
- `.oxlintrc.json`에서 `react`, `typescript`, `oxc` 플러그인을 활성화. 현재 타입 인지(type-aware) 린트 규칙은 비활성화 상태이며, 필요 시 README에 안내된 대로 `oxlint-tsgolint` 설치 후 `typeAware: true` 옵션 추가 가능.
- `.mcp.json`에 GitHub MCP 서버(`github-mcp-server.exe`, stdio 방식)가 등록되어 있음 — GitHub 관련 작업(이슈/PR 조회, 코드 검색 등) 시 `mcp__github__*` 도구 사용 가능. 이 파일은 토큰을 포함하므로 `.gitignore`에 등록되어 있음.
