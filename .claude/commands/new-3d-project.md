---
description: Universal 3D Unity 6 프로젝트를 만들고 Pipeline, Claude Code, Multiplayer 기본 세팅을 적용합니다
argument-hint: <프로젝트 이름> [경로]
allowed-tools: Bash(powershell:*), Bash(unity:*), Bash(git:*), Read, Glob
---

인자: `$ARGUMENTS`

첫 번째 단어를 프로젝트 이름(`-Name`)으로, 두 번째 단어를 상위 경로(`-Path`)로 씁니다. 경로가 없으면 `C:\UnityProjects`를 씁니다. 이름이 없으면 사용자에게 이름을 물어보고 멈춥니다.

## 순서

1. 현재 디렉터리가 스타터 킷 루트인지 확인합니다. `scripts/new-project-3d.ps1`이 없으면 킷 루트에서 다시 실행하라고 안내하고 멈춥니다.

2. 사전 점검을 실행합니다.
   ```
   powershell -ExecutionPolicy Bypass -File .\scripts\new-project-3d.ps1 -CheckOnly
   ```
   실패하면 실패한 항목(unity CLI, git, claude, Unity 6 Editor, 로그인)과 해결 방법만 요약하고 멈춥니다.

3. 프로젝트를 만듭니다. 사용할 경로와 이름을 한 줄로 먼저 알려 준 뒤 실행합니다.
   ```
   powershell -ExecutionPolicy Bypass -File .\scripts\new-project-3d.ps1 -Name <이름> -Path <경로> -Open
   ```
   사용자가 `-Lfs`, `-SkipGit`, `-SkipLogin`, `-SkipMultiplayer`, `-Editor`를 말한 경우에만 해당 옵션을 붙입니다. 로그인이 필요하면 브라우저 로그인이 열리므로, 사용자에게 로그인을 완료하라고 안내합니다.

4. 결과를 확인합니다.
   - `<경로>\<이름>\ProjectSettings` 존재 여부
   - `<경로>\<이름>\.claude\skills\unity-cli` 존재 여부
   - `<경로>\<이름>\Packages\manifest.json`에 `com.unity.services.multiplayer`, `com.unity.netcode.gameobjects` 버전이 있는지
   - `git -C <프로젝트 경로> ls-files`에 `Library/`가 없는지

5. 끝나면 남은 수동 단계를 안내합니다.
   - Multiplayer Center(`Window > Multiplayer > Multiplayer Center`)에서 게임 종류 선택
   - `Project Settings > Services`에서 Unity Services 연결

결과는 프로젝트 경로, 확인된 항목, 남은 수동 단계만 짧게 정리합니다.
