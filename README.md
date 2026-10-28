# Unity Starter Kit (CLI + Pipeline + Claude Code + Multiplayer)

> Unity 6 프로젝트 생성·세팅 자동화 스크립트 모음입니다. 저장소에는 Notion을 CMS로 쓰는 유니티 개발 일지/포트폴리오 사이트의 기획 문서(`docs/PRD.md`)도 함께 있습니다.

새 Unity 6 프로젝트를 만들 때마다 설치 방법을 검색하지 않도록, 한 번의 명령으로 아래를 세팅합니다.

- Unity CLI로 프로젝트 생성 (Editor 자동 선택, URP 템플릿)
- Git 저장소 초기화 + Unity `.gitignore` (Library 등 생성 폴더 제외)
- `com.unity.pipeline` 설치 (Unity CLI가 열린 Editor를 조작하는 통로)
- Claude Code 연결: 프로젝트 `CLAUDE.md`, `unity-cli` 스킬, `unity` 명령 권한 설정
- Multiplayer: services/netcode 패키지를 생성 시 헤드리스로 설치하고, URP 머티리얼을 미리 업그레이드, 첫 실행 때 Multiplayer Center 설치와 창 열기

## 전제 조건

아래는 이미 설치되어 있다고 가정합니다.

| 도구 | 확인 명령 |
|---|---|
| Unity Hub + Unity 6 Editor (6000.x) | `unity editors --installed` |
| Unity CLI | `unity --version` |
| Git | `git --version` |
| Claude Code | `claude --version` |
| VS Code | — |

Unity CLI가 없다면 PowerShell에서:

```powershell
$env:UNITY_CLI_CHANNEL='beta'; irm https://public-cdn.cloud.unity3d.com/hub/prod/cli/install.ps1 | iex
```

## 빠른 시작

```powershell
# 1. 사전 점검만 (설치된 Unity 6 Editor, git, claude 확인)
powershell -ExecutionPolicy Bypass -File .\scripts\new-project.ps1 -CheckOnly

# 2. 3D 프로젝트 생성 + 전체 세팅 (Universal 3D, 끝나면 Unity Editor 열기)
powershell -ExecutionPolicy Bypass -File .\scripts\new-project-3d.ps1 -Name MyGame -Path D:\UnityProjects -Open

# 3. 2D 프로젝트 생성 (Universal 2D)
powershell -ExecutionPolicy Bypass -File .\scripts\new-project-2d.ps1 -Name MyGame2D -Path D:\UnityProjects -Open
```

생성 전에 Unity 계정 로그인 상태를 확인하고, 로그인되어 있지 않으면 브라우저 로그인을 엽니다.

### 스크립트

| 파일 | 템플릿 | 설명 |
|---|---|---|
| `scripts/new-project-3d.ps1` | `com.unity.template.urp-blank` (Universal 3D) | 3D 프로젝트 |
| `scripts/new-project-2d.ps1` | `com.unity.template.universal-2d` (Universal 2D) | 2D 프로젝트 |
| `scripts/new-project.ps1` | `-Template`으로 지정 (기본 Universal 3D) | 공통 흐름. 두 래퍼가 이 스크립트를 호출합니다. |

### 옵션 (세 스크립트 공통, `-Template`은 `new-project.ps1` 전용)

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `-Name` | (필수) | 프로젝트 폴더 이름 |
| `-Path` | (필수) | 상위 폴더 |
| `-Editor` | 설치된 6000.x 중 최신 | 예: `6000.3.10f1` |
| `-Template` | `com.unity.template.urp-blank` | `new-project.ps1` 전용. 다른 템플릿: `com.unity.template.3d`(Built-in), `com.unity.template.hdrp-blank` 등 |
| `-SkipGit` | off | Git 초기화 생략 |
| `-Lfs` | off | 큰 바이너리(psd, fbx, wav, png 등)를 Git LFS로 추적 |
| `-SkipMultiplayer` | off | 멀티플레이어 설치 스크립트 복사와 헤드리스 준비 생략 |
| `-SkipLogin` | off | 생성 전 Unity 로그인 확인 생략 |
| `-Open` | off | 끝나면 `unity open`으로 Editor 열기 |
| `-CheckOnly` | off | 사전 점검과 로그인 상태만 확인하고 종료 |

## 구성

