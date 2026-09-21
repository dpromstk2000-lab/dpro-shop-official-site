#!/usr/bin/env python3
from pathlib import Path
import json, sys, time, urllib.request

ROOT = Path.cwd()
EVID = ROOT / "assets" / "clinic-shuttle-release"
PAGE = ROOT / "systems" / "clinic-shuttle.html"

CUSTOM = "https://dpro-shop.com/systems/clinic-shuttle"
GHPAGES = "https://dpromstk2000-lab.github.io/dpro-shop-official-site/systems/clinic-shuttle.html"

SYSTEM_HEAD = "3fc09f4b5c6781d6038dc280de5c58752ce60b51"
PRODUCT_HEAD = "7bfb6ae44e53aeb470664aeec2991752ae5c3cbc"

FIX_CSS = """
/* DPRO CLINIC SHUTTLE R5 — visibility fail-safe.
   This page must remain fully readable even when no reveal observer is installed. */
.clinic-shuttle-product-page .reveal{
  opacity:1 !important;
  transform:none !important;
  transition:none !important;
}
"""

def write(path, obj):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(obj, (dict, list)):
        p.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        p.write_text(str(obj), encoding="utf-8")

def fetch_text(url, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 DPRO-R5-VISIBILITY-QA"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "ignore")

def prepare():
    s = PAGE.read_text(encoding="utf-8")
    if "clinic-shuttle-product-page" not in s:
        raise SystemExit("clinic shuttle page marker missing")
    if "DPRO CLINIC SHUTTLE R5" not in s:
        marker = "</style>"
        if marker not in s:
            raise SystemExit("inline style closing marker missing")
        s = s.replace(marker, FIX_CSS + "\n</style>", 1)
    PAGE.write_text(s, encoding="utf-8")
    if ".clinic-shuttle-product-page .reveal" not in s:
        raise SystemExit("visibility fail-safe not inserted")
    write("assets/clinic-shuttle-release/R5_VISIBILITY_FIX_SOURCE.json", {
        "stage":"R5_VISIBILITY_HOTFIX_SOURCE",
        "pass":True,
        "cause":"styles.css hides .js .reveal but systems.js has no reveal activation for this page",
        "fix":"clinic-shuttle scoped reveal fail-safe: opacity 1 / transform none / transition none",
        "systemFinalLock":SYSTEM_HEAD,
        "productHead":PRODUCT_HEAD,
    })
    print("R5 visibility source fix prepared")

def wait_for_fix(url, tries=42, sleep=10):
    last=None
    for i in range(tries):
        try:
            status,text=fetch_text(url)
            if status==200 and "DPRO CLINIC SHUTTLE R5" in text:
                return {"status":status,"attempt":i+1,"sourceMarker":True}
            last={"status":status,"marker":"DPRO CLINIC SHUTTLE R5" in text}
        except Exception as e:
            last=repr(e)
        time.sleep(sleep)
    raise SystemExit(f"deployment wait failed {url}: {last}")

def audit():
    from playwright.sync_api import sync_playwright
    EVID.mkdir(parents=True, exist_ok=True)
    report = {
        "stage":"R5_VISIBILITY_CORRECTIVE_FINAL_QA",
        "status":"PENDING",
        "cause":"reveal elements were opacity:0 because no reveal observer activated them",
        "systemFinalLock":SYSTEM_HEAD,
        "systemProtected":True,
        "productHead":PRODUCT_HEAD,
        "targets":{},
        "blockers":[],
    }

    for url in [CUSTOM, GHPAGES]:
        report["targets"][url]={"deploy":wait_for_fix(url),"responsive":{}}

    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for url_index,url in enumerate([CUSTOM,GHPAGES]):
            label="custom" if url_index==0 else "github-pages"
            for w in [390,768,1440]:
                p=browser.new_page(viewport={"width":w,"height":1000})
                console=[]
                p.on("console",lambda msg,arr=console: arr.append(msg.text) if msg.type=="error" else None)
                p.goto(url,wait_until="networkidle",timeout=60000)
                p.wait_for_timeout(900)

                data=p.evaluate("""() => {
                  const els=[...document.querySelectorAll('.reveal')];
                  const hidden=els.filter(el=>{
                    const cs=getComputedStyle(el);
                    const r=el.getBoundingClientRect();
                    return cs.display==='none' || cs.visibility==='hidden' || Number(cs.opacity)<0.95 || r.width<2 || r.height<2;
                  }).map(el=>({
                    tag:el.tagName,
                    cls:el.className,
                    opacity:getComputedStyle(el).opacity,
                    display:getComputedStyle(el).display,
                    visibility:getComputedStyle(el).visibility,
                    text:(el.innerText||'').trim().slice(0,80)
                  }));
                  const keyIds=['summary','features','flow','roles','demo','safety','pricing','docs','faq'];
                  const sections=Object.fromEntries(keyIds.map(id=>{
                    const el=document.getElementById(id);
                    if(!el)return [id,{exists:false}];
                    const r=el.getBoundingClientRect();
                    const text=(el.innerText||'').trim();
                    return [id,{exists:true,width:r.width,height:r.height,textChars:text.length}];
                  }));
                  return {
                    revealCount:els.length,
                    hiddenRevealCount:hidden.length,
                    hiddenReveal:hidden.slice(0,20),
                    overflow:document.documentElement.scrollWidth > window.innerWidth + 2,
                    title:document.title,
                    h1:document.querySelector('h1')?.innerText||'',
                    bodyTextChars:(document.body.innerText||'').trim().length,
                    sections
                  };
                }""")

                broken=p.locator("img").evaluate_all("(els)=>els.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)")
                data["brokenImages"]=broken
                data["consoleErrors"]=console[:10]

                screenshot=EVID/f"r5-visible-{label}-{w}.png"
                p.screenshot(path=str(screenshot),full_page=True)

                # Strong visibility requirements.
                if data["revealCount"] < 10:
                    report["blockers"].append({"url":url,"width":w,"error":"unexpectedly low reveal count","data":data})
                if data["hiddenRevealCount"] != 0:
                    report["blockers"].append({"url":url,"width":w,"error":"hidden reveal elements remain","data":data})
                if data["overflow"]:
                    report["blockers"].append({"url":url,"width":w,"error":"horizontal overflow","data":data})
                if broken:
                    report["blockers"].append({"url":url,"width":w,"error":"broken images","images":broken})
                if "DPRO 診療所送迎予約" not in data["title"]:
                    report["blockers"].append({"url":url,"width":w,"error":"title mismatch","title":data["title"]})
                if data["bodyTextChars"] < 1000:
                    report["blockers"].append({"url":url,"width":w,"error":"visible text unexpectedly sparse","chars":data["bodyTextChars"]})
                for sid,sec in data["sections"].items():
                    if not sec.get("exists") or sec.get("height",0)<20 or sec.get("textChars",0)<20:
                        report["blockers"].append({"url":url,"width":w,"error":f"section not visibly populated: {sid}","section":sec})

                report["targets"][url]["responsive"][str(w)]=data
                p.close()
        browser.close()

    report["status"]="PASS" if not report["blockers"] else "FAIL"
    write("assets/clinic-shuttle-release/R5_VISIBILITY_FINAL_QA.json",report)
    if report["blockers"]:
        raise SystemExit("R5 visibility QA blockers remain")

    corrected = {
        "status":"PRODUCT RELEASE COMPLETE",
        "releaseRevision":"R5_VISIBILITY_CORRECTED",
        "supersedes":"R4 automated visual completion evidence",
        "correctionReason":"R4 did not detect opacity:0 reveal content; R5 adds computed-style visibility QA.",
        "product":"DPRO 診療所送迎予約",
        "systemCode":"CLINIC_SHUTTLE",
        "productNumber":55,
        "systemFinalLock":SYSTEM_HEAD,
        "systemProtected":True,
        "officialCustomUrl":CUSTOM,
        "officialGithubPagesUrl":GHPAGES,
        "visibilityQA":{
            "custom":[390,768,1440],
            "githubPages":[390,768,1440],
            "hiddenRevealCount":0,
            "brokenImages":0,
            "horizontalOverflow":False
        },
        "blockers":[]
    }
    write("assets/clinic-shuttle-release/PRODUCT_RELEASE_COMPLETE.json",corrected)
    write("assets/clinic-shuttle-release/PRODUCT_RELEASE_COMPLETE_R5_CORRECTED.json",corrected)
    print("R5 VISIBILITY QA PASS")

if __name__=="__main__":
    if len(sys.argv)!=2:
        raise SystemExit("usage: script.py prepare|audit")
    {"prepare":prepare,"audit":audit}[sys.argv[1]]()
