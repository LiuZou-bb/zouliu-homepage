# ============================================================
# 一键更新网站 — 自动 push 到 GitHub Pages
# 网站地址: https://liuzou-bb.github.io/zouliu-homepage/
# ============================================================

$ErrorActionPreference = "Stop"
$repoDir = $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $repoDir ".git"))) {
    Write-Host "  未找到网站仓库，请确认脚本位于个人主页文件夹中。" -ForegroundColor Red
    pause
    exit 1
}

Set-Location -LiteralPath $repoDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  个人网站一键部署" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 显示变更文件
Write-Host "[1/3] 检测变更..." -ForegroundColor Green
$changes = git status --short 2>&1
if ($changes -eq "" -or $changes -match "nothing to commit") {
    Write-Host "  没有变更，无需更新。" -ForegroundColor Gray
    Write-Host ""
    pause
    exit
}
Write-Host $changes

# 2. 提交
$time = Get-Date -Format "yyyy-MM-dd HH:mm"
Write-Host ""
Write-Host "[2/3] 提交更新 ($time)..." -ForegroundColor Green
git add -A -- .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  暂存失败，请检查文件状态。" -ForegroundColor Red
    pause
    exit 1
}
git commit -m "更新 $time" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  提交失败，请检查。" -ForegroundColor Red
    pause
    exit
}
Write-Host "  已提交。" -ForegroundColor White

# 3. 推送
Write-Host ""
Write-Host "[3/3] 推送到 GitHub..." -ForegroundColor Green
git push 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  推送失败！请检查网络/VPN。" -ForegroundColor Red
    pause
    exit
}

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署成功！1-2 分钟后生效" -ForegroundColor Yellow
Write-Host "  https://liuzou-bb.github.io/zouliu-homepage/" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pause
