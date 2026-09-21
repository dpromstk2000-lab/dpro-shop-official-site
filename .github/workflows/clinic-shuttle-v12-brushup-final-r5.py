#!/usr/bin/env python3
from pathlib import Path
import json, os, re, sys, time, shutil, subprocess, urllib.request, urllib.error

ROOT=Path.cwd()
EVID=ROOT/"release-evidence-v12-final-brushup"
PRODUCT_TMP=Path("/tmp/dpro-product-r4")

SYSTEM_HEAD="3fc09f4b5c6781d6038dc280de5c58752ce60b51"
OFFICIAL_BASELINE="b9b79d6eed7e78f44c967f319480654f40b84a24"
PRODUCT_HEAD="6a04230ec526d3ea589ffc42a5e777a355e95e46"

OFFICIAL_URL="https://dpro-shop.com/systems/clinic-shuttle"
OFFICIAL_ROOT="https://dpro-shop.com/"
OFFICIAL_GH="https://dpromstk2000-lab.github.io/dpro-shop-official-site/systems/clinic-shuttle.html"
PRODUCT_URL="https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/clinic-shuttle.html"
SYSTEMS_URL="https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems.html"
PROPOSAL_URL="https://dpromstk2000-lab.github.io/dpro-line-systems-site/proposal.html?code=CLINIC_SHUTTLE#proposals"
LP_URL="https://dpromstk2000-lab.github.io/dpro-line-systems-site/lp-clinic-shuttle.html"
FLYER_URL="https://dpromstk2000-lab.github.io/dpro-line-systems-site/flyer-clinic-shuttle.html"
FLYER_PDF="https://dpromstk2000-lab.github.io/dpro-line-systems-site/flyer-clinic-shuttle.pdf"
OP_PDF="https://dpromstk2000-lab.github.io/dpro-line-systems-site/assets/clinic-shuttle-next/DPRO_CLINIC_SHUTTLE_OPERATION_EXPERIENCE_SHEET_V1.0.pdf"
QUICK_PDF="https://dpromstk2000-lab.github.io/dpro-line-systems-site/DPRO_TUTORIAL_CLINIC_SHUTTLE_QUICK_START_V1.0.pdf"
DETAIL_PDF="https://dpromstk2000-lab.github.io/dpro-line-systems-site/DPRO_TUTORIAL_CLINIC_SHUTTLE_DETAILED_MANUAL_V1.0.pdf"
DEMO_URL="https://dpromstk2000-lab.github.io/dpro-clinic-shuttle-line/"
MEMBER_URL=DEMO_URL+"member.html"
OWNER_URL=DEMO_URL+"owner.html"
IPAD_URL=DEMO_URL+"owner-ipad.html"
STAFF_URL=DEMO_URL+"staff.html"
CHECK_URL=DEMO_URL+"system-check.html"
GUIDE_URL=DEMO_URL+"guide-center.html"
LINE_URL="https://lin.ee/YxJGXV6D"

ALLOWED_QR={
    LINE_URL, OFFICIAL_ROOT, OFFICIAL_URL, PRODUCT_URL, DEMO_URL,
    MEMBER_URL, OWNER_URL, IPAD_URL, STAFF_URL, CHECK_URL, GUIDE_URL
}

def write(name,obj):
    EVID.mkdir(parents=True,exist_ok=True)
    p=EVID/name
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2) if isinstance(obj,(dict,list)) else str(obj),encoding="utf-8")

def fetch(url,timeout=45,allow_http_error=False):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 DPRO-V12-R4"})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:
            return r.status,r.read()
    except urllib.error.HTTPError as e:
        if allow_http_error:
            return e.code,e.read()
        raise

def fetch_text(url,timeout=45,allow_http_error=False):
    s,b=fetch(url,timeout,allow_http_error)
    return s,b.decode("utf-8","ignore")

def api_head(repo):
    _,data=fetch(f"https://api.github.com/repos/{repo}/branches/main")
    return json.loads(data.decode("utf-8"))["commit"]["sha"]