```
notion-cms-project/
├── README.md
├── .mcp.json                           # Claude Code MCP 서버 설정
├── .claude/commands/                   # 슬래시 명령 (new-2d-project, new-3d-project, unity-doctor)
├── docs/
│   ├── PRD.md                          # Notion CMS 기반 포트폴리오 사이트 PRD
│   └── starterkit.html                 # 스타터 킷 안내 페이지
├── scripts/
│   ├── new-project.ps1                 # 전체 흐름 (사전 점검 → 로그인 → 생성 → git → pipeline → claude → multiplayer)
│   ├── new-project-3d.ps1              # 3D (Universal 3D) 래퍼
│   └── new-project-2d.ps1              # 2D (Universal 2D) 래퍼
└── template/                           # 생성되는 프로젝트에 복사되는 파일
    ├── CLAUDE.md                       # Claude Code 작업 지침 (프로젝트 루트)
    ├── .claude/settings.json           # unity·git 읽기 명령 허용 목록
    ├── .claude/agents/                 # 서브에이전트 (성능 점검, 커밋 전 검사, 테스트 작성)
    ├── .gitignore                      # 공식 Unity.gitignore 다운로드 실패 시 대체용
    └── Assets/Editor/StarterKit/
        ├── MultiplayerPackageInstaller.cs   # 첫 실행 때 Multiplayer Center 설치 + 창 열기
        └── ProjectSetup.cs                  # 헤드리스로 URP 머티리얼 업그레이드 (Burst/URP 확인 창 방지)
```

생성된 프로젝트에서 Claude Code를 쓰면 `CLAUDE.md`가 자동으로 읽히고, `unity-cli` 스킬로 열린 Editor를 CLI로 조작합니다.

## Multiplayer Center 설정

스크립트가 자동으로 해 주는 것:

1. 생성 직후 `com.unity.services.multiplayer`, `com.unity.netcode.gameobjects`의 최신 호환 버전을 `manifest.json`에 기록하고, `ProjectSetup.Run`을 헤드리스로 실행해 URP 머티리얼을 업그레이드합니다. Editor 창을 열기 전에 끝나므로 Burst/URP 확인 창이 뜨지 않아야 합니다.
2. 프로젝트를 처음 열면 `com.unity.multiplayer.center`를 설치하고, 설치가 끝나면 `Window > Multiplayer > Multiplayer Center`를 엽니다.

직접 해야 하는 것:

1. 열린 Multiplayer Center에서 만들려는 게임 종류(예: 로비 기반, 호스트 기반 등)를 선택합니다. 선택 결과에 따라 추천 패키지가 설치됩니다.
2. Unity 계정으로 프로젝트를 Unity Services에 연결합니다. Unity 6에서는 보통 `Edit > Project Settings > Services`에서 조직을 고르고 프로젝트를 링크합니다. (메뉴 위치는 Editor 버전에 따라 다를 수 있습니다.)
3. 설치를 다시 하고 싶으면 메뉴 `Tools > Starter Kit > Install Multiplayer Packages`를 누릅니다.

## 확인된 것과 확인되지 않은 것

직접 실행해서 확인한 것 (Unity 6000.3.10f1, Windows 11):

- `-CheckOnly` 사전 점검 통과
- `projects create` → Git 초기 커밋 생성, `Library/`가 Git에 포함되지 않음
- `pipeline install` → `Packages/manifest.json`에 `com.unity.pipeline` 추가
- `skill install claude-code --local` → `.claude/skills/unity-cli` 설치
- `MultiplayerPackageInstaller.cs`를 헤드리스 Editor로 컴파일: `error CS` 없음
- 전체 스크립트로 새 프로젝트 생성 후 헤드리스 단계: `services.multiplayer` 2.4.1, `netcode.gameobjects` 2.13.3이 lock에 기록되고 Burst 1.8.29로 올라감, `ProjectSetup.Run` 종료 코드 0
- Editor 실행 중 설치 스크립트로 `multiplayer.center` 1.0.1, `services.multiplayer` 2.4.1, `netcode.gameobjects` 2.13.3 설치 확인

아직 확인하지 않은 것:

- 처음 Editor 창을 열 때 "URP material upgrade"와 "Burst Package Update Detected" 창이 뜨지 않는지 (GUI에서 확인하지 못함). 테스트 프로젝트에는 업그레이드할 머티리얼이 없어서 머티리얼 업그레이드 효과도 확인하지 못함
- 배치 모드에서는 `Client.Add`가 끝나기 전에 Editor가 종료되므로, 패키지 설치는 manifest 기록 방식으로 바꿨습니다
- Multiplayer Center 창의 선택 흐름과 Services 링크 단계
- 공식 `Unity.gitignore` 다운로드 (네트워크 의존, 실패하면 kit 기본 파일로 대체)

## 알아둘 점

- 이전 버전 킷으로 만든 기존 프로젝트에는 이 변경이 적용되지 않습니다. `ProjectSetup.cs`를 복사한 뒤 `unity run <프로젝트 경로> -- -executeMethod ProjectSetup.Run`을 실행하면 URP 머티리얼을 미리 업그레이드할 수 있습니다. Burst 확인 창은 한 번 더 뜰 수 있습니다.
- 로그인/라이선스 상태는 스크립트가 검사하지 않습니다. 문제가 생기면 `unity auth status`, `unity license status`로 확인하세요.
- 긴 경로(260자 이상)에서 패키지 DLL 경로 오류가 날 수 있습니다. 프로젝트를 짧은 경로(예: `D:\UnityProjects`)에 만드세요.
- 실패 시 `unity doctor --format json`으로 인증, Editor, 최근 오류를 한 번에 볼 수 있습니다.
