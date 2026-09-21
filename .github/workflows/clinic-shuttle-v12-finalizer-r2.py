#!/usr/bin/env python3
from pathlib import Path
import py_compile, sys

src = Path(".github/workflows/clinic-shuttle-v12-finalizer-r1.py")
dst = Path("/tmp/clinic-shuttle-v12-finalizer-r2-runtime.py")

if not src.exists():
    raise SystemExit("R1 finalizer source missing")

s = src.read_text(encoding="utf-8")

old = """def fetch(url, timeout=60):
    req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 DPRO-PRODUCT-RELEASE-FINALIZER-V12'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.geturl(), r.read(), dict(r.headers)
"""

new = """def fetch(url, timeout=60):
    headers={'User-Agent':'Mozilla/5.0 DPRO-PRODUCT-RELEASE-FINALIZER-V12-R2'}
    token=os.environ.get('GITHUB_TOKEN','').strip()
    if url.startswith('https://api.github.com/'):
        if not token:
            raise SystemExit('GITHUB_TOKEN missing for authenticated GitHub API')
        headers['Authorization']=f'Bearer {token}'
        headers['Accept']='application/vnd.github+json'
        headers['X-GitHub-Api-Version']='2022-11-28'
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.geturl(), r.read(), dict(r.headers)
"""

if old not in s:
    raise SystemExit("R1 fetch() anchor not found")
s = s.replace(old, new, 1)

# Keep the same release logic; only the network/API transport is hardened.
dst.write_text(s, encoding="utf-8")
py_compile.compile(str(dst), doraise=True)

print("FINALIZER R2 RUNTIME PATCH PASS")
print(dst)