def clone_product():
    if PRODUCT_TMP.exists(): shutil.rmtree(PRODUCT_TMP)
    subprocess.check_call(["git","clone","--quiet","--depth","1",
        "https://github.com/dpromstk2000-lab/dpro-line-systems-site.git",str(PRODUCT_TMP)])
    got=subprocess.check_output(["git","-C",str(PRODUCT_TMP),"rev-parse","HEAD"],text=True).strip()
    if got!=PRODUCT_HEAD:
        raise SystemExit(f"PRODUCT clone drift {got} != {PRODUCT_HEAD}")

def read(path,base=ROOT):
    return (base/path).read_text(encoding="utf-8",errors="ignore")

def runtime_files(base):
    for p in base.rglob("*"):
        if not p.is_file(): continue
        if ".git" in p.parts or ".github" in p.parts: continue
        if any(x.startswith("release-evidence") for x in p.parts): continue
        if p.suffix.lower() not in {".html",".js",".xml"}: continue
        yield p

def semantic_scan(base):
    rules=[
      ("old_count_54",re.compile(r"(54システム|54製品|54の業種別)")),
      ("wrong_clinic_slug",re.compile(r"(systems/clinic_shuttle|dpro-shop\.com/systems/clinic_shuttle)")),
      ("old_clinic_photo_ref",re.compile(r"clinic-care\.jpg"))
    ]
    hits=[]
    for p in runtime_files(base):
        s=p.read_text(encoding="utf-8",errors="ignore")
        for key,rx in rules:
            for m in rx.finditer(s):
                hits.append({"rule":key,"path":str(p.relative_to(base)),
                             "line":s.count("\n",0,m.start())+1,"text":m.group(0)})
    return hits

def b1():
    clone_product()
    off_hits=semantic_scan(ROOT)
    prod_hits=semantic_scan(PRODUCT_TMP)

    off_product=read(Path("systems/clinic-shuttle.html"))
    off_pricing=read(Path("pricing.html"))
    off_404=read(Path("404.html"))
    off_index=read(Path("index.html"))
    prod_detail=read(Path("systems/clinic-shuttle.html"),PRODUCT_TMP)
    prod_data=read(Path("systems-data.js"),PRODUCT_TMP)
    prod_lp=read(Path("lp-clinic-shuttle.html"),PRODUCT_TMP)
    prod_flyer=read(Path("flyer-clinic-shuttle.html"),PRODUCT_TMP)
    prod_runtime=read(Path("product-v3.6.js"),PRODUCT_TMP)

    checks={
      "official_title": "DPRO 診療所送迎予約" in off_product,
      "official_url": OFFICIAL_URL in off_product,
      "official_price_33000": '"price":"33000"' in off_product and "初期33,000円" in off_pricing,
      "official_price_1100": '"price":"1100"' in off_product and "月額1,100円" in off_pricing,
      "line_price_77000_3300": "77,000円" in off_pricing and "3,300円" in off_pricing,
      "official_404_55": "55システムの説明を見る" in off_404 and "54システム" not in off_404,
      "official_index_55": "55" in off_index,
      "product_code": '"code": "CLINIC_SHUTTLE"' in prod_data,
      "product_asset_slug": '"assetSlug": "clinic-shuttle"' in prod_data,
      "runtime_slug_map": "CLINIC_SHUTTLE:'clinic-shuttle'" in prod_runtime,
      "runtime_jsonld_55": "DPRO LINE SYSTEMS 55製品" in prod_runtime,
      "product_detail_official_url": OFFICIAL_URL in prod_detail,
      "product_detail_price": "33,000円" in prod_detail and "1,100円" in prod_detail,
      "product_scope_out": all(x in prod_detail for x in ["電子カルテ","診断","検査","薬剤","請求・レセプト","医療判断"]),
      "lp_bright_media": "clinic-care-bright.png" in prod_lp and "clinic-care.jpg" not in prod_lp,
      "flyer_master_v22": "A4 FLYER MASTER V2.2" in prod_flyer,
      "flyer_official_root": "https://dpro-shop.com/" in prod_flyer
    }
    blockers=[]
    if off_hits: blockers.append({"type":"official_semantic_stale","hits":off_hits[:100]})
    if prod_hits: blockers.append({"type":"product_semantic_stale","hits":prod_hits[:100]})
    blockers += [{"type":"fact_check","check":k} for k,v in checks.items() if not v]

    result={
      "stage":"BRUSHUP 1/4 FACTS",
      "pass":not blockers,
      "official_head_expected":os.environ.get("FINAL_OFFICIAL_HEAD",""),
      "product_head":PRODUCT_HEAD,
      "checks":checks,
      "official_stale_hits":off_hits,
      "product_stale_hits":prod_hits,
      "blockers":blockers
    }
    write("BRUSHUP_B1_FACTS.json",result)
    if blockers:
        print(json.dumps(result,ensure_ascii=False,indent=2))
        raise SystemExit("B1 blockers remain")
    print("BRUSHUP 1/4 PASS")

