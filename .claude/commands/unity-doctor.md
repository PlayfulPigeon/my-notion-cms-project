---
description: Unity CLI 인증, Editor, 라이선스, 최근 오류를 한 번에 점검합니다
allowed-tools: Bash(unity:*)
---

Unity 환경을 점검합니다. 아래 명령을 순서대로 실행하고 결과를 요약합니다.

1. `unity doctor --format json` — 인증, Editor, 최근 오류
2. `unity auth status --json` — 로그인 계정
3. `unity license status` — 라이선스 상태

## 결과 정리

- 문제가 없는 항목은 한 줄로만 적습니다.
- 문제가 있는 항목만 골라 원인과 해결 방법을 적습니다.
  - 로그인 안 됨: `unity auth login` 안내
  - Editor 없음: Unity Hub에서 Unity 6(6000.x) 설치 안내
  - 라이선스 문제: 라이선스 활성화 방법 안내
  - 최근 오류: 오류 메시지 원문과 관련 파일을 함께 보여 줍니다
- 명령이 실패하면 실패한 명령과 출력 원문을 그대로 보여 줍니다. 추측으로 해결됐다고 말하지 않습니다.

$ARGUMENTS 가 있으면 점검 대상 프로젝트 경로로 `--project-path $ARGUMENTS` 를 붙입니다.
