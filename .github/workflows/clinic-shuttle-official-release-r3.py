#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys, time, urllib.request

ROOT = Path.cwd()
REL = ROOT / "assets" / "clinic-shuttle-release"
SCREEN_DIR = REL / "screens"

SYSTEM = "https://dpromstk2000-lab.github.io/dpro-clinic-shuttle-line/"
PRODUCT = "https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/clinic-shuttle.html"
OFFICIAL = "https://dpro-shop.com/systems/clinic-shuttle"
EXPECTED_SYSTEM_HEAD = "3fc09f4b5c6781d6038dc280de5c58752ce60b51"
EXPECTED_OFFICIAL_PARENT = "500365d390c75ab38fa94ebd7c66922776e511e6"

RAW_BASE = "https://raw.githubusercontent.com/dpromstk2000-lab/dpro-line-systems-site/main/assets/clinic-shuttle-next/screens/"
PUBLIC_SCREEN_BASE = "https://dpro-shop.com/assets/clinic-shuttle-release/screens/"

def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")

def sha256(path):
    h = hashlib.sha256()
    with open(ROOT / path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def get(url, timeout=45):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 DPRO-QA"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.headers, r.read()

def wait_url(url, needle=None, tries=42, sleep=10):
    last = None
    for i in range(tries):
        try:
            status, headers, data = get(url)
            text = data.decode("utf-8", "ignore")
            if status == 200 and (needle is None or needle in text):
                return {"status":status,"contentPass":True,"attempt":i+1,"bytes":len(data)}
            last = f"status={status}, bytes={len(data)}"
        except Exception as e:
            last = repr(e)
        time.sleep(sleep)
    raise SystemExit(f"wait failed {url}: {last}")

def prepare():
    SCREEN_DIR.mkdir(parents=True, exist_ok=True)
    source_meta = {}
    for name in ["owner.png","member.png","ipad.png","staff.png"]:
        status, headers, data = get(RAW_BASE + name)
        if status != 200 or len(data) < 20000 or not data.startswith(b"\x89PNG\r\n\x1a\n"):
            raise SystemExit(f"invalid source screenshot {name}: status={status} bytes={len(data)}")
        (SCREEN_DIR / name).write_bytes(data)
        source_meta[name] = {
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "source": RAW_BASE + name,
        }

    page_path = ROOT / "systems/clinic-shuttle.html"
    page = page_path.read_text(encoding="utf-8")
    remote_base = "https://dpromstk2000-lab.github.io/dpro-line-systems-site/assets/clinic-shuttle-next/screens/"
    for name in ["owner.png","member.png","ipad.png","staff.png"]:
        page = page.replace(remote_base + name, "../assets/clinic-shuttle-release/screens/" + name)
    if remote_base in page:
        raise SystemExit("remote screenshot references remain")
    page_path.write_text(page, encoding="utf-8")

    metadata = {
        "stage":"REL-03_OFFICIAL_R3_SELF_CONTAINED_SCREENSHOTS",
        "product":"DPRO 診療所送迎予約",
        "productNumber":55,
        "systemFinalLock":EXPECTED_SYSTEM_HEAD,
        "officialParent":EXPECTED_OFFICIAL_PARENT,
        "screens":source_meta,
    }
    write("assets/clinic-shuttle-release/OFFICIAL_R3_SCREENSHOT_IMPORT.json",
          json.dumps(metadata,ensure_ascii=False,indent=2))
    print("self-contained screenshots prepared")

def sourceqa():
    page=(ROOT/"systems/clinic-shuttle.html").read_text(encoding="utf-8")
    report={"stage":"REL-03_OFFICIAL_R3_SOURCE_QA","pass":True,"screens":{}}
    for name in ["owner.png","member.png","ipad.png","staff.png"]:
        rel="../assets/clinic-shuttle-release/screens/"+name
        if rel not in page:
            raise SystemExit("local screenshot ref missing: "+name)
        p=SCREEN_DIR/name
        data=p.read_bytes()
        if len(data)<20000 or not data.startswith(b"\x89PNG\r\n\x1a\n"):
            raise SystemExit("local screenshot invalid: "+name)
        report["screens"][name]={"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()}
    if "https://dpromstk2000-lab.github.io/dpro-line-systems-site/assets/clinic-shuttle-next/screens/" in page:
        raise SystemExit("external screenshot dependency remains")
    for token in ["DPRO 診療所送迎予約","PRODUCT 55","33,000円","月額1,100円",PRODUCT,SYSTEM]:
        if token not in page:
            raise SystemExit("official source marker missing: "+token)
    write("assets/clinic-shuttle-release/OFFICIAL_R3_SOURCE_QA.json",
          json.dumps(report,ensure_ascii=False,indent=2))
    print("source QA PASS")

def liveqa():
    report={
        "stage":"REL-03_OFFICIAL_SITE_COMPLETE_R3",
        "pass":True,
        "blockers":[],
        "targets":{},
        "screens":{},
        "responsive":{},
        "systemProtected":True,
        "systemFinalLock":EXPECTED_SYSTEM_HEAD,
    }
    report["targets"][OFFICIAL]=wait_url(OFFICIAL,"DPRO 診療所送迎予約")
    report["targets"]["https://dpro-shop.com/systems/"]=wait_url("https://dpro-shop.com/systems/","診療所送迎予約")

    for name in ["owner.png","member.png","ipad.png","staff.png"]:
        url=PUBLIC_SCREEN_BASE+name
        try:
            status,headers,data=get(url)
            ok=status==200 and len(data)>20000 and data.startswith(b"\x89PNG\r\n\x1a\n")
            report["screens"][name]={"url":url,"status":status,"bytes":len(data),"pass":ok}
            if not ok:
                report["blockers"].append({"url":url,"error":"PNG validation failed"})
        except Exception as e:
            report["blockers"].append({"url":url,"error":repr(e)})

    for url,needle in [
        (PRODUCT,"DPRO 診療所送迎予約"),
        (SYSTEM,"DPRO"),
        (SYSTEM+"member.html",None),
        (SYSTEM+"owner.html",None),
        (SYSTEM+"owner-ipad.html",None),
        (SYSTEM+"staff.html",None),
    ]:
        try:
            status,headers,data=get(url)
            text=data.decode("utf-8","ignore")
            ok=status==200 and (needle is None or needle in text)
            report["targets"][url]={"status":status,"contentPass":ok}
            if not ok:
                report["blockers"].append({"url":url,"error":"content check failed"})
        except Exception as e:
            report["blockers"].append({"url":url,"error":repr(e)})

    if report["blockers"]:
        write("assets/clinic-shuttle-release/OFFICIAL_PUBLIC_QA_R3.json",
              json.dumps(report,ensure_ascii=False,indent=2))
        raise SystemExit("public asset blockers")

    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b=pw.chromium.launch(headless=True)
        for w in [390,768,1440]:
            p=b.new_page(viewport={"width":w,"height":1000})
            console_errors=[]
            p.on("console",lambda msg,arr=console_errors: arr.append(msg.text) if msg.type=="error" else None)
            p.goto(OFFICIAL,wait_until="networkidle",timeout=60000)
            p.wait_for_timeout(1200)
            overflow=p.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
            broken=p.locator("img").evaluate_all("(els)=>els.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)")
            title=p.title()
            body=p.locator("body").inner_text()
            report["responsive"][str(w)]={
                "overflow":bool(overflow),
                "brokenImages":broken,
                "title":title,
                "product55Visible":"PRODUCT 55" in body,
                "consoleErrors":console_errors[:10],
            }
            p.screenshot(path=str(REL/f"official-r3-{w}.png"),full_page=True)
            if overflow:
                raise SystemExit(f"horizontal overflow width={w}")
            if broken:
                raise SystemExit(f"broken images width={w}: {broken}")
            if "DPRO 診療所送迎予約" not in title or "PRODUCT 55" not in body:
                raise SystemExit(f"content mismatch width={w}")
            p.close()
        b.close()

    write("assets/clinic-shuttle-release/OFFICIAL_PUBLIC_QA_R3.json",
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
        "assets/clinic-shuttle-release/screens/owner.png",
        "assets/clinic-shuttle-release/screens/member.png",
        "assets/clinic-shuttle-release/screens/ipad.png",
        "assets/clinic-shuttle-release/screens/staff.png",
        "assets/clinic-shuttle-release/OFFICIAL_R3_SCREENSHOT_IMPORT.json",
        "assets/clinic-shuttle-release/OFFICIAL_R3_SOURCE_QA.json",
        "assets/clinic-shuttle-release/OFFICIAL_PUBLIC_QA_R3.json",
        "assets/clinic-shuttle-release/official-r3-390.png",
        "assets/clinic-shuttle-release/official-r3-768.png",
        "assets/clinic-shuttle-release/official-r3-1440.png",
    ]
    data={
        "product":"DPRO 診療所送迎予約",
        "systemCode":"CLINIC_SHUTTLE",
        "productNumber":55,
        "phase":"REL-03_OFFICIAL_SITE_COMPLETE",
        "officialInitialPublicQA":True,
        "selfContainedScreenshots":True,
        "systemProtected":True,
        "systemFinalLock":EXPECTED_SYSTEM_HEAD,
        "officialUrl":OFFICIAL,
        "productUrl":PRODUCT,
        "liveDemo":SYSTEM,
        "files":[],
        "pending":["REL-B1..B4","REL-F1..F4","REL-LOCK","REL-RETURN"],
    }
    for f in files:
        p=ROOT/f
        if not p.exists():
            raise SystemExit("manifest missing "+f)
        data["files"].append({"path":f,"bytes":p.stat().st_size,"sha256":sha256(f)})
    write("assets/clinic-shuttle-release/OFFICIAL_SITE_RELEASE_MANIFEST_R3.json",
          json.dumps(data,ensure_ascii=False,indent=2))
    print("manifest PASS")

if __name__=="__main__":
    if len(sys.argv)!=2:
        raise SystemExit("usage: script.py prepare|sourceqa|liveqa|manifest")
    funcs={"prepare":prepare,"sourceqa":sourceqa,"liveqa":liveqa,"manifest":manifest}
    if sys.argv[1] not in funcs:
        raise SystemExit("unknown command")
    funcs[sys.argv[1]]()