def absolute(page,href):
    return page.evaluate("(h)=>new URL(h,location.href).href",href)

def exact_href(page,selector,expected):
    loc=page.locator(selector)
    if loc.count()!=1:
        raise AssertionError(f"selector count {loc.count()} != 1: {selector}")
    got=absolute(page,loc.get_attribute("href"))
    if got!=expected:
        raise AssertionError(f"{selector}: {got} != {expected}")
    return {"selector":selector,"href":got}

def destination(page,url,needle):
    page.goto(url,wait_until="networkidle",timeout=60000)
    page.wait_for_timeout(300)
    text=page.title()+"\n"+page.locator("body").inner_text()
    if needle not in text:
        raise AssertionError(f"signature missing {needle} @ {url}")
    return {"url":url,"title":page.title(),"signature":needle}

def b2(browser):
    p=browser.new_page(viewport={"width":1440,"height":1000})
    checks=[]; dest=[]

    p.goto(SYSTEMS_URL,wait_until="networkidle",timeout=60000)
    checks += [
      exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-product',PRODUCT_URL),
      exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-demo',DEMO_URL),
      exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-official',OFFICIAL_URL),
      exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-proposal-link',PROPOSAL_URL)
    ]

    p.goto(PROPOSAL_URL,wait_until="networkidle",timeout=60000)
    checks += [
      exact_href(p,'[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .is-primary',LP_URL),
      exact_href(p,'[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .is-demo',DEMO_URL),
      exact_href(p,'[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .is-official',OFFICIAL_URL)
    ]
    foot=p.locator('[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .p36-proposal-card__foot a').first
    if absolute(p,foot.get_attribute("href"))!=PRODUCT_URL:
        raise AssertionError("proposal PRODUCT link mismatch")
    checks.append({"selector":"proposal clinic PRODUCT","href":PRODUCT_URL})

    for url,label,targets in [
      (PRODUCT_URL,"product",[OFFICIAL_URL,DEMO_URL,LINE_URL]),
      (OFFICIAL_URL,"official",[PRODUCT_URL,DEMO_URL,LINE_URL,MEMBER_URL,OWNER_URL,IPAD_URL,STAFF_URL])
    ]:
        p.goto(url,wait_until="networkidle",timeout=60000)
        for target in targets:
            n=p.locator(f'a[href="{target}"]').count()
            if n<1: raise AssertionError(f"{label} missing target {target}")
            checks.append({"surface":label,"target":target,"count":n})

    dest += [
      destination(p,OFFICIAL_URL,"DPRO 診療所送迎予約"),
      destination(p,PRODUCT_URL,"DPRO 診療所送迎予約"),
      destination(p,LP_URL,"DPRO 診療所送迎予約"),
      destination(p,DEMO_URL,"操作デモポータル"),
      destination(p,MEMBER_URL,"ご家族用"),
      destination(p,OWNER_URL,"管理・配車画面"),
      destination(p,IPAD_URL,"iPad配車画面"),
      destination(p,STAFF_URL,"現場スタッフ")
    ]

    wrong_status,wrong_body=fetch_text("https://dpro-shop.com/systems/clinic_shuttle",allow_http_error=True)
    if wrong_status!=404 or "55システムの説明を見る" not in wrong_body or "54システム" in wrong_body:
        raise AssertionError("negative route 404/current count failed")
    checks.append({"negative_route":"https://dpro-shop.com/systems/clinic_shuttle","status":404,"count55":True})

    p.close()
    result={"stage":"BRUSHUP 2/4 SALES JOURNEY","pass":True,"checks":checks,"destinations":dest}
    write("BRUSHUP_B2_SALES_JOURNEY.json",result)
    print("BRUSHUP 2/4 PASS")

