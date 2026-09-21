#!/usr/bin/env python3
from pathlib import Path
import json, os, re, sys, time, urllib.request

ROOT=Path.cwd()
TARGET=ROOT/"systems/clinic-shuttle.html"
EVID=ROOT/"release-evidence-ha-official-footer-r1"

SYSTEM_HEAD="3fc09f4b5c6781d6038dc280de5c58752ce60b51"
PRODUCT_HEAD="a1fc0ee49518d1deb71990df8a4c31624225ccbe"
URL="https://dpro-shop.com/systems/clinic-shuttle"

STATIC_FOOTER_RE = re.compile(
    r'\n<footer class="v33sys-footer">[\s\S]*?</footer>\n<script src="systems\.js\?v=33" defer></script>',
    re.M
)

def write(name,obj):
    EVID.mkdir(parents=True,exist_ok=True)
    (EVID/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding="utf-8")

def fetch(url,timeout=45):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 DPRO-HA-FOOTER-R1"})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return r.status,r.read()

def api_head(repo):
    _,b=fetch(f"https://api.github.com/repos/{repo}/branches/main")
    return json.loads(b.decode())["commit"]["sha"]

def patch():
    s=TARGET.read_text(encoding="utf-8")
    matches=list(STATIC_FOOTER_RE.finditer(s))
    if len(matches)!=1:
        raise SystemExit(f"Expected exactly one static v33 footer before systems.js, got {len(matches)}")
    s=STATIC_FOOTER_RE.sub('\n<script src="systems.js?v=33" defer></script>',s,count=1)
    if s.count('<footer class="v33sys-footer">')!=0:
        raise SystemExit("Static v33 footer still present after patch")
    if 'systems.js?v=33' not in s:
        raise SystemExit("systems.js missing after patch")
    TARGET.write_text(s,encoding="utf-8")
    write("HA_OFFICIAL_FOOTER_SOURCE_R1.json",{
      "pass":True,
      "defect":{"id":"HA-07","severity":"high","title":"OFFICIAL footer rendered twice","status":"CLOSED_PENDING_PUBLIC_VERIFY"},
      "change":"Removed page-local static v33 footer so systems.js provides exactly one canonical shared footer.",
      "systemReopenRequired":False
    })
    print("HA OFFICIAL FOOTER SOURCE PASS")

def runs(repo):
    _,b=fetch(f"https://api.github.com/repos/{repo}/actions/runs?per_page=100")
    return json.loads(b.decode())["workflow_runs"]

def wait_pages(head):
    for _ in range(50):
        for x in runs("dpromstk2000-lab/dpro-shop-official-site"):
            if x.get("name")=="pages build and deployment" and x.get("head_sha")==head and x.get("status")=="completed" and x.get("conclusion")=="success":
                return {"id":x["id"],"url":x["html_url"],"head_sha":head}
        time.sleep(10)
    raise SystemExit("OFFICIAL Pages success not found")

def publicqa():
    from playwright.sync_api import sync_playwright
    head=os.environ.get("FINAL_OFFICIAL_HEAD","").strip()
    if not re.fullmatch(r"[0-9a-f]{40}",head):
        raise SystemExit("FINAL_OFFICIAL_HEAD missing")

    pages=wait_pages(head)
    qa={}

    with sync_playwright() as pw:
        b=pw.chromium.launch(headless=True)
        for w in [375,390,768,1440]:
            p=b.new_page(viewport={"width":w,"height":1000})
            p.goto(URL,wait_until="networkidle",timeout=60000)
            p.wait_for_timeout(500)

            rec=p.evaluate('''()=>({
              footers:document.querySelectorAll(".v33sys-footer").length,
              footerTexts:[...document.querySelectorAll(".v33sys-footer")].map(x=>x.innerText.trim()),
              scrollWidth:document.documentElement.scrollWidth,
              innerWidth:window.innerWidth,
              broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)
            })''')

            if rec["footers"]!=1:
                raise SystemExit(f"footer count fail width={w}: "+json.dumps(rec,ensure_ascii=False))
            if not rec["footerTexts"] or "DPRO SHOP" not in rec["footerTexts"][0] or "PRODUCT SITE" not in rec["footerTexts"][0]:
                raise SystemExit(f"canonical footer content fail width={w}")
            if rec["scrollWidth"]>w+2:
                raise SystemExit(f"horizontal overflow width={w}: "+json.dumps(rec,ensure_ascii=False))
            if rec["broken"]:
                raise SystemExit(f"broken image width={w}: "+json.dumps(rec,ensure_ascii=False))

            if w in (390,1440):
                p.screenshot(path=str(EVID/f"official-footer-r1-{w}.png"),full_page=True)

            qa[str(w)]=rec
            p.close()
        b.close()

    if api_head("dpromstk2000-lab/dpro-clinic-shuttle-line")!=SYSTEM_HEAD:
        raise SystemExit("SYSTEM FINAL LOCK drift")
    if api_head("dpromstk2000-lab/dpro-line-systems-site")!=PRODUCT_HEAD:
        raise SystemExit("PRODUCT drift during footer fix")

    write("HA_OFFICIAL_FOOTER_PUBLIC_QA_R1.json",{
      "pass":True,
      "finalOfficialHead":head,
      "pages":pages,
      "viewports":qa,
      "defect":{"id":"HA-07","severity":"high","status":"CLOSED"},
      "systemFinalLock":SYSTEM_HEAD,
      "productHead":PRODUCT_HEAD,
      "humanAcceptanceStatus":"READY_FOR_REVIEW"
    })
    print("HA_OFFICIAL_FOOTER_R1_SUMMARY="+json.dumps({
      "status":"PASS",
      "defect":"HA-07 CLOSED",
      "final_official_head":head,
      "pages_run":pages["id"],
      "system_final_lock":SYSTEM_HEAD,
      "human_acceptance":"READY_FOR_REVIEW"
    },ensure_ascii=False))

if __name__=="__main__":
    if len(sys.argv)!=2:
        raise SystemExit("usage: patch|publicqa")
    {"patch":patch,"publicqa":publicqa}[sys.argv[1]]()
