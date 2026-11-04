# Muscle Calculator

增肌 / 减脂 / 维持 / 休息 四种场景的饮食计算器，单文件网页。

在线使用：**https://giulianore.github.io/muscle-calculator/**

## 本地修改流程（改完 push 即自动上线）

```bash
./deploy.sh               # 一键：打包 + 提交 + 推送
```

等价于：

```bash
python3 build.py
git add -A && git commit -m "update" && git push
```

push 之后 GitHub Actions 会自动重新构建并发布，链接不变。

页面底部「方法与依据」里有一行 `构建版本 v日期 · 8位哈希`。这个哈希是 `src/` 内容的指纹：
改了代码它就变，没改就是同一个值。拿它和线上页面对一眼，就知道有没有部署成功。


## 装到手机桌面（像 App 一样用）

线上地址：**https://giulianore.github.io/muscle-calculator/**

### iPhone / iPad（Safari）
1. 用 **Safari** 打开上面的链接（微信内置浏览器不行）
2. 点底部中间的「分享」按钮（方框向上箭头）
3. 下滑找到 **「添加到主屏幕」** → 右上角「添加」
4. 桌面出现橙色杠铃图标，点开是全屏的，没有地址栏

> 也可以：先点右上角「···」→「在 Safari 中打开」，再按上面步骤。

### 安卓（Chrome / Edge / 三星浏览器）
1. 用 **Chrome** 打开链接
2. 右上角「⋮」菜单 → **「安装应用」** 或 **「添加到主屏幕」**
   （部分机型会直接在页面底部弹出「安装」提示条，点它就行）
3. 确认后桌面出现图标，打开即全屏运行

> 小米/华为自带浏览器大多也支持「添加到桌面」，找不到的话换 Chrome。

### 说明
- 安装的是**同一个网页**，不是从应用商店下载的包；首次打开后即使断网也能用（Service Worker 缓存）。
- 数据仍然存在各自手机的浏览器里，不同设备之间不同步。
- **直接发 HTML 文件给别人**时没有这套安装能力——安装只对 https 链接有效（本地双击打开也不支持）。

## 目录

- `src/` — 源码（HTML 模板、CSS、数据、逻辑）
- `build.py` — 打包脚本
- `index.html` — 构建产物（不要手改）
- `.github/workflows/deploy.yml` — 自动部署

## 说明

- 记录保存在浏览器 localStorage，不上传、不同步。
- 所有营养数值为区间估算，不构成医疗建议。
