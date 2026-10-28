# 프로젝트 지침

Unity 6 프로젝트입니다. 이 파일은 Claude Code가 이 프로젝트에서 따라야 할 기본 규칙입니다.

## Unity 작업 규칙

- 씬, GameObject, 프리팹, 에셋을 수정하기 전에 `unity status`로 연결된 Editor가 있는지 확인합니다.
- Editor가 연결되어 있으면 `unity command`로 조작합니다. `.unity`, `.prefab`, `.asset` YAML을 직접 편집하지 않습니다.
- Editor가 여러 개 열려 있으면 `--project-path <이 프로젝트 경로>`를 붙입니다.
- `.claude/hooks/guard-unity-files.ps1` 훅이 `.unity`, `.prefab`, `.asset`, `.meta` 직접 편집과 `Packages/manifest.json`, `Library/`, `Temp/` 수정을 막습니다. 세션 시작 시 `unity status` 결과는 `unity-status.ps1` 훅이 알려 줍니다.
- 컴파일 에러로 Safe Mode에 들어가 연결이 안 되면 `unity pipeline list`로 확인하고, C# 에러를 고친 뒤 Unity를 다시 엽니다.

## 멀티플레이어

- 설치 패키지: `com.unity.services.multiplayer`, `com.unity.netcode.gameobjects`
- 설치 방식: 프로젝트 생성 시 `new-project.ps1`이 Services/Netcode 버전을 `manifest.json`에 적어 두고, `Assets/Editor/StarterKit/ProjectSetup.cs`를 헤드리스로 실행해 URP 머티리얼을 업그레이드합니다. 그래서 처음 Editor를 열 때 Burst/URP 확인 창이 뜨지 않습니다.
- `MultiplayerPackageInstaller.cs`는 Multiplayer Center 패키지를 설치하고 창을 여는 역할만 합니다.
- 패키지 버전이나 머티리얼을 바꾸는 작업은 Editor 창을 연 상태에서 `Client.Add`로 하지 않습니다. Burst/URP 업그레이드 확인 창이 뜨므로, 필요하면 `unity run <프로젝트> -- -executeMethod ProjectSetup.Run`으로 헤드리스 실행합니다.
- 로비, 매치메이킹, 세션 코드를 짤 때는 먼저 Multiplayer Center의 연결 상태(Services 링크, 패키지 버전)를 확인합니다.

## 패키지

- Unity 패키지는 `Packages/manifest.json`을 직접 고치지 말고 Package Manager 또는 `unity-package-management` 스킬을 사용합니다.

## 버전 관리

- `Library/`, `Temp/`, `Build/`, `Logs/` 등 생성 폴더는 커밋하지 않습니다.
- 큰 바이너리 에셋을 추가하면 `.gitattributes`의 Git LFS 규칙을 확인합니다.
