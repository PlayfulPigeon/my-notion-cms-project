# SessionStart: 세션 시작 시 연결된 Unity Editor 상태를 컨텍스트로 넣는다.
# unity CLI가 없거나 응답아무것도 출력하지 않고 조용히 끝낸다.
$ErrorActionPreference = 'SilentlyContinue'

if (-not (Get-Command unity -ErrorAction SilentlyContinue)) { exit 0 }

$job = Start-Job -ScriptBlock { unity status 2>&1 | Out-String }
if (Wait-Job $job -Timeout 10) {
    $output = (Receive-Job $job).Trim()
    Write-Output "[Unity 상태] unity status 호출 완료"
    if ($output) {
        Write-Output ($output.Substring(0, [Math]::Min($output.Length, 2000)))
    }
}
Remove-Job $job -Force

exit 0
