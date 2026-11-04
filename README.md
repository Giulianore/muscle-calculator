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

## 目录

- `src/` — 源码（HTML 模板、CSS、数据、逻辑）
- `build.py` — 打包脚本
- `index.html` — 构建产物（不要手改）
- `.github/workflows/deploy.yml` — 自动部署

## 说明

- 记录保存在浏览器 localStorage，不上传、不同步。
- 所有营养数值为区间估算，不构成医疗建议。
