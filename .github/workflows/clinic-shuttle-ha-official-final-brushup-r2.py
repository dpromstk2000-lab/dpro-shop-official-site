#!/usr/bin/env python3
from pathlib import Path
import json, os, re, sys, time, urllib.request

ROOT=Path.cwd()
TARGET=ROOT/"systems/clinic-shuttle.html"
EVID=ROOT/"release-evidence-ha-official-r2"

SYSTEM_HEAD="3fc09f4b5c6781d6038dc280de5c58752ce60b51"
PRODUCT_HEAD="4dba31e5daa62e1966afcf293a3094d98acab243"
URL="https://dpro-shop.com/systems/clinic-shuttle"

CSS_MARKER="/* CLINIC SHUTTLE HUMAN ACCEPTANCE DENSITY R2 */"
CSS_BLOCK=r'''
/* CLINIC SHUTTLE HUMAN ACCEPTANCE DENSITY R2 */
.clinic-shuttle-product-page .section{
  padding-top:clamp(48px,5.4vw,68px);
  padding-bottom:clamp(48px,5.4vw,68px);
}
.clinic-shuttle-product-page #docs{padding-bottom:38px}
.clinic-shuttle-product-page #faq{padding-top:38px}
.clinic-shuttle-product-page .product-live#demo{
  padding-top:clamp(44px,5vw,62px);
  padding-bottom:clamp(48px,5vw,66px);
}
.clinic-shuttle-product-page .product-section-heading{
  margin-bottom:clamp(22px,2.8vw,32px);
}
.clinic-shuttle-product-page .clinic-docs a{
  min-height:70px;
  display:flex;
  align-items:center;
}
@media(max-width:560px){
  .clinic-shuttle-product-page .section{
    padding-top:42px;
    padding-bottom:42px;
  }
  .clinic-shuttle-product-page #docs{padding-bottom:30px}
  .clinic-shuttle-product-page #faq{padding-top:30px}
}
'''

REMOVE_STAGE='''<div class="product-stage-tablet"><div class="product-tablet-inner"><small>LIVE DEMO</small><h3>説明画像ではなく、現在の実画面を公開。</h3><p>患者・ご家族、管理・配車PC、iPad、運転員・スタッフの役割別画面を確認できます。</p></div></div>'''

OLD_DEMO='''<div class="product-section-heading reveal"><div><p class="eyebrow eyebrow-light"><span></span>REAL SCREEN DEMO</p><h2>説明画像ではなく、<br>本物の画面を体験。</h2></div><p>公開デモは架空データのみを使用しています。</p></div>'''
NEW_DEMO='''<div class="product-section-heading reveal"><div><p class="eyebrow eyebrow-light"><span></span>REAL SCREEN DEMO</p><h2>4つの役割画面を、<br>公開デモで確認。</h2></div><p>患者・ご家族、管理・配車PC、iPad、スタッフの現行画面を役割別に開けます。公開デモは架空データのみです。</p></div>'''

OLD_DOC='''<div class="product-section-heading reveal"><div><p class="eyebrow eyebrow-dark"><span></span>PRODUCT DOCUMENTS</p><h2>導入前に、<br><em>資料と操作を確認。</em></h2></div><p>PRODUCT SITEにはA4資料、操作体験シート、Quick Start、詳細マニュアルを用意しています。</p></div>'''
NEW_DOC='''<div class="product-section-heading reveal"><div><p class="eyebrow eyebrow-dark"><span></span>PRODUCT DOCUMENTS</p><h2>導入前の資料を、<br><em>まとめて確認。</em></h2></div><p>A4販売チラシ、操作体験シート、Quick Start、詳細マニュアルをPRODUCT SITEで確認できます。</p></div>'''

REMOVE_FAQ='''<details><summary>実際の画面を導入前に確認できますか？</summary><p>はい。患者・ご家族、管理・配車PC、iPad、運転員・スタッフの公開LIVE DEMOを確認できます。</p></details>'''

OLD_FINAL='''<div class="product-live-copy reveal"><span>PRODUCT 55</span><h2>診療所送迎を、<br>予約から帰宅まで一つに。</h2><p>仕組みと料金はDPRO SHOPで、実画面・資料・操作はPRODUCT SITEで確認できます。</p>'''
NEW_FINAL='''<div class="product-live-copy reveal"><span>PRODUCT 55</span><h2>現在の送迎運用と、<br>導入後の流れを見比べる。</h2><p>このページでは概要と料金を、PRODUCT SITEでは実画面・資料・操作を確認できます。</p>'''

def write(name,obj):
    EVID.mkdir(parents=True,exist_ok=True)
    (EVID/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding="utf-8")

def fetch(url,timeout=45):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 DPRO-HA-OFFICIAL-R2"})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return r.status,r.read()

def api_head(repo):
    _,b=fetch(f"https://api.github.com/repos/{repo}/branches/main")
    return json.loads(b.decode())["commit"]["sha"]

def replace_once(s, old, new, label):
    c=s.count(old)
    if c!=1:
        raise SystemExit(f"{label} expected exactly once, got {c}")
    return s.replace(old,new,1)

