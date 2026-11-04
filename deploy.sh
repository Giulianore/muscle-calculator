#!/bin/bash
# 一键更新：打包 → 提交 → 推送（GitHub Actions 会自动重新部署）
set -e
cd "$(dirname "$0")"
python3 build.py
git add -A
if git diff --cached --quiet; then
  echo "没有改动，跳过提交"
  exit 0
fi
git commit -m "update $(date '+%Y-%m-%d %H:%M')"
git push
echo ""
echo "已推送，约 30–60 秒后自动上线："
echo "https://giulianore.github.io/muscle-calculator/"
