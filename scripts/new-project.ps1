#Requires -Version 5.1
<#
.SYNOPSIS
    Unity 6 프로젝트를 CLI로 만들고 Pipeline, Claude Code, Multiplayer 기본 세팅을 한 번에 적용한다.

.EXAMPLE
    .\scripts\new-project.ps1 -Name MyGame -Path D:\UnityProjects

.EXAMPLE
    .\scripts\new-project.ps1 -CheckOnly
#>
param(
    [string]$Name,
    [string]$Path,
    [string]$Editor,
    [string]$Template = 'com.unity.template.urp-blank',
    [switch]$SkipGit,
    [switch]$Lfs,
    [switch]$SkipMultiplayer,
    [switch]$SkipLogin,
    [switch]$Open,
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$kitRoot = Split-Path -Parent $PSScriptRoot
$templateDir = Join-Path $kitRoot 'template'

function Write-Step([string]$Message) {
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Unity {
    param([string[]]$UnityArgs)
    & unity @UnityArgs --no-banner --non-interactive
    if ($LASTEXITCODE -ne 0) {
        throw "unity $($UnityArgs -join ' ') 실패 (exit $LASTEXITCODE)"
    }
}

function Invoke-Git {
    param([string[]]$GitArgs)
    # git은 경고를 stderr로 내보내므로 Stop 모드에서는 종료 코드로만 판단한다.
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = & git @GitArgs 2>&1 | ForEach-Object { "$_" }
    } finally {
        $ErrorActionPreference = $previous
    }
    if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') 실패: $($output -join ' ')" }
    return $output
}

function Get-InstalledEditors {
    $raw = & unity editors --installed --format json --no-banner --no-pager | Out-String
    $result = $raw | ConvertFrom-Json
    if (-not $result.success) { throw "unity editors 실패: $raw" }
    return @($result.data)
}

function Get-EditorVersion([string]$Version) {
    # 6000.3.10f1 -> [version]6000.3.10
    return [version]($Version -replace '[a-zA-Z].*$', '')
}

function Get-UnityLoginState {
    $raw = & unity auth status --json --no-banner --no-pager | Out-String
    $result = $raw | ConvertFrom-Json
    if (-not $result.success) { throw "unity auth status 실패: $raw" }
    return [bool]$result.data.loggedIn
}

# 프로젝트를 만들기 전에 Unity 계정으로 로그인되어 있는지 확인한다. 없으면 브라우저 로그인을 연다.
function Confirm-UnityLogin {
    if (Get-UnityLoginState) {
        Write-Host 'Unity 계정: 로그인됨'
        return
    }
    Write-Host 'Unity 계정에 로그인되어 있지 않습니다. 브라우저에서 로그인을 진행하세요.'
    & unity auth login --no-banner
    if ($LASTEXITCODE -ne 0 -or -not (Get-UnityLoginState)) {
        throw 'Unity 로그인에 실패했습니다. `unity auth login`을 직접 실행한 뒤 다시 시도하세요. 로그인을 건너뛰려면 -SkipLogin 을 붙이세요.'
    }
}

# 레지스트리에서 Editor 버전과 호환되는 가장 높은 안정 버전을 고른다. (Client.Search의 latestCompatible과 같은 기준)
function Get-LatestCompatibleVersion([string]$Package, [string]$Editor) {
    $info = Invoke-RestMethod -Uri "https://packages.unity.com/$Package" -TimeoutSec 60
    $editorMajor = [version]((Get-EditorVersion $Editor) -replace '^(\d+\.\d+).*$', '$1')
    $candidates = $info.versions.PSObject.Properties.Value | Where-Object {
        $_.version -notmatch '-' -and $_.unity -and ([version]$_.unity -le $editorMajor)
    }
    $latest = $candidates | Sort-Object { [version]$_.version } -Descending | Select-Object -First 1
    if (-not $latest) { throw "$Package 의 호환 버전을 찾지 못했습니다 (Unity $Editor)." }
    return $latest.version
}

# Client.Add는 배치 모드에서 끝까지 기다릴 수 없으므로, manifest에 버전을 적어 두고 Unity가 로드할 때 설치하게 한다.
# Burst를 끌어오는 패키지만 미리 넣는다. Multiplayer Center는 Burst에 의존하지 않으므로 GUI 설치 스크립트에 맡긴다.
function Add-MultiplayerPackages([string]$ProjectDir, [string]$Editor) {
    $packages = @('com.unity.services.multiplayer', 'com.unity.netcode.gameobjects')
    $manifestPath = Join-Path $ProjectDir 'Packages\manifest.json'
    $manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
    foreach ($package in $packages) {
        $version = Get-LatestCompatibleVersion $package $Editor
        Write-Host "$package : $version"
        $manifest.dependencies | Add-Member -NotePropertyName $package -NotePropertyValue $version -Force
    }
    $json = $manifest | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($manifestPath, $json, (New-Object System.Text.UTF8Encoding $false))
}

# ---------------------------------------------------------------- preflight
Write-Step '사전 점검'

if (-not (Get-Command unity -ErrorAction SilentlyContinue)) {
    throw "unity CLI가 없습니다. 설치: `$env:UNITY_CLI_CHANNEL='beta'; irm https://public-cdn.cloud.unity3d.com/hub/prod/cli/install.ps1 | iex"
}
Write-Host "unity CLI : $(& unity --version)"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'git이 설치되어 있지 않습니다.' }
Write-Host "git       : $(git --version)"