def faq_count(s):
    return len(re.findall(r"<details(?:\s|>)", s))

def patch():
    s=TARGET.read_text(encoding="utf-8")

    if CSS_MARKER not in s:
        anchor='@media(max-width:820px)'
        if anchor not in s:
            raise SystemExit("CSS anchor missing")
        s=s.replace(anchor,CSS_BLOCK+"\n"+anchor,1)

    s=replace_once(s,REMOVE_STAGE,"","hero duplicate live-demo copy")
    s=replace_once(s,OLD_DEMO,NEW_DEMO,"demo heading")
    s=replace_once(s,OLD_DOC,NEW_DOC,"docs heading")
    s=replace_once(s,REMOVE_FAQ,"","duplicate FAQ")
    s=replace_once(s,OLD_FINAL,NEW_FINAL,"final CTA copy")

    TARGET.write_text(s,encoding="utf-8")

    checks={
      "duplicate_phrase_removed":"説明画像ではなく" not in s,
      "hero_tablet_removed":"product-stage-tablet" not in s,
      "demo_heading":"4つの役割画面を、<br>公開デモで確認。" in s,
      "faq_count":faq_count(s),
      "official_price":"33,000円" in s and "月額1,100円" in s,
      "product_link":"https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/clinic-shuttle.html" in s,
      "demo_link":"https://dpromstk2000-lab.github.io/dpro-clinic-shuttle-line/" in s
    }
    if not checks["duplicate_phrase_removed"] or not checks["hero_tablet_removed"] or not checks["demo_heading"]:
        raise SystemExit("source checks failed "+json.dumps(checks,ensure_ascii=False))
    if checks["faq_count"]!=3:
        raise SystemExit("FAQ count expected 3, got "+str(checks["faq_count"]))
    if not checks["official_price"] or not checks["product_link"] or not checks["demo_link"]:
        raise SystemExit("fact/link checks failed "+json.dumps(checks,ensure_ascii=False))

    write("HA_OFFICIAL_SOURCE_R2.json",{
      "pass":True,
      "humanAcceptanceDefects":["HA-01","HA-02","HA-03","HA-06"],
      "changes":[
        "Removed duplicate hero LIVE DEMO explanatory block",
        "Changed live section heading to role-specific current-screen purpose",
        "Reduced section/docs/FAQ vertical spacing",
        "Removed duplicate live-demo FAQ",
        "Clarified final CTA role separation"
      ],
      "checks":checks,
      "systemReopenRequired":False
    })
    print("HA OFFICIAL SOURCE R2 PASS")

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
            p.wait_for_timeout(350)
            p.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}window.scrollTo(0,0)}")
            rec=p.evaluate('''()=>({
              scrollWidth:document.documentElement.scrollWidth,
              innerWidth:window.innerWidth,
              height:document.documentElement.scrollHeight,
              broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),
              hiddenReveal:[...document.querySelectorAll(".reveal")].filter(x=>{
                const c=getComputedStyle(x),r=x.getBoundingClientRect();
                return c.display==="none"||c.visibility==="hidden"||Number(c.opacity)<.95||r.width<=0||r.height<=0
              }).length,
              details:document.querySelectorAll("#faq details").length,
              duplicateText:document.body.innerText.includes("説明画像ではなく"),
              heroTablet:document.querySelectorAll(".product-stage-tablet").length
            })''')
            if rec["scrollWidth"]>w+2 or rec["broken"] or rec["hiddenReveal"] or rec["duplicateText"] or rec["heroTablet"] or rec["details"]!=3:
                raise SystemExit(f"official QA fail width={w}: "+json.dumps(rec,ensure_ascii=False))
            if w in (390,1440):
                p.screenshot(path=str(EVID/f"official-ha-r2-{w}.png"),full_page=True)
            qa[str(w)]=rec
            p.close()
        b.close()

    if api_head("dpromstk2000-lab/dpro-clinic-shuttle-line")!=SYSTEM_HEAD:
        raise SystemExit("SYSTEM FINAL LOCK drift")
    if api_head("dpromstk2000-lab/dpro-line-systems-site")!=PRODUCT_HEAD:
        raise SystemExit("PRODUCT drift during OFFICIAL HA fix")

    write("HA_OFFICIAL_PUBLIC_QA_R2.json",{
      "pass":True,
      "finalOfficialHead":head,
      "pages":pages,
      "viewports":qa,
      "systemFinalLock":SYSTEM_HEAD,
      "productHead":PRODUCT_HEAD,
      "humanAcceptanceStatus":"PENDING_PRODUCT_FIX"
    })
    print("HA_OFFICIAL_R2_SUMMARY="+json.dumps({
      "status":"PASS",
      "final_official_head":head,
      "pages_run":pages["id"],
      "system_final_lock":SYSTEM_HEAD,
      "human_acceptance":"PENDING_PRODUCT_FIX"
    },ensure_ascii=False))

if __name__=="__main__":
    if len(sys.argv)!=2:
        raise SystemExit("usage: patch|publicqa")
    {"patch":patch,"publicqa":publicqa}[sys.argv[1]]()
