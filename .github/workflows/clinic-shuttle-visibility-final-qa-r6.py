#!/usr/bin/env python3
from pathlib import Path
import json, sys, time, urllib.request

ROOT = Path.cwd()
EVID = ROOT / "assets" / "clinic-shuttle-release"
CUSTOM = "https://dpro-shop.com/systems/clinic-shuttle"
GHPAGES = "https://dpromstk2000-lab.github.io/dpro-shop-official-site/systems/clinic-shuttle.html"
SYSTEM_HEAD = "3fc09f4b5c6781d6038dc280de5c58752ce60b51"
PRODUCT_HEAD = "7bfb6ae44e53aeb470664aeec2991752ae5c3cbc"
R5_SOURCE_HEAD = "baff0129da88d099e8bafd6de5b00c78c61e613f"

def write(path,obj):
    p=ROOT/path
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding="utf-8")

def fetch_text(url,timeout=40):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 DPRO-R6-QA"})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return r.status,r.read().decode("utf-8","ignore")

def wait_r5(url,tries=36,sleep=10):
    last=None
    for i in range(tries):
        try:
            status,text=fetch_text(url)
            if status==200 and "DPRO CLINIC SHUTTLE R5" in text:
                return {"status":status,"attempt":i+1,"r5Marker":True}
            last={"status":status,"marker":"DPRO CLINIC SHUTTLE R5" in text}
        except Exception as e:
            last=repr(e)
        time.sleep(sleep)
    raise SystemExit(f"R5 deployment not visible: {url}: {last}")

