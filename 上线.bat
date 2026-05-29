@echo off
cd /d "D:\AI\codex\ds\个人主页"

echo === 1. 登录 GitHub ===
gh auth login

echo === 2. 创建仓库 ===
gh repo create zouliu-homepage --public --source=. --remote=origin --push

echo === 3. 启用 GitHub Pages ===
gh api repos/:owner/zouliu-homepage/pages -X POST -f "source[branch]=master" -f "source[path]=/"

echo === 4. 完成！ ===
echo 网站地址: https://你的用户名.github.io/zouliu-homepage/
echo (可能需要等 1-2 分钟生效)
pause
