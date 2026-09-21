#!/usr/bin/env python3
from pathlib import Path
import json,time,urllib.request
from playwright.sync_api import sync_playwright

ROOT=Path.cwd()
EVID=ROOT/"assets"/"clinic-shuttle-release"
CUSTOM="https://dpro-shop.com/systems/clinic-shuttle"
GHPAGES="https://dpromstk2000-lab.github.io/dpro-shop-official-site/systems/clinic-shuttle.html"
SYSTEM_HEAD="3fc09f4b5c6781d6038dc280de5c58752ce60b51"
PRODUCT_HEAD="7bfb6ae44e53aeb470664aeec2991752ae5c3cbc"

def fetch_text(url,timeout=40):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 DPRO-R7-QA"})
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
    raise SystemExit(f"deployment not ready {url}: {last}")

def main():
    EVID.mkdir(parents=True,exist_ok=True)
    report={
      "stage":"R7_FINAL_HUMAN_LIKE_VISIBILITY_QA",
      "status":"PENDING",
      "method":"scroll each section/reveal into viewport, then validate computed visibility",
      "systemFinalLock":SYSTEM_HEAD,
      "systemProtected":True,
      "productHead":PRODUCT_HEAD,
      "targets":{},
      "blockers":[]
    }
    urls=[CUSTOM,GHPAGES]
    ids=["summary","features","flow","roles","demo","safety","pricing","docs","faq"]

    for u in urls:
        report["targets"][u]={"deploy":wait_r5(u),"responsive":{}}

    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for ui,u in enumerate(urls):
            label="custom" if ui==0 else "github-pages"
            for w in [390,768,1440]:
                p=browser.new_page(viewport={"width":w,"height":1000})
                errors=[]
                p.on("console",lambda m,a=errors:a.append(m.text) if m.type=="error" else None)
                p.goto(u,wait_until="networkidle",timeout=60000)
                p.wait_for_timeout(700)

                rec={
                    "title":p.title(),
                    "h1":p.locator("h1").inner_text() if p.locator("h1").count() else "",
                    "sections":{},
                    "reveals":{"count":0,"failed":[]},
                    "consoleErrors":[]
                }

                # Major sections: move into viewport first, then validate.
                for sid in ids:
                    el=p.locator("#"+sid)
                    if el.count()==0:
                        report["blockers"].append({"url":u,"width":w,"error":"missing section","id":sid})
                        continue
                    el.scroll_into_view_if_needed()
                    p.wait_for_timeout(120)
                    sec=el.evaluate("""el=>{
                      const c=getComputedStyle(el),r=el.getBoundingClientRect();
                      return {
                        display:c.display,
                        visibility:c.visibility,
                        opacity:Number(c.opacity),
                        width:r.width,
                        height:r.height,
                        textChars:(el.innerText||'').trim().length
                      }
                    }""")
                    rec["sections"][sid]=sec
                    if sec["display"]=="none" or sec["visibility"]=="hidden" or sec["opacity"]<.95 or sec["width"]<10 or sec["height"]<20 or sec["textChars"]<20:
                        report["blockers"].append({"url":u,"width":w,"error":"section visibility","id":sid,"value":sec})

                # Every reveal: scroll exact element into viewport, then validate.
                rev=p.locator(".reveal")
                rec["reveals"]["count"]=rev.count()
                for i in range(rev.count()):
                    el=rev.nth(i)
                    el.scroll_into_view_if_needed(timeout=5000)
                    p.wait_for_timeout(25)
                    st=el.evaluate("""el=>{
                      const c=getComputedStyle(el),r=el.getBoundingClientRect();
                      return {
                        display:c.display,
                        visibility:c.visibility,
                        opacity:Number(c.opacity),
                        width:r.width,
                        height:r.height,
                        text:(el.innerText||'').trim().slice(0,80)
                      }
                    }""")
                    if st["display"]=="none" or st["visibility"]=="hidden" or st["opacity"]<.95 or st["width"]<2 or st["height"]<2:
                        rec["reveals"]["failed"].append({"index":i,**st})

                rec["overflow"]=p.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
                rec["brokenImages"]=p.locator("img").evaluate_all("(els)=>els.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)")
                rec["consoleErrors"]=errors[:10]

                if rec["reveals"]["count"]<30:
                    report["blockers"].append({"url":u,"width":w,"error":"unexpected reveal count","count":rec["reveals"]["count"]})
                if rec["reveals"]["failed"]:
                    report["blockers"].append({"url":u,"width":w,"error":"hidden reveals","failed":rec["reveals"]["failed"][:20]})
                if rec["overflow"]:
                    report["blockers"].append({"url":u,"width":w,"error":"horizontal overflow"})
                if rec["brokenImages"]:
                    report["blockers"].append({"url":u,"width":w,"error":"broken images","images":rec["brokenImages"]})
                if "DPRO 診療所送迎予約" not in rec["title"]:
                    report["blockers"].append({"url":u,"width":w,"error":"title mismatch","title":rec["title"]})
                if "配車" not in rec["h1"]:
                    report["blockers"].append({"url":u,"width":w,"error":"h1 mismatch","h1":rec["h1"]})

                # Evidence screenshots after actually visiting each representative section.
                for sid in ["summary","roles","pricing","docs"]:
                    p.locator("#"+sid).scroll_into_view_if_needed()
                    p.wait_for_timeout(100)
                    p.screenshot(path=str(EVID/f"r7-{label}-{w}-{sid}.png"))

                report["targets"][u]["responsive"][str(w)]=rec
                p.close()
        browser.close()

    report["status"]="PASS" if not report["blockers"] else "FAIL"
    (EVID/"R7_FINAL_VISIBILITY_QA.json").write_text(
        json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8"
    )

    print(json.dumps({
        "status":report["status"],
        "blockerCount":len(report["blockers"]),
        "blockers":report["blockers"][:20]
    },ensure_ascii=False,indent=2))

    if report["blockers"]:
        raise SystemExit("R7 blockers remain")

    final={
      "status":"PRODUCT RELEASE COMPLETE",
      "releaseRevision":"R7_VISIBILITY_VERIFIED",
      "supersedes":"R4 completion and R5/R6 provisional visibility evidence",
      "product":"DPRO 診療所送迎予約",
      "systemCode":"CLINIC_SHUTTLE",
      "productNumber":55,
      "systemFinalLock":SYSTEM_HEAD,
      "systemProtected":True,
      "officialCustomUrl":CUSTOM,
      "officialGithubPagesUrl":GHPAGES,
      "visibilityQA":{
        "method":"human-like scroll-to-viewport computed-style QA",
        "viewports":[390,768,1440],
        "targets":["custom domain","GitHub Pages"],
        "majorSections":ids,
        "hiddenRevealAfterScroll":0,
        "brokenImages":0,
        "horizontalOverflow":False
      },
      "blockers":[]
    }

    (EVID/"PRODUCT_RELEASE_COMPLETE.json").write_text(
        json.dumps(final,ensure_ascii=False,indent=2),encoding="utf-8"
    )
    (EVID/"PRODUCT_RELEASE_COMPLETE_R7_VERIFIED.json").write_text(
        json.dumps(final,ensure_ascii=False,indent=2),encoding="utf-8"
    )
    print("R7 FINAL VISIBILITY QA PASS")

if __name__=="__main__":
    main()