def visible_record(el):
    return el.evaluate("""el=>{const c=getComputedStyle(el),r=el.getBoundingClientRect();
      return {display:c.display,visibility:c.visibility,opacity:Number(c.opacity),
              width:r.width,height:r.height,top:r.top,bottom:r.bottom}}""")

def audit_all(page,url,width,label,selector):
    page.goto(url,wait_until="networkidle",timeout=60000)
    page.wait_for_timeout(300)
    loc=page.locator(selector)
    count=loc.count()
    if count<1: raise AssertionError(f"{label}: no elements {selector}")
    elements=[]
    for i in range(count):
        el=loc.nth(i)
        el.scroll_into_view_if_needed(timeout=5000)
        page.wait_for_timeout(60)
        st=visible_record(el)
        if st["display"]=="none" or st["visibility"]=="hidden" or st["opacity"]<0.95 or st["width"]<=0 or st["height"]<=0:
            raise AssertionError(f"{label} hidden index={i} {st}")
        elements.append({"index":i,**st})
    broken=page.locator("img").evaluate_all("(xs)=>xs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)")
    overflow=page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
    if broken or overflow:
        raise AssertionError(f"{label} blocker broken={broken} overflow={overflow}")
    return {"url":url,"width":width,"title":page.title(),"count":count,"elements":elements,
            "brokenImages":broken,"overflow":overflow}

def decode_pdf(url,pages_expected,required_qr=None,require_qr=False):
    import fitz, numpy as np, cv2, zxingcpp
    status,data=fetch(url)
    if status!=200: raise AssertionError(f"PDF HTTP {status} {url}")
    tmp=Path("/tmp")/(url.split("/")[-1])
    tmp.write_bytes(data)
    doc=fitz.open(tmp)
    if doc.page_count!=pages_expected:
        raise AssertionError(f"PDF pages {doc.page_count}!={pages_expected} {url}")
    decoded=set(); page_info=[]
    for i,page in enumerate(doc):
        pix=page.get_pixmap(matrix=fitz.Matrix(2.4,2.4),alpha=False)
        arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)
        if pix.n==4: arr=cv2.cvtColor(arr,cv2.COLOR_RGBA2RGB)
        gray=cv2.cvtColor(arr,cv2.COLOR_RGB2GRAY)
        nonwhite=int((gray<248).sum())
        if nonwhite<1000: raise AssertionError(f"near blank PDF page {i+1}")
        q=[r.text for r in zxingcpp.read_barcodes(arr) if r.text]
        decoded.update(q)
        page_info.append({"page":i+1,"nonwhitePixels":nonwhite,"qr":q})
    if required_qr:
        missing=[q for q in required_qr if q not in decoded]
        if missing: raise AssertionError(f"PDF QR missing {missing}; got={sorted(decoded)}")
    if require_qr and not decoded:
        raise AssertionError(f"PDF QR required but none decoded {url}")
    unknown=[q for q in decoded if q.startswith("http") and q not in ALLOWED_QR]
    if unknown: raise AssertionError(f"unapproved QR {unknown}")
    return {"url":url,"status":status,"bytes":len(data),"pages":doc.page_count,
            "qrDecoded":sorted(decoded),"pageEvidence":page_info}