if (Get-Command claude -ErrorAction SilentlyContinue) {
    Write-Host "claude    : $(claude --version)"
} else {
    Write-Warning 'claude CLI를 찾지 못했습니다. Claude Code 연결 단계는 건너뛰지 않지만 나중에 claude를 설치해야 합니다.'
}

$editors = Get-InstalledEditors
$unity6 = @($editors | Where-Object { $_.version -like '6000.*' })
if ($unity6.Count -eq 0) {
    throw 'Unity 6(6000.x) Editor가 없습니다. Unity Hub에서 설치한 뒤 다시 실행하세요.'
}

if (-not $Editor) {
    $Editor = ($unity6 | Sort-Object { Get-EditorVersion $_.version } -Descending | Select-Object -First 1).version
    Write-Host "Editor 자동 선택: $Editor"
} elseif (-not ($editors | Where-Object { $_.version -eq $Editor })) {
    throw "Editor $Editor 가 설치되어 있지 않습니다. 설치된 목록: $(($editors | ForEach-Object { $_.version }) -join ', ')"
}

if ($CheckOnly) {
    if (Get-UnityLoginState) { Write-Host 'Unity 계정: 로그인됨' } else { Write-Warning 'Unity 계정: 로그인되어 있지 않습니다. 생성 시 로그인을 진행합니다.' }
    Write-Host ''
    Write-Host '사전 점검 통과.' -ForegroundColor Green
    exit 0
}

if (-not $Name) { throw '-Name 을 지정하세요. 예: -Name MyGame' }
if (-not $Path) { throw '-Path 을 지정하세요. 예: -Path D:\UnityProjects' }

$projectDir = Join-Path $Path $Name
if (Test-Path $projectDir) { throw "이미 존재합니다: $projectDir" }

# ---------------------------------------------------------------- login
if (-not $SkipLogin) {
    Write-Step 'Unity 로그인 확인'
    Confirm-UnityLogin
}

# ---------------------------------------------------------------- create
Write-Step "프로젝트 생성: $Name ($Editor, $Template)"
New-Item -ItemType Directory -Force -Path $Path | Out-Null
Invoke-Unity @('projects', 'create', $Name, '--path', $Path,
    '--editor-version', $Editor, '--template', $Template, '--no-cloud')

if (-not (Test-Path (Join-Path $projectDir 'ProjectSettings'))) {
    throw "프로젝트 생성 결과를 찾지 못했습니다: $projectDir"
}

