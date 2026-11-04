#!/usr/bin/env python3
"""把 src/ 下的 html/css/js 打包成单个 index.html（双击即用）。"""
from pathlib import Path
import hashlib, datetime, subprocess

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

template = (SRC / "index.html").read_text(encoding="utf-8")
css = (SRC / "styles.css").read_text(encoding="utf-8")
data = (SRC / "data.js").read_text(encoding="utf-8")
app = (SRC / "app.js").read_text(encoding="utf-8")

out = (template
       .replace("/*__STYLES__*/", css)
       .replace("/*__DATA__*/", data)
       .replace("/*__APP__*/", app))

def _git(*args):
    try:
        return subprocess.check_output(["git", *args], cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""

# 版本号跟随后一次提交，而不是构建时间：
# 同一份源码重复构建得到同一个版本号，方便核对线上是否最新
commit = _git("log", "-1", "--format=%h")
cdate = _git("log", "-1", "--format=%cd", "--date=format:%Y.%m.%d")
dirty = bool(_git("status", "--porcelain", "--", "src"))
if commit:
    VERSION = f"v{cdate} · {commit}" + (" · 未提交" if dirty else "")
else:
    VERSION = "v" + datetime.datetime.now().strftime("%Y.%m.%d %H:%M")
digest = hashlib.sha1(out.encode("utf-8")).hexdigest()[:8]
out = out.replace("__BUILD__", VERSION)

target = ROOT / "index.html"
target.write_text(out, encoding="utf-8")
copy = ROOT.parent / "MuscleCalculator.html"
try:
    copy.write_text(out, encoding="utf-8")
except OSError:
    copy = None
share = ROOT / "share"
if share.is_dir():
    (share / "index.html").write_text(out, encoding="utf-8")
print(f"built {target}  ({len(out)/1024:.1f} KB)")
if copy:
    print(f"copied {copy}")
print(f"version {VERSION}")
