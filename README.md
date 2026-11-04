# Muscle Calculator

增肌 / 减脂 / 维持 / 休息 四种场景的饮食计算器，单文件网页。

在线使用：**https://<你的用户名>.github.io/muscle-calculator/**

## 本地修改流程

```bash
python3 build.py          # 把 src/ 打包成 index.html
open index.html           # 本地预览
git add -A && git commit -m "update" && git push
```

push 之后 GitHub Actions 会自动重新构建并发布，链接不变。

## 目录

- `src/` — 源码（HTML 模板、CSS、数据、逻辑）
- `build.py` — 打包脚本
- `index.html` — 构建产物（不要手改）
- `.github/workflows/deploy.yml` — 自动部署

## 说明

- 记录保存在浏览器 localStorage，不上传、不同步。
- 所有营养数值为区间估算，不构成医疗建议。
