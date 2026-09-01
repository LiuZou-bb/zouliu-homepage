# 邹柳 (Julian Silas) 个人主页 — AI 协作工作流

## 项目概览

- **路径**: D:\AI\ChatgGPT\ChatGPT\个人网站\个人主页
- **本地预览**: http://localhost:8080 (node server.js)
- **线上地址**: https://liuzou-bb.github.io/zouliu-homepage/
- **技术栈**: 纯静态 HTML + CSS + Vanilla JS，无框架、无构建工具
- **语言**: 中英双语，通过 i18n 字典切换

---

## 文件结构

```
个人主页/
├── index.html              # 主页面 (单页应用，所有内容在一个文件)
├── server.js               # 本地开发服务器 (端口 8080，处理中文路径 URL 编码)
├── deploy.ps1              # 一键部署脚本 (git add/commit/push)
├── 一键更新网站.bat          # 双击运行 deploy.ps1 的启动器
├── i18n-workflow.md        # 中英文切换操作规范
├── css/
│   └── styles.css          # 全部样式 (无框架)
├── js/
│   ├── zh.js               # 中文翻译字典 (var ZH = {...})
│   ├── en.js               # 英文翻译字典 (var EN = {...})
│   ├── i18n.js             # 翻译引擎 (语言切换核心)
│   ├── ui.js               # UI 交互 (哲学面板、人格测试详情、滚动动画、导航高亮)
│   ├── moments.js          # 朋友圈数据 + 渲染 + 弹窗
│   └── interview.js        # 访谈23问数据 + 渲染 + 折叠/展开
└── images/
    ├── avatar.jpg          # 头像
    ├── 16PF.jpg/epq-r.jpg/neo-pi-r.jpg  # 人格测试量表截图
    └── 朋友圈文案/          # 仅保留确认公开的图片素材
```

---

## 页面结构 (Sections 顺序)

1. **Hero** — 头像、姓名(邹柳/Julian Silas)、副标题、两个CTA按钮
2. **Philosophy** — 4个理念卡片(流体智慧/复利成长/实践检验/终身学习)，点击展开详情面板
3. **Personality** — 3份人格测试量表(16PF/EPQ-R/NEO-PI-R)，点击进入详情
4. **Body** — 身体快速使用手册，折叠面板
5. **Skills** — 技能标签云
6. **Love** — 对爱的理解 (7个子面板)
7. **Childhood** — 对童年塑造的理解 (7个子面板)
8. **Friend** — 希望和这样的人交朋友
9. **Dream** — 我梦的解析 (弹出亲密关系模态框)
10. **Sorry** — 想对你说 / 原谅 (诗歌，不翻译)
11. **Moments** — 朋友圈时间线，按年折叠
12. **Interview** — 23问访谈 + 参与好处

---

## i18n 翻译机制 (核心)

### 字典格式
zh.js 和 en.js 都是 `var ZH/EN = { key: "value", ... }` 格式。
两个文件的 key 数量必须完全一致。

### 翻译方式 (5种)

| 方式 | HTML 属性 | 说明 |
|------|----------|------|
| 文本替换 | `data-i="key"` | `el.textContent = DICT[key]` |
| HTML替换 | `data-i-inner="key"` | `el.innerHTML = DICT[key]` (支持标签) |
| placeholder | `data-i-placeholder="key"` | 输入框占位符 |
| aria-label | `data-i-aria="key"` | 无障碍标签 |
| alt属性 | `data-i-alt="key"` | 图片 alt |
| 动态渲染 | JS 中调用 | moments/interview/philosophy 按钮在 JS 中动态设置 |

### 语言切换流程
```
用户点击 EN/中 按钮
→ DICT = (DICT===EN) ? ZH : EN
→ localStorage.setItem('lang', ...)
→ applyI18n()          // 扫描所有 data-i 元素
→ refreshPhilButtons() // 刷新哲学面板按钮文案
→ renderMoments()      // 重渲染朋友圈(清空+重建)
→ renderInterview()    // 重渲染访谈问题
→ refreshInterviewToggle() // 刷新折叠按钮文案
```

### 不翻译的内容
- 诗歌正文（《对不起》《原谅》）
- Emoji 图标
- URL 链接
- 人格测试量表截图（图片本身）

---

## 常见修改场景

### 1. 修改文案（不改结构）
1. 改 zh.js 中对应的 key 值
2. 改 en.js 中对应的 key 值（意译，保持英语自然）
3. 确保两个文件 key 数量一致
4. 运行 `node -c js/zh.js && node -c js/en.js` 检查语法
5. 刷新浏览器验证

### 2. 新增页面元素
1. 在 index.html 中添加 HTML，加上 `data-i="new_key"`
2. 在 zh.js 的 `};` 前加 `new_key: "中文",`
3. 在 en.js 的 `};` 前加 `new_key: "English",`
4. 确保上一行有逗号，新行也有逗号
5. 语法检查 → 刷新验证

### 3. 修改朋友圈内容
- 图片: 只将确认公开的图片放入 `images/朋友圈文案/YYYY.M.D/` 文件夹
- 数据: 修改 `js/moments.js` 中的 `momentsPosts` 数组；私人原稿保存在网站仓库外的私人归档
- 每个帖子: `{ dir, title, body, titleEn, bodyEn, imgs: [...] }`
- 删除帖子: 直接从数组中移除该对象，清理逗号

### 4. 修改访谈问题
- 数据文件: `js/interview.js` — `interviewQuestions` 数组 + `renderInterview()`
- 修改后需同时更新中英文，按钮文案中的数字也要改

### 5. 修改样式
- 所有样式在 `css/styles.css`
- CSS 变量定义在 `:root` (颜色、字体、阴影等)
- 响应式断点: 768px、480px
- 手机端优先测试 480px 以下

---

## 开发调试

### 启动服务器
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -WorkingDirectory "D:\AI\ChatgGPT\ChatGPT\个人网站\个人主页"
```

### 语法检查
```bash
node -c js/zh.js && node -c js/en.js && node -c js/i18n.js && node -c js/ui.js && node -c js/moments.js && node -c js/interview.js
```

### Key 数量检查
```powershell
(Select-String -Path "js/zh.js" -Pattern '^\s+\w+:' | Measure-Object).Count
(Select-String -Path "js/en.js" -Pattern '^\s+\w+:' | Measure-Object).Count
```

### 部署上线
双击 `一键更新网站.bat`，自动 git add/commit/push → 1-2分钟后 GitHub Pages 生效。

---

## 注意事项 (踩过的坑)

1. **zh.js/en.js 的 key 行必须以逗号结尾**，最后一行除外。缺失逗号会导致整个文件语法错误。
2. **JS 字符串中的双引号必须转义** `\"`，或使用中文引号 `“”`
3. **朋友圈图片路径含中文和全角冒号**（如 `22：48`），server.js 已做 decodeURIComponent 处理
4. **index.html 的行尾是 CRLF (`\r\n`)**，Windows PowerShell 写文件时注意编码
5. **data-i-inner 用于含 HTML 标签的值**，data-i 用于纯文本。用错会导致标签显示为文本
6. **手机端导航按钮容易溢出**，修改字体大小时务必在 480px 断点测试
7. **哲学面板按钮文案**由 `ui.js` 中的 `refreshPhilButtons()` 动态设置，不在 HTML 的 data-i 覆盖范围内
8. **朋友圈和访谈内容**在语言切换时完全重建 DOM（`innerHTML = ''`），不要在其中保存 JS 引用
