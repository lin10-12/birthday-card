# 生日电子贺卡 · Birthday Card H5

一份精致温柔的手机端生日电子贺卡，使用原生 HTML / CSS / JavaScript 实现，无需任何框架或第三方库。可直接在手机浏览器或微信内打开。

---

## 项目结构

```
birthday-card/
├─ index.html      # 页面结构（姓名、照片、祝福语等）
├─ style.css       # 样式与动画
├─ script.js       # 交互逻辑（打字机、音乐、烟花等）
├─ assets/
│  ├─ photo1.jpg   # 照片 1（请替换）
│  ├─ photo2.jpg   # 照片 2（请替换）
│  ├─ photo3.jpg   # 照片 3（请替换）
│  ├─ photo4.jpg   # 照片 4（请替换）
│  └─ music.mp3    # 背景音乐（请替换）
└─ README.md
```

---

## 如何替换姓名

打开 `index.html`，找到封面标题区域：

```html
<span class="glow-text glow-text--accent">To Dear You</span>
```

将 `To Dear You` 改为对方的名字，例如：

```html
<span class="glow-text glow-text--accent">To 小美</span>
```

如需修改页面标题，可同步修改 `<title>` 标签中的文字。

---

## 如何替换照片

1. 准备 4 张 JPG 或 PNG 图片（建议横向 4:3 比例，宽度 800px 以上）。
2. 将图片重命名为 `photo1.jpg` ~ `photo4.jpg`。
3. 放入 `assets/` 目录，覆盖原有占位图。
4. 如需修改照片说明文字，在 `index.html` 中找到对应 `.photo-caption` 修改即可。
5. 如需修改照片路径，修改对应 `<img src="assets/photo1.jpg">` 的 `src` 属性。

> **提醒**：当前 `assets/` 中的照片为自动生成的占位图，请替换为真实照片后再发送给对方。

---

## 如何替换背景音乐

1. 准备一首 MP3 格式的音乐文件（建议 2~5 分钟，文件小于 5MB）。
2. 重命名为 `music.mp3`，放入 `assets/` 目录。
3. 如需使用其他文件名，同时修改 `index.html` 中：

```html
<audio id="bgMusic" src="assets/music.mp3" loop preload="metadata"></audio>
```

---

## 如何修改祝福文字

### 打字机祝福正文

打开 `script.js`，修改 `CONFIG.blessingText`：

```javascript
const CONFIG = {
  blessingText:
    '今天是一个特别的日子……',
  // ...
};
```

使用 `\n` 换行，打字机效果会自动处理中文换行。

### 弹窗祝福内容

打开 `index.html`，找到 `.modal-body` 区域直接修改 HTML 文字即可。

### 照片下方短文案

在 `index.html` 的 `.photo-caption` 中修改。

---

## 如何在本地预览

### 方法一：直接打开（简单预览）

双击 `index.html` 用浏览器打开。部分功能（如音乐）可能因浏览器安全策略受限。

### 方法二：本地服务器（推荐）

**Python 3：**

```bash
cd birthday-card
python -m http.server 8080
```

浏览器访问：`http://localhost:8080`

**Node.js（如已安装 npx）：**

```bash
cd birthday-card
npx serve .
```

**VS Code：** 安装 Live Server 插件，右键 `index.html` → Open with Live Server。

---

## 如何部署到 GitHub Pages

1. 在 GitHub 创建一个新仓库（例如 `birthday-card`）。
2. 将 `birthday-card` 文件夹内的所有文件推送到仓库根目录。
3. 进入仓库 **Settings → Pages**。
4. Source 选择 **Deploy from a branch**。
5. Branch 选择 `main`，文件夹选择 `/ (root)`，点击 Save。
6. 等待 1~2 分钟，访问 `https://你的用户名.github.io/birthday-card/`。

> 如果仓库名就是 `birthday-card`，访问地址为 `https://用户名.github.io/birthday-card/`。

发送链接给对方即可在手机浏览器或微信中打开。

---

## 常见问题

### 为什么音乐不能自动播放？

现代浏览器（Chrome、Safari、微信内置浏览器等）**禁止网页自动播放音频**，必须由用户主动交互（点击按钮）后才能播放。

本贺卡的设计是：
- 默认不自动播放；
- 用户点击「点击开启生日惊喜」或右上角音乐按钮后才会尝试播放。

这是正常行为，不是 bug。

### 为什么图片不显示？

可能原因：

1. **尚未替换占位图** — 请将真实照片放入 `assets/` 目录。
2. **文件名或路径错误** — 确认文件名为 `photo1.jpg` 等，且 `index.html` 中路径正确。
3. **图片格式不支持** — 建议使用 JPG 或 PNG。
4. **本地直接打开 HTML** — 某些浏览器对 `file://` 协议有限制，请使用本地服务器预览。
5. **GitHub Pages 未上传图片** — 确认 `assets/` 文件夹已一并推送到仓库。

图片加载失败时，页面会显示「请替换照片」的优雅占位提示，不会报错。

### 微信内打开时音乐播放受限怎么办？

微信内置浏览器对音频播放限制较严：

1. 引导对方**先点击「点击开启生日惊喜」按钮**，再点击右上角音乐按钮。
2. 部分安卓机型需要**关闭微信的「静音」模式**。
3. iOS 用户需确认手机侧边静音开关未开启。
4. 若仍无法播放，可接受「无声版」贺卡，或改用微信分享时附带一段语音/视频祝福作为补充。

音乐播放失败时，页面会在控制台输出提示，**不会影响其他功能正常使用**。

---

## 自定义主题色

打开 `style.css` 顶部的 `:root` 变量即可调整配色：

```css
:root {
  --accent-gold: #e8c87a;    /* 金色点缀 */
  --accent-pink: #f0a8c8;    /* 粉色点缀 */
  --accent-lavender: #c4b5fd; /* 淡紫色点缀 */
}
```

---

## 技术说明

- 纯原生 HTML / CSS / JavaScript，零依赖
- 移动端优先，桌面端居中显示（最大宽度 480px）
- 使用 Intersection Observer 实现滚动动画与打字机触发
- Canvas 实现温柔星光散开效果
- 支持 `prefers-reduced-motion` 无障碍偏好

---

祝你送出一份温暖的生日惊喜 ✨