def audit():
    from playwright.sync_api import sync_playwright
    EVID.mkdir(parents=True,exist_ok=True)

    report={
        "stage":"R6_SCROLL_BASED_VISIBILITY_FINAL_QA",
        "status":"PENDING",
        "method":"scroll each major section/reveal into viewport before computed-style validation",
        "r5SourceHead":R5_SOURCE_HEAD,
        "systemFinalLock":SYSTEM_HEAD,
        "systemProtected":True,
        "productHead":PRODUCT_HEAD,
        "targets":{},
        "blockers":[],
    }

    for url in [CUSTOM,GHPAGES]:
        report["targets"][url]={"deploy":wait_r5(url),"responsive":{}}

    major_ids=["summary","features","flow","roles","demo","safety","pricing","docs","faq"]

    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for idx,url in enumerate([CUSTOM,GHPAGES]):
            label="custom" if idx==0 else "github-pages"
            for w in [390,768,1440]:
                p=browser.new_page(viewport={"width":w,"height":1000})
                console=[]
                p.on("console",lambda msg,arr=console: arr.append(msg.text) if msg.type=="error" else None)
                p.goto(url,wait_until="networkidle",timeout=60000)
                p.wait_for_timeout(700)

                result={
                    "title":p.title(),
                    "h1":p.locator("h1").inner_text() if p.locator("h1").count() else "",
                    "overflow":False,
                    "brokenImages":[],
                    "sections":{},
                    "reveals":{"count":0,"failed":[]},
                    "consoleErrors":[],
                }

                # Validate hero first.
                hero=p.locator(".product-hero")
                hero.scroll_into_view_if_needed()
                p.wait_for_timeout(150)
                p.screenshot(path=str(EVID/f"r6-{label}-{w}-hero.png"))

                # Human-like: visit every major section and validate after it becomes viewport-near.
                for sid in major_ids:
                    loc=p.locator("#"+sid)
                    if loc.count()==0:
                        report["blockers"].append({"url":url,"width":w,"error":f"missing section #{sid}"})
                        continue
                    loc.scroll_into_view_if_needed()
                    p.wait_for_timeout(180)
                    sec=loc.evaluate("""el=>{
                      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
                      return {
                        display:cs.display,visibility:cs.visibility,opacity:cs.opacity,
                        width:r.width,height:r.height,
                        textChars:(el.innerText||'').trim().length
                      }
                    }""")
                    result["sections"][sid]=sec
                    if sec["display"]=="none" or sec["visibility"]=="hidden" or float(sec["opacity"])<0.95 or sec["width"]<10 or sec["height"]<20 or sec["textChars"]<20:
                        report["blockers"].append({"url":url,"width":w,"error":f"section #{sid} not visibly populated","section":sec})

                # Validate each reveal only after scrolling that exact reveal into viewport.
                reveals=p.locator(".reveal")
                result["reveals"]["count"]=reveals.count()
                for i in range(reveals.count()):
                    el=reveals.nth(i)
                    try:
                        el.scroll_into_view_if_needed(timeout=5000)
                        p.wait_for_timeout(45)
                        st=el.evaluate("""el=>{
                          const cs=getComputedStyle(el),r=el.getBoundingClientRect();
                          return {
                            tag:el.tagName,cls:el.className,
                            display:cs.display,visibility:cs.visibility,opacity:cs.opacity,
                            width:r.width,height:r.height,
                            text:(el.innerText||'').trim().slice(0,90),
                            imgCount:el.querySelectorAll('img').length
                          }
                        }""")
                        bad=st["display"]=="none" or st["visibility"]=="hidden" or float(st["opacity"])<0.95 or st["width"]<2 or st["height"]<2
                        if bad:
                            result["reveals"]["failed"].append({"index":i,**st})
                    except Exception as e:
                        result["reveals"]["failed"].append({"index":i,"error":repr(e)})

                # Visit representative sections and store actual viewport screenshots.
                for sid in ["summary","roles","pricing","docs"]:
                    p.locator("#"+sid).scroll_into_view_if_needed()
                    p.wait_for_timeout(160)
                    p.screenshot(path=str(EVID/f"r6-{label}-{w}-{sid}.png"))

                # Final whole-page structural checks after scrolling all sections.
                result["overflow"]=p.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
                result["brokenImages"]=p.locator("img").evaluate_all("(els)=>els.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)")
                result["consoleErrors"]=console[:12]
                body_chars=p.locator("body").inner_text()
                result["bodyTextChars"]=len(body_chars.strip())

                if result["reveals"]["count"]<30:
                    report["blockers"].append({"url":url,"width":w,"error":"unexpectedly low reveal count","count":result["reveals"]["count"]})
                if result["reveals"]["failed"]:
                    report["blockers"].append({"url":url,"width":w,"error":"reveal elements still hidden after viewport scroll","failed":result["reveals"]["failed"][:20]})
                if result["overflow"]:
                    report["blockers"].append({"url":url,"width":w,"error":"horizontal overflow"})
                if result["brokenImages"]:
                    report["blockers"].append({"url":url,"width":w,"error":"broken images","images":result["brokenImages"]})
                if "DPRO 診療所送迎予約" not in result["title"]:
                    report["blockers"].append({"url":url,"width":w,"error":"title mismatch","title":result["title"]})
                if "配車" not in result["h1"]:
                    report["blockers"].append({"url":url,"width":w,"error":"h1 mismatch","h1":result["h1"]})
                if result["bodyTextChars"]<2000:
                    report["blockers"].append({"url":url,"width":w,"error":"visible body text too sparse","chars":result["bodyTextChars"]})

                report["targets"][url]["responsive"][str(w)]=result
                p.close()
        browser.close()

    report["status"]="PASS" if not report["blockers"] else "FAIL"
    write("assets/clinic-shuttle-release/R6_SCROLL_VISIBILITY_FINAL_QA.json",report)

    # Always print a compact diagnostic before deciding.
    print(json.dumps({
        "status":report["status"],
        "blockerCount":len(report["blockers"]),
        "blockers":report["blockers"][:12]
    },ensure_ascii=False,indent=2))

    if report["blockers"]:
        raise SystemExit("R6 final visibility QA blockers remain")

    corrected={
        "status":"PRODUCT RELEASE COMPLETE",
        "releaseRevision":"R6_SCROLL_VISIBILITY_VERIFIED",
        "product":"DPRO 診療所送迎予約",
        "systemCode":"CLINIC_SHUTTLE",
        "productNumber":55,
        "systemFinalLock":SYSTEM_HEAD,
        "systemProtected":True,
        "officialCustomUrl":CUSTOM,
        "officialGithubPagesUrl":GHPAGES,
        "visibilityQA":{
            "method":"scroll-to-viewport computed-style QA",
            "viewports":[390,768,1440],
            "targets":["custom domain","GitHub Pages"],
            "majorSections":major_ids,
            "hiddenRevealAfterScroll":0,
            "brokenImages":0,
            "horizontalOverflow":False,
        },
        "blockers":[]
    }
    write("assets/clinic-shuttle-release/PRODUCT_RELEASE_COMPLETE.json",corrected)
    write("assets/clinic-shuttle-release/PRODUCT_RELEASE_COMPLETE_R6_VERIFIED.json",corrected)
    print("R6 FINAL VISIBILITY QA PASS")

if __name__=="__main__":
    audit()
