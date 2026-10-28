# PreToolUse: Unity YAML 직접 편집과 보호 경로 수정을 막는다.
# 차단하려면 exit 2로 종료하고 stderr 메시지가 Claude에게 전달된다.
$ErrorActionPreference = 'Stop'

$payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
$path = [string]$payload.tool_input.file_path
if (-not $path) { exit 0 }

$normalized = $path -replace '\\', '/'

if ($normalized -match '\.(unity|prefab|asset|meta)$') {
    [Console]::Error.WriteLine("Unity YAML($([IO.Path]::GetExtension($normalized)))은 직접 편집하지 않습니다. 'unity command'로 Editor를 통해 수정하세요. (CLAUDE.md 참고)")
    exit 2
}

if ($normalized -match '(^|/)Packages/(manifest|packages-lock)\.json$') {
    [Console]::Error.WriteLine("Packages/manifest.json은 직접 수정하지 않습니다. unity-package-management 스킬이나 Package Manager를 사용하세요.")
    exit 2
}

if ($normalized -match '(^|/)(Library|Temp)/') {
    [Console]::Error.WriteLine("Library/Temp는 Unity가 생성하는 폴더라 수정하지 않습니다.")
    exit 2
}

exit 0
