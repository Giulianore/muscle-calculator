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

# 版本号 = 源码内容哈希 + 最后一次改动源码的提交日期。
# 好处：同一份源码重复构建结果完全一致，只有真正改了 src/ 才会变。
src_digest = hashlib.sha1((css + data + app + template).encode("utf-8")).hexdigest()[:8]
cdate = _git("log", "-1", "--format=%cd", "--date=format:%Y.%m.%d", "--", "src")
if not cdate:
    cdate = datetime.datetime.now().strftime("%Y.%m.%d")
VERSION = f"v{cdate} · {src_digest}"
out = out.replace("__BUILD__", VERSION)

target = ROOT / "index.html"
target.write_text(out, encoding="utf-8")
# ---- PWA：生成带版本号的 Service Worker ----
sw = f"""const VERSION = '{VERSION}';
const CACHE = 'mc-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {{
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
}});

self.addEventListener('activate', e => {{
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('fetch', e => {{
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {{
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {{}});
        return res;
      }})
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
}});
"""
(ROOT / "sw.js").write_text(sw, encoding="utf-8")

copy = ROOT.parent / "MuscleCalculator.html"
try:
    copy.write_text(out, encoding="utf-8")
except OSError:
    copy = None
share = ROOT / "share"
if share.is_dir():
    (share / "index.html").write_text(out, encoding="utf-8")
    for f in ["manifest.webmanifest", "sw.js", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "icon-180.png"]:
        if (ROOT / f).exists():
            (share / f).write_bytes((ROOT / f).read_bytes())
print(f"built {target}  ({len(out)/1024:.1f} KB)")
if copy:
    print(f"copied {copy}")
print(f"version {VERSION}")
