# ============================================================
# 一键更新网站 — 自动 push 到 GitHub Pages
# 网站地址: https://liuzou-bb.github.io/zouliu-homepage/
# ============================================================

$ErrorActionPreference = "Stop"
$repoDir = $PSScriptRoot

# Windows PowerShell 5.1 turns redirected native stderr into error records.
# Git also writes successful progress there, so inspect its exit code explicitly.
function Invoke-DeployGit {
    param([string[]]$GitArguments)
    $ErrorActionPreference = "Continue"
    $PSNativeCommandUseErrorActionPreference = $false
    $nativeOutput = @(& git @GitArguments 2>&1)
    $nativeExitCode = $LASTEXITCODE
    [pscustomobject]@{
        ExitCode = $nativeExitCode
        Output = @($nativeOutput | ForEach-Object { $_.ToString() })
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $repoDir ".git"))) {
    Write-Host "  未找到网站仓库，请确认脚本位于个人主页文件夹中。" -ForegroundColor Red
    pause
    exit 1
}

Set-Location -LiteralPath $repoDir
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  未找到 Git，请先安装 Git。" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  个人网站一键部署" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 显示变更文件
Write-Host "[1/3] 检测变更..." -ForegroundColor Green
$status = Invoke-DeployGit -GitArguments @('status', '--short')
if ($status.ExitCode -ne 0) {
    $status.Output | ForEach-Object { Write-Host $_ }
    Write-Host "  无法读取文件状态，请检查仓库。" -ForegroundColor Red
    pause
    exit 1
}
$hasChanges = @($status.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count -gt 0
$status.Output | ForEach-Object { Write-Host $_ }

# 2. 提交
$time = Get-Date -Format "yyyy-MM-dd HH:mm"
Write-Host ""
if ($hasChanges) {
    Write-Host "[2/3] 提交更新 ($time)..." -ForegroundColor Green
    $stage = Invoke-DeployGit -GitArguments @('add', '-A', '--', '.')
    if ($stage.ExitCode -ne 0) {
        $stage.Output | ForEach-Object { Write-Host $_ }
        Write-Host "  暂存失败，请检查文件状态。" -ForegroundColor Red
        pause
        exit 1
    }
    $commit = Invoke-DeployGit -GitArguments @('commit', '-m', "更新 $time")
    if ($commit.ExitCode -ne 0) {
        $commit.Output | ForEach-Object { Write-Host $_ }
        Write-Host "  提交失败，请检查。" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "  已提交。" -ForegroundColor White
} else {
    Write-Host "[2/3] 没有新文件改动，检查待推送提交..." -ForegroundColor Green
    $pending = Invoke-DeployGit -GitArguments @('rev-list', '--count', '@{upstream}..HEAD')
    if ($pending.ExitCode -eq 0 -and ($pending.Output -join '').Trim() -eq '0') {
        Write-Host "  没有变更，无需更新。" -ForegroundColor Gray
        pause
        exit 0
    }
}

# 3. 推送
Write-Host ""
Write-Host "[3/3] 推送到 GitHub..." -ForegroundColor Green
$push = Invoke-DeployGit -GitArguments @('push')
$push.Output | ForEach-Object { Write-Host $_ }
if ($push.ExitCode -ne 0) {
    Write-Host "  推送失败！请检查网络/VPN。" -ForegroundColor Red
    pause
    exit 1
}

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署成功！1-2 分钟后生效" -ForegroundColor Yellow
Write-Host "  https://liuzou-bb.github.io/zouliu-homepage/" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pause
exit 0