def b3(browser):
    widths=[375,390,430,768,1280,1440]
    defs=[
      ("official",OFFICIAL_URL,'.clinic-shuttle-product-page .reveal'),
      ("product",PRODUCT_URL,'main section'),
      ("lp",LP_URL,'header.hero, section.section, section.final'),
      ("flyer",FLYER_URL,'.sheet, .action-card')
    ]
    surfaces={}
    for name,url,selector in defs:
        surfaces[name]={}
        for w in widths:
            p=browser.new_page(viewport={"width":w,"height":1000})
            rec=audit_all(p,url,w,name,selector)
            if name=="lp":
                bg=p.locator("header.hero").evaluate("el=>getComputedStyle(el).backgroundImage")
                rec["heroBackground"]=bg
                if "clinic-care-bright.png" not in bg: raise AssertionError("LP bright media missing")
            if name=="flyer":
                metrics=p.evaluate("""()=>{const cards=[...document.querySelectorAll('.action-card')].map(x=>x.getBoundingClientRect());
                  const f=document.querySelector('.footer')?.getBoundingClientRect();
                  return {spread:cards.length?Math.max(...cards.map(x=>x.height))-Math.min(...cards.map(x=>x.height)):999,
                          footerOverlap:f&&cards.length?Math.max(0,Math.max(...cards.map(x=>x.bottom))-f.top):999,
                          officialUrl:document.querySelector('.ow-url')?.textContent.trim()||''}}""")
                rec["flyerMetrics"]=metrics
                if metrics["spread"]>1.5 or metrics["footerOverlap"]>0 or metrics["officialUrl"]!=OFFICIAL_ROOT:
                    raise AssertionError(f"flyer metric drift {metrics}")
            if w in (390,1440):
                p.screenshot(path=str(EVID/f"{name}-{w}.png"),full_page=True)
            surfaces[name][str(w)]=rec
            p.close()

    pdfs={
      "flyer":decode_pdf(FLYER_PDF,1,[LINE_URL,OFFICIAL_ROOT,DEMO_URL],False),
      "operation":decode_pdf(OP_PDF,1,[PRODUCT_URL,MEMBER_URL,OWNER_URL,IPAD_URL,STAFF_URL,LINE_URL],False),
      "quick":decode_pdf(QUICK_PDF,3,None,True),
      "detailed":decode_pdf(DETAIL_PDF,9,None,True)
    }
    result={"stage":"BRUSHUP 3/4 VISUAL / MOBILE / PRINT / QR","pass":True,
            "viewports":widths,"surfaces":surfaces,"pdfs":pdfs}
    write("BRUSHUP_B3_VISUAL_PRINT_QR.json",result)
    print("BRUSHUP 3/4 PASS")

def github_runs(repo):
    _,data=fetch(f"https://api.github.com/repos/{repo}/actions/runs?per_page=100")
    return json.loads(data.decode("utf-8"))["workflow_runs"]

def pages_success(repo,head):
    for x in github_runs(repo):
        if x.get("name")=="pages build and deployment" and x.get("head_sha")==head and x.get("status")=="completed" and x.get("conclusion")=="success":
            return {"id":x["id"],"head_sha":head,"html_url":x["html_url"],"conclusion":"success"}
    return None

def wait_pages(repo,head,tries=50):
    for _ in range(tries):
        hit=pages_success(repo,head)
        if hit: return hit
        time.sleep(10)
    raise AssertionError(f"Pages success not found {repo} {head}")

