#Requires -Version 5.1
<#
.SYNOPSIS
    3D 프로젝트(Universal 3D 템플릿)를 만들고 기본 세팅을 적용한다. 실제 작업은 new-project.ps1이 한다.

.EXAMPLE
    .\scripts\new-project-3d.ps1 -Name MyGame -Path D:\UnityProjects
#>
param(
    [string]$Name,
    [string]$Path,
    [string]$Editor,
    [switch]$SkipGit,
    [switch]$Lfs,
    [switch]$SkipMultiplayer,
    [switch]$SkipLogin,
    [switch]$Open,
    [switch]$CheckOnly
)

& (Join-Path $PSScriptRoot 'new-project.ps1') @PSBoundParameters -Template 'com.unity.template.urp-blank'
exit $LASTEXITCODE
