# 中英文切换工作流

每次新增内容或发现未翻译处，严格按以下步骤执行。

## 步骤

### 1. 扫描：找出所有新增/遗漏的中文

```bash
# HTML中无data-i的中文
rg '[\u4e00-\u9fff]+' index.html | rg -v 'data-i=' | rg -v '<!--'

# JS中硬编码中文
rg '[\u4e00-\u9fff]+' js/ui.js js/moments.js js/interview.js
```

### 2. 添加到 zh.js

- 在 `js/zh.js` 的 `};` 前新增 key
- Key命名规范：
  - 页面元素：`{section}_{element}` 如 `about_title`
  - 列表项：`{section}{n}` 如 `iq1`, `fb0`
  - 段落：`{section}_p{n}` 如 `childhood_p1`
  - 按钮文案：`{section}_{action}` 如 `phil_collapse`
- **诗歌正文不翻译**，不加入字典

### 3. 意译到 en.js

- 在 `js/en.js` 的 `};` 前新增同名 key，值用英文意译
- 意译原则：传达含义而非逐字翻译，保持英语自然流畅

### 4. 接通触发点

**HTML文本** → 加 `data-i="key名"`：
```html
<!-- 之前 -->
<h2>关于我</h2>
<!-- 之后 -->
<h2 data-i="about_title">关于我</h2>
```

**HTML带格式文本**（含 `<br>` `<strong>` `<span>`）→ 加 `data-i-inner="key名"`：
```html
<p data-i-inner="interview_invite_html">...</p>
```
同时在 zh.js/en.js 中存完整HTML字符串。

**HTML属性**（如 aria-label）→ 加 `data-i-aria="key名"`。

**JS中的硬编码** → 改用 DICT 查找：
```js
// 之前
'亲密度不够'
// 之后
(typeof DICT!=='undefined' && DICT.intimacy_title) ? DICT.intimacy_title : '亲密度不够'
```

### 5. 验证

```bash
# 语法检查
node -c js/zh.js && node -c js/en.js && node -c js/i18n.js && node -c js/ui.js && node -c js/moments.js && node -c js/interview.js
# key数量一致
rg -c '^\s+\w+:' js/zh.js && rg -c '^\s+\w+:' js/en.js
# 浏览器中点击 EN/中 按钮测试切换
```

## 关键规则

- **永远不改动硬编码中文本身**——只通过字典 + data-i 切换
- **zh.js 和 en.js key 必须一一对应**，数量和名称完全一致
- **诗歌不翻译**（《对不起》《原谅》正文永远保留中文）
- **图标 emoji 不翻译**，直接保留
- **URL 不翻译**