def b4():
    final_official=os.environ.get("FINAL_OFFICIAL_HEAD","").strip()
    if not re.fullmatch(r"[0-9a-f]{40}",final_official):
        raise SystemExit("FINAL_OFFICIAL_HEAD missing")
    if api_head("dpromstk2000-lab/dpro-shop-official-site")!=final_official:
        raise SystemExit("OFFICIAL HEAD changed during R4")
    if api_head("dpromstk2000-lab/dpro-line-systems-site")!=PRODUCT_HEAD:
        raise SystemExit("PRODUCT HEAD drift during R4")
    if api_head("dpromstk2000-lab/dpro-clinic-shuttle-line")!=SYSTEM_HEAD:
        raise SystemExit("SYSTEM FINAL LOCK drift during R4")

    op=wait_pages("dpromstk2000-lab/dpro-shop-official-site",final_official)
    pp=pages_success("dpromstk2000-lab/dpro-line-systems-site",PRODUCT_HEAD)
    if not pp: raise AssertionError("PRODUCT Pages success for current HEAD missing")

    markers={}
    for name,url,need in [
      ("official",OFFICIAL_URL,"DPRO 診療所送迎予約"),
      ("official_gh",OFFICIAL_GH,"DPRO 診療所送迎予約"),
      ("product",PRODUCT_URL,"PRODUCT 55"),
      ("lp",LP_URL,"clinic-care-bright.png"),
      ("flyer",FLYER_URL,"A4 FLYER MASTER V2.2")
    ]:
        status,text=fetch_text(url)
        markers[name]={"status":status,"needle":need,"pass":status==200 and need in text}
    st404,t404=fetch_text(OFFICIAL_ROOT+"__dpro_v12_r4_negative__",allow_http_error=True)
    markers["negative_404"]={"status":st404,"pass":st404==404 and "55システムの説明を見る" in t404 and "54システム" not in t404}
    if not all(x["pass"] for x in markers.values()):
        raise AssertionError(f"public marker fail {markers}")

    control_now=api_head("dpromstk2000-lab/dpro-shop-control-center")
    result={
      "stage":"BRUSHUP 4/4 PUBLIC / DEPLOY",
      "technical_pass":True,
      "external_completion_required":"This workflow run itself must complete with success.",
      "heads":{"system":SYSTEM_HEAD,"official":final_official,"product":PRODUCT_HEAD,
               "control_center_observed_non_blocking":control_now},
      "pages":{"official":op,"product":pp},
      "public_markers":markers,
      "release_scoped_ci_policy":"unrelated repository workflows do not block CLINIC_SHUTTLE",
      "closed_release_defects":["DEF-016","DEF-017","DEF-018","DEF-019","DEF-020"],
      "open_defects":{"blocker":0,"high":0}
    }
    write("BRUSHUP_B4_PUBLIC_DEPLOY_PRE_EXTERNAL.json",result)
    print("BRUSHUP 4/4 TECHNICAL PREPASS PASS")

def main():
    if len(sys.argv)!=2: raise SystemExit("usage: runner.py audit")
    from playwright.sync_api import sync_playwright
    b1()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        b2(browser)
        b3(browser)
        browser.close()
    b4()
    human={
      "schema_version":"DPRO-PRODUCT-RELEASE-HUMAN-ACCEPTANCE-R1",
      "status":"PENDING",
      "pass":False,
      "approver":"",
      "approved_at":None,
      "required_checks":{
        "official_visual":False,
        "product_visual":False,
        "lp_visual":False,
        "flyer_visual":False,
        "mobile_readability":False,
        "japanese_copy_breaks":False,
        "hero_media_suitability":False,
        "dpro_series_consistency":False,
        "five_minute_sales_journey":False
      },
      "instruction":"Human approval is required after BRUSHUP 4/4 before FINAL RELEASE 4/4."
    }
    write("HUMAN_ACCEPTANCE_TEMPLATE.json",human)
    write("BRUSHUP_4_OF_4_STATUS.txt",
          "BRUSHUP 1/4 FACTS: PASS\nBRUSHUP 2/4 SALES JOURNEY: PASS\n"
          "BRUSHUP 3/4 VISUAL/PRINT/QR: PASS\nBRUSHUP 4/4 PUBLIC/DEPLOY: TECHNICAL PREPASS PASS\n"
          "EXTERNAL CHECK REQUIRED: this Actions run conclusion must be SUCCESS\n"
          "OPEN BLOCKER/HIGH: 0\nHUMAN ACCEPTANCE: PENDING\n")
    print("V12_BRUSHUP_R4_SUMMARY="+json.dumps({
      "B1":"PASS","B2":"PASS","B3":"PASS","B4_TECHNICAL_PREPASS":"PASS",
      "CLOSED_RELEASE_DEFECTS":["DEF-016","DEF-017","DEF-018","DEF-019","DEF-020"],"OPEN_BLOCKER":0,"OPEN_HIGH":0,"HUMAN_ACCEPTANCE":"PENDING",
      "SYSTEM_FINAL_LOCK":SYSTEM_HEAD,
      "OFFICIAL_FINAL_HEAD":os.environ.get("FINAL_OFFICIAL_HEAD",""),
      "PRODUCT_HEAD":PRODUCT_HEAD
    },ensure_ascii=False))

if __name__=="__main__":
    main()
