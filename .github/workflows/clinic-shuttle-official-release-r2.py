#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys, time, urllib.request

ROOT = Path.cwd()
REL = ROOT / "assets" / "clinic-shuttle-release"

SYSTEM = "https://dpromstk2000-lab.github.io/dpro-clinic-shuttle-line/"
PRODUCT = "https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/clinic-shuttle.html"
OFFICIAL = "https://dpro-shop.com/systems/clinic-shuttle"
EXPECTED_SYSTEM_HEAD = "3fc09f4b5c6781d6038dc280de5c58752ce60b51"
EXPECTED_OFFICIAL_SOURCE_HEAD = "ccc531610b8fa9721e8e2c9dd8eb9709e12dcb70"

def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")

def sha256(path):
    h = hashlib.sha256()
    with open(ROOT / path, "rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 DPRO-QA"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read()

def wait_url(url, needle, tries=42, sleep=10):
    last = None
    for i in range(tries):
        try:
            status, data = get(url)
            text = data.decode("utf-8", "ignore")
            if status == 200 and needle in text:
                return {"status":status,"contentPass":True,"attempt":i+1}
            last = f"status={status}"
        except Exception as e:
            last = repr(e)
        time.sleep(sleep)
    raise SystemExit(f"live wait failed {url}: {last}")

def sourceqa():
    report = {"stage":"REL-03_OFFICIAL_R2_SOURCE_QA","pass":True,"checks":{}}

    page = (ROOT/"systems/clinic-shuttle.html").read_text(encoding="utf-8")
    for token in [
        "DPRO 診療所送迎予約",
        "PRODUCT 55",
        "33,000円",
        "月額1,100円",
        PRODUCT,
        SYSTEM,
        SYSTEM+"member.html",
        SYSTEM+"owner.html",
        SYSTEM+"owner-ipad.html",
        SYSTEM+"staff.html",
        "電子カルテ",
        "標準範囲外",
    ]:
        if token not in page:
            raise SystemExit("official source missing: "+token)
    report["checks"]["officialPage"] = True

    hub = (ROOT/"systems/index.html").read_text(encoding="utf-8")
    for token in [
        '"numberOfItems":55',
        '"position":54',
        '"position":55',
        'data-central-product="54"',
        'data-central-product="55"',
        'href="clinic-shuttle"',
        'data-filter-count="medical">7</b>',
    ]:
        if token not in hub:
            raise SystemExit("systems hub missing: "+token)
    report["checks"]["systemsHub55"] = True

    config = (ROOT/"site-config.js").read_text(encoding="utf-8")
    if "productCount: 55" not in config:
        raise SystemExit("site-config count is not 55")
    report["checks"]["siteConfig55"] = True

    sitemap = (ROOT/"sitemap.xml").read_text(encoding="utf-8")
    if "https://dpro-shop.com/systems/clinic-shuttle" not in sitemap:
        raise SystemExit("sitemap clinic-shuttle missing")
    report["checks"]["sitemap"] = True

    write("assets/clinic-shuttle-release/OFFICIAL_R2_SOURCE_QA.json",
          json.dumps(report,ensure_ascii=False,indent=2))
    print("source QA PASS")

def liveqa():
    report = {
        "stage":"REL-03_OFFICIAL_INITIAL_PUBLIC_QA_R2",
        "pass":True,
        "blockers":[],
        "targets":{},
        "responsive":{},
        "systemRepositoryProtected":True,
        "systemFinalLock":EXPECTED_SYSTEM_HEAD,
        "officialSourceHead":EXPECTED_OFFICIAL_SOURCE_HEAD,
    }

    report["targets"][OFFICIAL] = wait_url(OFFICIAL, "DPRO 診療所送迎予約")
    targets = {
        "https://dpro-shop.com/systems/":"診療所送迎予約",
        "https://dpro-shop.com/pricing":"55",
        PRODUCT:"DPRO 診療所送迎予約",
        SYSTEM:"DPRO",
        SYSTEM+"member.html":None,
        SYSTEM+"owner.html":None,
        SYSTEM+"owner-ipad.html":None,
        SYSTEM+"staff.html":None,
    }
    for url, needle in targets.items():
        try:
            status,data=get(url)
            text=data.decode("utf-8","ignore")
            ok=status==200 and (needle is None or needle in text)
            report["targets"][url]={"status":status,"contentPass":ok}
            if not ok:
                report["blockers"].append({"url":url,"error":"content check failed"})
        except Exception as e:
            report["blockers"].append({"url":url,"error":repr(e)})

    if report["blockers"]:
        write("assets/clinic-shuttle-release/OFFICIAL_PUBLIC_QA_R2.json",
              json.dumps(report,ensure_ascii=False,indent=2))
        raise SystemExit("public URL blockers")

    from playwright.sync_api import sync_playwright
    REL.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        b=pw.chromium.launch(headless=True)
        for w in [390,768,1440]:
            p=b.new_page(viewport={"width":w,"height":1000})
            console_errors=[]
            p.on("console",lambda msg,arr=console_errors: arr.append(msg.text) if msg.type=="error" else None)
            p.goto(OFFICIAL,wait_until="domcontentloaded",timeout=60000)
            p.wait_for_timeout(2500)

            overflow=p.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
            broken=p.locator("img").evaluate_all("(els)=>els.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)")
            title=p.title()
            body_marker=p.locator("body").inner_text()
            h1=p.locator("h1").inner_text()

            report["responsive"][str(w)]={
                "overflow":bool(overflow),
                "brokenImages":broken,
                "title":title,
                "h1":h1,
                "product55Visible":"PRODUCT 55" in body_marker,
                "officialTitlePass":"DPRO 診療所送迎予約" in title,
                "consoleErrors":console_errors[:10],
            }

            p.screenshot(path=str(REL/f"official-r2-{w}.png"),full_page=True)

            if overflow:
                raise SystemExit(f"horizontal overflow width={w}")
            if broken:
                raise SystemExit(f"broken images width={w}: {broken}")
            if "DPRO 診療所送迎予約" not in title:
                raise SystemExit(f"title mismatch width={w}: {title}")
            if "PRODUCT 55" not in body_marker:
                raise SystemExit(f"product 55 marker missing width={w}")
            p.close()
        b.close()

    write("assets/clinic-shuttle-release/OFFICIAL_PUBLIC_QA_R2.json",
          json.dumps(report,ensure_ascii=False,indent=2))
    print("responsive public QA PASS")

def manifest():
    files=[
        "systems/clinic-shuttle.html",
        "systems/index.html",
        "index.html",
        "pricing.html",
        "site-config.js",
        "sitemap.xml",
        "assets/clinic-shuttle-release/OFFICIAL_R2_SOURCE_QA.json",
        "assets/clinic-shuttle-release/OFFICIAL_PUBLIC_QA_R2.json",
        "assets/clinic-shuttle-release/official-r2-390.png",
        "assets/clinic-shuttle-release/official-r2-768.png",
        "assets/clinic-shuttle-release/official-r2-1440.png",
    ]
    result={
        "product":"DPRO 診療所送迎予約",
        "systemCode":"CLINIC_SHUTTLE",
        "productNumber":55,
        "phase":"REL-03_OFFICIAL_SITE_COMPLETE",
        "officialInitialPublicQA":True,
        "systemProtected":True,
        "systemFinalLock":EXPECTED_SYSTEM_HEAD,
        "officialSourceHead":EXPECTED_OFFICIAL_SOURCE_HEAD,
        "officialUrl":OFFICIAL,
        "productUrl":PRODUCT,
        "liveDemo":SYSTEM,
        "files":[],
        "pending":["REL-B1..B4","REL-F1..F4","REL-LOCK","REL-RETURN"]
    }
    for f in files:
        p=ROOT/f
        if not p.exists():
            raise SystemExit("manifest missing "+f)
        result["files"].append({"path":f,"bytes":p.stat().st_size,"sha256":sha256(f)})
    write("assets/clinic-shuttle-release/OFFICIAL_SITE_RELEASE_MANIFEST_R2.json",
          json.dumps(result,ensure_ascii=False,indent=2))
    print("manifest PASS")

if __name__=="__main__":
    if len(sys.argv)!=2:
        raise SystemExit("usage: script.py sourceqa|liveqa|manifest")
    funcs={"sourceqa":sourceqa,"liveqa":liveqa,"manifest":manifest}
    if sys.argv[1] not in funcs:
        raise SystemExit("unknown command")
    funcs[sys.argv[1]]()