# ---------------------------------------------------------------- git
if (-not $SkipGit) {
    Write-Step 'Git 저장소 초기화'
    Push-Location $projectDir
    try {
        Invoke-Git @('init', '-b', 'main') | Out-Null

        $gitignoreUrl = 'https://raw.githubusercontent.com/github/gitignore/main/Unity.gitignore'
        try {
            Invoke-WebRequest -Uri $gitignoreUrl -OutFile '.gitignore' -UseBasicParsing
        } catch {
            Copy-Item -Force (Join-Path $templateDir '.gitignore') '.gitignore'
            Write-Warning '공식 Unity .gitignore 다운로드 실패. kit 기본 .gitignore를 사용합니다.'
        }

        if ($Lfs) {
            Invoke-Git @('lfs', 'install') | Out-Null
            foreach ($pattern in @('*.psd', '*.fbx', '*.wav', '*.mp3', '*.png', '*.jpg', '*.mp4')) {
                Invoke-Git @('lfs', 'track', $pattern) | Out-Null
            }
        }

        Invoke-Git @('add', '-A') | Out-Null
        Invoke-Git @('commit', '-m', "Initial Unity project: $Name") | Out-Null

        $libraryTracked = @(Invoke-Git @('ls-files') | Where-Object { $_ -like 'Library/*' }).Count
        if ($libraryTracked -ne 0) { throw 'Library/ 가 Git에 포함되었습니다. .gitignore를 확인하세요.' }
    } finally {
        Pop-Location
    }
}

# ---------------------------------------------------------------- pipeline
Write-Step 'Unity Pipeline 패키지 설치'
Invoke-Unity @('pipeline', 'install', '--project-path', $projectDir)

# ---------------------------------------------------------------- claude code
Write-Step 'Claude Code 연결 (프로젝트 지침 + unity-cli 스킬 + 권한 설정)'
Copy-Item -Force (Join-Path $templateDir 'CLAUDE.md') (Join-Path $projectDir 'CLAUDE.md')
$claudeDir = Join-Path $projectDir '.claude'
New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null
Copy-Item -Force (Join-Path $templateDir '.claude\settings.json') (Join-Path $claudeDir 'settings.json')
Copy-Item -Recurse -Force (Join-Path $templateDir '.claude\agents') $claudeDir
Copy-Item -Recurse -Force (Join-Path $templateDir '.claude\hooks') $claudeDir

Push-Location $projectDir
try {
    Invoke-Unity @('skill', 'install', 'claude-code', '--local', '--yes')
} finally {
    Pop-Location
}

# ---------------------------------------------------------------- multiplayer
if (-not $SkipMultiplayer) {
    Write-Step 'Multiplayer 기본 설정 파일 복사'
    $editorDir = Join-Path $projectDir 'Assets\Editor\StarterKit'
    New-Item -ItemType Directory -Force -Path $editorDir | Out-Null
    Copy-Item -Force (Join-Path $templateDir 'Assets\Editor\StarterKit\*.cs') $editorDir

    # Editor 창을 열기 전에 패키지 설치와 URP 머티리얼 업그레이드를 끝낸다.
    # 그래야 처음 열 때 Burst/URP 업그레이드 확인 창이 뜨지 않는다.
    Write-Step '멀티플레이어 패키지를 manifest에 추가'
    Add-MultiplayerPackages $projectDir $Editor

    Write-Step '헤드리스 준비 (패키지 설치 + URP 머티리얼 업그레이드)'
    & unity run $projectDir --editor-version $Editor --no-banner --non-interactive -- -executeMethod ProjectSetup.Run
    if ($LASTEXITCODE -ne 0) { throw "헤드리스 준비 실패 (exit $LASTEXITCODE)" }
}

# ---------------------------------------------------------------- done
Write-Step '완료'
Write-Host "프로젝트: $projectDir"
Write-Host '다음 단계는 README.md의 "Multiplayer Center 설정" 항목을 따르세요.'

if ($Open) {
    Invoke-Unity @('open', $projectDir, '--editor-version', $Editor)
}
