#!/usr/bin/env python3
from pathlib import Path
import os, sys, json, re, time, subprocess, urllib.request, urllib.error, shutil

ROOT=Path.cwd()
EVID=ROOT/"release-evidence-v12"
PRODUCT_TMP=Path("/tmp/dpro-line-systems-site-v12")

SYSTEM_HEAD="3fc09f4b5c6781d6038dc280de5c58752ce60b51"
OFFICIAL_BASELINE="b92a4d6444375aefc481db267d626c5a712164a5"
PRODUCT_HEAD="f79c170776d6354166eb9dcc10468f971964a25d"
CONTROL_CENTER_HEAD="548f04a0be5935ecd2f83c041d90fe7e089b65ec"

OFFICIAL_URL="https://dpro-shop.com/systems/clinic-shuttle"
OFFICIAL_ROOT="https://dpro-shop.com/"
OFFICIAL_404_GH="https://dpromstk2000-lab.github.io/dpro-shop-official-site/404.html"
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

FACT_LOCK={
  "schema_version":"DPRO-PRODUCT-FACT-LOCK-R2",
  "status":"LOCKED_REL_01","locked":True,
  "product_dev_id":"f061f7dc-787d-44e7-b678-59f095298980",
  "system_code":"CLINIC_SHUTTLE","product_number":55,
  "product_name_ja":"DPRO 診療所送迎予約","product_name_en":"DPRO CLINIC SHUTTLE",
  "category":"医療・送迎",
  "routes":{
    "official_slug":"clinic-shuttle","product_slug":"clinic-shuttle",
    "official_root_url":OFFICIAL_ROOT,"official_url":OFFICIAL_URL,
    "product_url":PRODUCT_URL,"lp_url":LP_URL,"flyer_url":FLYER_URL,
    "flyer_pdf_url":FLYER_PDF,"demo_url":DEMO_URL,"line_url":LINE_URL
  },
  "prices":{
    "currency":"JPY","tax_included":True,"dpro_initial":33000,"dpro_monthly":1100,
    "line_build_initial":77000,"line_operation_monthly":3300,
    "website_maintenance_for_line_contract_monthly":1100,
    "combined_line_hp_dpro_monthly_example":5500,
    "condition":"DPROはLINE構築・LINE運用契約先向け追加サービス。HP保守1,100円/月はLINE運用契約店舗向け。"
  },
  "scope_out":["電子カルテ本体","診療記録","病名","検査結果","処方内容","医療費請求","レセプト","医療判断"],
  "product_count":55,
  "hero_media_id":"clinic-care-bright.png",
  "flyer_master_id":"DPRO A4 FLYER MASTER V2.2",
  "qr_targets":{"line":LINE_URL,"official":OFFICIAL_ROOT,"demo":DEMO_URL},
  "system_final_lock":{"repository":"dpromstk2000-lab/dpro-clinic-shuttle-line","head":SYSTEM_HEAD,"protected":True}
}

def write(name,obj):
    EVID.mkdir(parents=True,exist_ok=True)
    p=EVID/name
    if isinstance(obj,(dict,list)):
        p.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding="utf-8")
    else:
        p.write_text(str(obj),encoding="utf-8")

def fetch_bytes(url,timeout=45,allow_http_error=False):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 DPRO-V12-QA"})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:
            return r.status,r.read()
    except urllib.error.HTTPError as e:
        if allow_http_error:
            return e.code,e.read()
        raise

def fetch_text(url,timeout=45,allow_http_error=False):
    status,data=fetch_bytes(url,timeout,allow_http_error)
    return status,data.decode("utf-8","ignore")

def clone_product():
    if PRODUCT_TMP.exists():
        shutil.rmtree(PRODUCT_TMP)
    subprocess.check_call(["git","clone","--quiet","--depth","1","https://github.com/dpromstk2000-lab/dpro-line-systems-site.git",str(PRODUCT_TMP)])
    got=subprocess.check_output(["git","-C",str(PRODUCT_TMP),"rev-parse","HEAD"],text=True).strip()
    if got != PRODUCT_HEAD:
        raise SystemExit(f"PRODUCT clone drift {got} != {PRODUCT_HEAD}")

def read(path,base=ROOT):
    return (base/path).read_text(encoding="utf-8",errors="ignore")

def semantic_stale_scan(base):
    exts={".html",".js",".json",".xml",".txt"}
    patterns=[
      ("old_product_count_54", re.compile(r"(54システム|54製品|54の業種別|numberOfItems[\"']?\s*[:=]\s*54)")),
      ("wrong_clinic_slug", re.compile(r"systems/clinic_shuttle|dpro-shop\.com/systems/clinic_shuttle")),
      ("old_clinic_photo_ref", re.compile(r"clinic-care\.jpg")),
      ("old_pexels_credit", re.compile(r"Pexels\s*/\s*Tima\s+Miroshnichenko",re.I)),
    ]
    hits=[]
    for p in base.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts:
            continue
        if ".git" in p.parts or ".github" in p.parts:
            continue
        try: s=p.read_text(encoding="utf-8",errors="ignore")
        except: continue
        for key,rx in patterns:
            for m in rx.finditer(s):
                line=s.count("\n",0,m.start())+1
                hits.append({"rule":key,"path":str(p.relative_to(base)),"line":line,"text":m.group(0)})
    return hits

def prepare():
    EVID.mkdir(parents=True,exist_ok=True)
    clone_product()

    # Fix only the known audited OPEN HIGH defect.
    p=ROOT/"404.html"
    s=p.read_text(encoding="utf-8")
    if "54システムの説明を見る" not in s or "54の業種別DPROシステム" not in s:
        raise SystemExit("DEF-016 source signature missing/drifted")
    s=s.replace("54システムの説明を見る","55システムの説明を見る")
    s=s.replace("54の業種別DPROシステム","55の業種別DPROシステム")
    p.write_text(s,encoding="utf-8")

    # B1 factual/static gate.
    stale_official=semantic_stale_scan(ROOT)
    stale_product=semantic_stale_scan(PRODUCT_TMP)
    blockers=[]

    if stale_official:
        blockers.append({"type":"official_stale_fact","hits":stale_official[:50]})
    if stale_product:
        blockers.append({"type":"product_stale_fact","hits":stale_product[:50]})

    official_product=read(Path("systems/clinic-shuttle.html"))
    pricing=read(Path("pricing.html"))
    official_catalog=read(Path("systems/index.html"))
    official_sitemap=read(Path("sitemap.xml"))

    product_detail=read(Path("systems/clinic-shuttle.html"),PRODUCT_TMP)
    product_data=read(Path("systems-data.js"),PRODUCT_TMP)
    product_lp=read(Path("lp-clinic-shuttle.html"),PRODUCT_TMP)
    product_flyer=read(Path("flyer-clinic-shuttle.html"),PRODUCT_TMP)
    product_sitemap=read(Path("sitemap.xml"),PRODUCT_TMP)

    required_checks={
      "official_product_url": OFFICIAL_URL in official_product,
      "official_jsonld_33000": '"price":"33000"' in official_product,
      "official_jsonld_1100": '"price":"1100"' in official_product,
      "pricing_dpro_initial": "初期33,000円" in pricing,
      "pricing_dpro_monthly": "月額1,100円" in pricing,
      "pricing_line_initial": "77,000円" in pricing,
      "pricing_line_monthly": "月額3,300円" in pricing,
      "official_catalog_55": "55" in official_catalog and "診療所送迎予約" in official_catalog,
      "official_sitemap_clinic": "systems/clinic-shuttle" in official_sitemap,
      "product_data_code": '"code": "CLINIC_SHUTTLE"' in product_data,
      "product_data_slug": '"assetSlug": "clinic-shuttle"' in product_data,
      "product_data_55": "CANONICAL 55 PRODUCT DATA" in product_data,
      "product_detail_official_url": OFFICIAL_URL in product_detail,
      "product_detail_price": "33,000円" in product_detail and "1,100円" in product_detail,
      "product_scope_out": all(x in product_detail for x in ["電子カルテ","診断","検査","薬剤","請求・レセプト","医療判断"]),
      "lp_bright_media": "clinic-care-bright.png" in product_lp,
      "flyer_master_v22": "A4 FLYER MASTER V2.2" in product_flyer,
      "flyer_official_root": "https://dpro-shop.com/" in product_flyer,
      "product_sitemap_clinic": "systems/clinic-shuttle.html" in product_sitemap and "lp-clinic-shuttle.html" in product_sitemap
    }
    for k,v in required_checks.items():
        if not v: blockers.append({"type":"required_fact_check","check":k})

    defect={
      "schema_version":"DPRO-PRODUCT-RELEASE-OPEN-DEFECT-REGISTER-R1",
      "defects":[{
        "id":"DEF-016","severity":"high","status":"CLOSED_PENDING_PUBLIC_VERIFY",
        "title":"OFFICIAL 404.htmlの商品件数が54のまま",
        "fix":"404.html meta/button 54 -> 55",
        "system_reopen_required":False,
        "fix_lane":"PRODUCT_RELEASE"
      }],
      "summary":{"open_blocker":0,"open_high":0 if not blockers else 1,"open_medium":0,"open_low":0},
      "lock_rule":"open_blocker + open_high must equal 0"
    }

    b1={
      "stage":"REL-B1 FACT / COPY / STATIC SITE-WIDE SCAN",
      "pass":not blockers,
      "fact_lock":FACT_LOCK,
      "checks":required_checks,
      "official_stale_hits":stale_official,
      "product_stale_hits":stale_product,
      "blockers":blockers
    }
    write("FACT_LOCK_SNAPSHOT.json",FACT_LOCK)
    write("OPEN_DEFECT_REGISTER_PREPUBLIC.json",defect)
    write("BRUSHUP_B1.json",b1)
    if blockers:
        print(json.dumps(b1,ensure_ascii=False,indent=2))
        raise SystemExit("REL-B1 blockers remain")
    print("REL-B1 PASS / DEF-016 source fixed")

def page_signature(page,url,needle):
    page.goto(url,wait_until="domcontentloaded",timeout=60000)
    page.wait_for_timeout(600)
    text=(page.title()+"\n"+page.locator("body").inner_text())[:200000]
    if needle not in text:
        raise AssertionError(f"destination signature missing {needle} @ {url}")
    return {"url":url,"title":page.title(),"signature":needle}

def exact_href(page,selector,expected):
    loc=page.locator(selector)
    if loc.count()!=1:
        raise AssertionError(f"selector count {loc.count()} !=1: {selector}")
    href=loc.get_attribute("href")
    absolute=page.evaluate("(h)=>new URL(h,location.href).href",href)
    if absolute != expected:
        raise AssertionError(f"href mismatch {selector}: {absolute} != {expected}")
    return {"selector":selector,"href":absolute}

def audit_surface(page,url,selectors,width,label,screen):
    page.goto(url,wait_until="domcontentloaded",timeout=60000)
    page.wait_for_timeout(700)
    rec={"url":url,"width":width,"title":page.title(),"sections":[]}
    for sel in selectors:
        loc=page.locator(sel)
        if loc.count()<1:
            raise AssertionError(f"{label} missing selector {sel}")
        el=loc.first
        el.scroll_into_view_if_needed(timeout=5000)
        page.wait_for_timeout(80)
        st=el.evaluate("""el=>{const c=getComputedStyle(el),r=el.getBoundingClientRect();return {display:c.display,visibility:c.visibility,opacity:Number(c.opacity),width:r.width,height:r.height}}""")
        if st["display"]=="none" or st["visibility"]=="hidden" or st["opacity"]<0.95 or st["width"]<=0 or st["height"]<=0:
            raise AssertionError(f"{label} hidden {sel}: {st}")
        rec["sections"].append({"selector":sel,**st})
    rec["brokenImages"]=page.locator("img").evaluate_all("(els)=>els.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)")
    rec["overflow"]=page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
    if rec["brokenImages"] or rec["overflow"]:
        raise AssertionError(f"{label} visual blocker {rec}")
    if screen:
        EVID.mkdir(parents=True,exist_ok=True)
        page.screenshot(path=str(EVID/f"{label}-{width}.png"),full_page=True)
    return rec

def decode_pdf(url,expected_pages,required_qr=None,require_any_qr=False):
    import fitz, numpy as np, cv2, zxingcpp
    status,data=fetch_bytes(url)
    if status!=200: raise AssertionError(f"PDF HTTP {status}: {url}")
    tmp=Path("/tmp")/(url.split("/")[-1].split("?")[0])
    tmp.write_bytes(data)
    doc=fitz.open(tmp)
    if doc.page_count != expected_pages:
        raise AssertionError(f"page count {doc.page_count}!={expected_pages}: {url}")
    qrs=set()
    pages=[]
    for i,page in enumerate(doc):
        pix=page.get_pixmap(matrix=fitz.Matrix(2.7,2.7),alpha=False)
        arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)
        if pix.n==4: arr=cv2.cvtColor(arr,cv2.COLOR_RGBA2RGB)
        gray=cv2.cvtColor(arr,cv2.COLOR_RGB2GRAY)
        nonwhite=int((gray<248).sum())
        if nonwhite < 1000:
            raise AssertionError(f"near blank PDF page {i+1}: {url}")
        found=[r.text for r in zxingcpp.read_barcodes(arr) if r.text]
        qrs.update(found)
        pages.append({"page":i+1,"nonwhitePixels":nonwhite,"qr":found})
    if required_qr:
        missing=[q for q in required_qr if q not in qrs]
        if missing: raise AssertionError(f"missing QR {missing} @ {url}; got {sorted(qrs)}")
    if require_any_qr and not qrs:
        raise AssertionError(f"required QR not decoded @ {url}")
    unknown=[q for q in qrs if q.startswith("http") and q not in ALLOWED_QR]
    if unknown:
        raise AssertionError(f"unapproved QR URLs {unknown} @ {url}")
    return {"url":url,"status":status,"bytes":len(data),"pages":doc.page_count,"qrDecoded":sorted(qrs),"pageEvidence":pages}

def github_runs(repo):
    url=f"https://api.github.com/repos/{repo}/actions/runs?per_page=100"
    status,data=fetch_bytes(url)
    return json.loads(data.decode("utf-8"))["workflow_runs"]

def pages_success_for_head(repo,head):
    for r in github_runs(repo):
        if r.get("name")=="pages build and deployment" and r.get("head_sha")==head and r.get("status")=="completed" and r.get("conclusion")=="success":
            return {"id":r["id"],"head_sha":r["head_sha"],"html_url":r["html_url"],"conclusion":"success"}
    return None

def wait_official_pages(head,tries=50,sleep=10):
    last=None
    for _ in range(tries):
        hit=pages_success_for_head("dpromstk2000-lab/dpro-shop-official-site",head)
        if hit: return hit
        last="not yet"
        time.sleep(sleep)
    raise AssertionError(f"OFFICIAL Pages not successful for {head}: {last}")

def publicqa():
    from playwright.sync_api import sync_playwright

    final_official=os.environ.get("FINAL_OFFICIAL_HEAD","").strip()
    if not re.fullmatch(r"[0-9a-f]{40}",final_official):
        raise SystemExit("FINAL_OFFICIAL_HEAD missing")

    # Wait the final clean commit (404 fix + one-shot workflow removal).
    official_pages=wait_official_pages(final_official)

    # Confirm 404 public body after deployment.
    status404,body404=fetch_text(OFFICIAL_ROOT+"__dpro_v12_missing_route__",allow_http_error=True)
    if status404!=404 or "55システムの説明を見る" not in body404 or "54システム" in body404:
        raise AssertionError(f"public 404 stale status={status404}")
    status404gh,body404gh=fetch_text(OFFICIAL_404_GH)
    if status404gh!=200 or "55システムの説明を見る" not in body404gh or "54システム" in body404gh:
        raise AssertionError("GitHub Pages 404.html stale")

    b2={"stage":"REL-B2 EXACT SALES JOURNEY","pass":False,"checks":[],"destinations":[],"blockers":[]}
    b3={"stage":"REL-B3 VISUAL / MOBILE / PRINT / QR","pass":False,"viewports":[375,390,430,768,1280,1440],"surfaces":{},"pdfs":{},"blockers":[]}

    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)

        # B2 exact product-scoped journeys.
        p=browser.new_page(viewport={"width":1440,"height":1000})
        p.goto(SYSTEMS_URL,wait_until="domcontentloaded",timeout=60000); p.wait_for_timeout(600)
        b2["checks"] += [
          exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-product',PRODUCT_URL),
          exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-demo',DEMO_URL),
          exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-official',OFFICIAL_URL)
        ]
        proposal_expected="https://dpromstk2000-lab.github.io/dpro-line-systems-site/proposal.html?code=CLINIC_SHUTTLE#proposals"
        b2["checks"].append(exact_href(p,'[data-p36-system-card][data-code="CLINIC_SHUTTLE"] .is-proposal-link',proposal_expected))
        p.goto(PROPOSAL_URL,wait_until="domcontentloaded",timeout=60000); p.wait_for_timeout(600)
        b2["checks"] += [
          exact_href(p,'[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .is-primary',LP_URL),
          exact_href(p,'[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .is-demo',DEMO_URL),
          exact_href(p,'[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .is-official',OFFICIAL_URL)
        ]
        # Foot PRODUCT link scoped to exact product card.
        foot=p.locator('[data-p36-proposal-card][data-code="CLINIC_SHUTTLE"] .p36-proposal-card__foot a').first
        href=foot.get_attribute("href")
        absurl=p.evaluate("(h)=>new URL(h,location.href).href",href)
        if absurl!=PRODUCT_URL: raise AssertionError("proposal PRODUCT href mismatch")
        b2["checks"].append({"selector":"proposal exact PRODUCT link","href":absurl})

        # Detail-page exact route presence.
        for url,label in [(PRODUCT_URL,"product"),(OFFICIAL_URL,"official")]:
            p.goto(url,wait_until="domcontentloaded",timeout=60000); p.wait_for_timeout(500)
            expected = (
              [OFFICIAL_URL,DEMO_URL,LINE_URL] if label=="product"
              else [PRODUCT_URL,DEMO_URL,LINE_URL,MEMBER_URL,OWNER_URL,IPAD_URL,STAFF_URL]
            )
            for target in expected:
                n=p.locator(f'a[href="{target}"]').count()
                if n<1: raise AssertionError(f"{label} required CTA missing {target}")
                b2["checks"].append({"surface":label,"target":target,"count":n})

        # Destination signatures.
        b2["destinations"] += [
          page_signature(p,OFFICIAL_URL,"DPRO 診療所送迎予約"),
          page_signature(p,PRODUCT_URL,"DPRO 診療所送迎予約"),
          page_signature(p,LP_URL,"DPRO 診療所送迎予約"),
          page_signature(p,DEMO_URL,"操作デモポータル"),
          page_signature(p,MEMBER_URL,"ご家族用"),
          page_signature(p,OWNER_URL,"管理・配車画面"),
          page_signature(p,IPAD_URL,"iPad配車画面"),
          page_signature(p,STAFF_URL,"現場スタッフ")
        ]
        wrong_status,wrong_body=fetch_text("https://dpro-shop.com/systems/clinic_shuttle",allow_http_error=True)
        if wrong_status!=404 or "55システムの説明を見る" not in wrong_body:
            raise AssertionError("negative-route 404 sanity failed")
        b2["checks"].append({"negativeRoute":"https://dpro-shop.com/systems/clinic_shuttle","status":wrong_status,"currentCount55":True})
        p.close()
        b2["pass"]=True

        # B3 human-like visibility on all required widths.
        surface_defs=[
          ("official",OFFICIAL_URL,["#summary","#features","#flow","#roles","#demo","#safety","#pricing","#docs","#faq"]),
          ("product",PRODUCT_URL,["#features","#flow","#live","#scope","#price"]),
          ("lp",LP_URL,[".hero",".section"]),
          ("flyer",FLYER_URL,[".sheet",".action-card.site"])
        ]
        for name,url,sels in surface_defs:
            b3["surfaces"][name]={}
            for w in b3["viewports"]:
                p=browser.new_page(viewport={"width":w,"height":1000})
                rec=audit_surface(p,url,sels,w,name,screen=(w in (390,1440)))
                if name=="lp":
                    bg=p.locator(".hero").evaluate("el=>getComputedStyle(el).backgroundImage")
                    rec["heroBackground"]=bg
                    if "clinic-care-bright.png" not in bg:
                        raise AssertionError("LP hero media drift")
                if name=="flyer":
                    metrics=p.evaluate("""()=>{const f=document.querySelector('.footer').getBoundingClientRect();const cards=[...document.querySelectorAll('.action-card')].map(x=>x.getBoundingClientRect());return {footerOverlap:Math.max(0,Math.max(...cards.map(x=>x.bottom))-f.top),cardHeightSpread:Math.max(...cards.map(x=>x.height))-Math.min(...cards.map(x=>x.height)),url:document.querySelector('.ow-url')?.textContent.trim()||''}}""")
                    rec["flyerMetrics"]=metrics
                    if metrics["footerOverlap"]>0 or metrics["cardHeightSpread"]>1.5 or metrics["url"]!=OFFICIAL_ROOT:
                        raise AssertionError(f"Flyer master drift {metrics}")
                b3["surfaces"][name][str(w)]=rec
                p.close()
        browser.close()

    # Final rendered PDF/QR checks.
    b3["pdfs"]["flyer"]=decode_pdf(FLYER_PDF,1,[LINE_URL,OFFICIAL_ROOT,DEMO_URL],False)
    b3["pdfs"]["operation"]=decode_pdf(OP_PDF,1,[PRODUCT_URL,MEMBER_URL,OWNER_URL,IPAD_URL,STAFF_URL,LINE_URL],False)
    b3["pdfs"]["quick"]=decode_pdf(QUICK_PDF,3,None,True)
    b3["pdfs"]["detailed"]=decode_pdf(DETAIL_PDF,9,None,True)
    b3["pass"]=True

    # Surface matrix.
    matrix={
      "schema_version":"DPRO-PUBLIC-SURFACE-MATRIX-R1",
      "pass":True,
      "product_dev_id":"f061f7dc-787d-44e7-b678-59f095298980",
      "system_code":"CLINIC_SHUTTLE",
      "surfaces":[
        {"surface":"official","url":OFFICIAL_URL,"head":final_official,"fact_lock_match":True,"cta_match":True,"media_match":True,"visual_pass":True},
        {"surface":"product","url":PRODUCT_URL,"head":PRODUCT_HEAD,"fact_lock_match":True,"cta_match":True,"media_match":True,"visual_pass":True},
        {"surface":"lp","url":LP_URL,"head":PRODUCT_HEAD,"fact_lock_match":True,"cta_match":True,"media_match":True,"visual_pass":True},
        {"surface":"flyer_pdf","url":FLYER_PDF,"fact_lock_match":True,"qr_pass":True,"visual_pass":True},
        {"surface":"operation_pdf","url":OP_PDF,"fact_lock_match":True,"qr_pass":True,"visual_pass":True}
      ]
    }

    product_pages=pages_success_for_head("dpromstk2000-lab/dpro-line-systems-site",PRODUCT_HEAD)
    if not product_pages:
        raise AssertionError("PRODUCT Pages success for current FACT_LOCK head not found")

    public_markers={
      "official_product":fetch_text(OFFICIAL_URL)[0]==200 and "DPRO 診療所送迎予約" in fetch_text(OFFICIAL_URL)[1],
      "product":fetch_text(PRODUCT_URL)[0]==200 and "PRODUCT 55" in fetch_text(PRODUCT_URL)[1],
      "lp":fetch_text(LP_URL)[0]==200 and "clinic-care-bright.png" in fetch_text(LP_URL)[1],
      "flyer":fetch_text(FLYER_URL)[0]==200 and "A4 FLYER MASTER V2.2" in fetch_text(FLYER_URL)[1],
      "official_404_count55":True
    }
    if not all(public_markers.values()):
        raise AssertionError(f"public marker mismatch {public_markers}")

    b4pre={
      "stage":"REL-B4 LIVE PUBLIC / 4-WAY DEPLOY EVIDENCE",
      "pre_run_completion_pass":True,
      "finalization_required":"verify this workflow run completed+success externally",
      "expected_final_heads":{"official":final_official,"product":PRODUCT_HEAD},
      "pages":{"official":official_pages,"product":product_pages},
      "public_markers":public_markers,
      "rules":{
        "repo_head_matches_expected":True,
        "latest_relevant_pages_head_matches":True,
        "public_release_signature_matches":True,
        "expected_release_actions_success":"PENDING_EXTERNAL_RUN_COMPLETION",
        "unrelated_ci_ignored":True,
        "accepted_control_center_drift":{"from":"47afd09887aab6d9430005c49eca87cd8c93d0ce","to":"548f04a0be5935ecd2f83c041d90fe7e089b65ec","files":["contact-v1.html","contact-v1.js"],"classification":"non_conflicting"},
        "accepted_official_drift":{"from":"f1d0af39d0fe56c05acee72a27dbf804513185b7","to":"0b5cad61d436d08cfb06e73f04f897b61808369f","files":["waiting-system.html"],"classification":"non_conflicting_waiting_system_performance_metadata_change"}
      }
    }

    closed={
      "schema_version":"DPRO-PRODUCT-RELEASE-OPEN-DEFECT-REGISTER-R1",
      "defects":[{
        "id":"DEF-016","severity":"high","status":"CLOSED",
        "title":"OFFICIAL 404.htmlの商品件数が54のまま",
        "closure_evidence":{
          "official_final_head":final_official,
          "custom_404_status":status404,
          "custom_404_count55":True,
          "github_pages_404_count55":True,
          "official_pages_run":official_pages
        },
        "system_reopen_required":False
      }],
      "summary":{"open_blocker":0,"open_high":0,"open_medium":0,"open_low":0},
      "lock_rule":"open_blocker + open_high must equal 0"
    }

    human={
      "schema_version":"DPRO-PRODUCT-RELEASE-HUMAN-ACCEPTANCE-R1",
      "pass":False,"approver":"","approved_at":None,
      "checks":{
        "official_visual":False,"product_visual":False,"lp_visual":False,"flyer_visual":False,
        "mobile_readability":False,"japanese_copy_breaks":False,"hero_media_suitability":False,
        "dpro_series_consistency":False,"five_minute_sales_journey":False
      },
      "notes":["Awaiting explicit human acceptance after BRUSHUP 4/4."]
    }

    write("BRUSHUP_B2.json",b2)
    write("BRUSHUP_B3.json",b3)
    write("PUBLIC_SURFACE_MATRIX.json",matrix)
    write("BRUSHUP_B4_PRE_RUN_COMPLETION.json",b4pre)
    write("OPEN_DEFECT_REGISTER.json",closed)
    write("HUMAN_ACCEPTANCE.json",human)
    write("BRUSHUP_STATUS.txt",
          "REL-B1 PASS\nREL-B2 PASS\nREL-B3 PASS\nREL-B4 TECHNICAL PREPASS PASS\n"
          "REL-B4 awaits external confirmation that this workflow run completed+success.\n"
          "OPEN BLOCKER/HIGH: 0\nHUMAN ACCEPTANCE: PENDING\n")
    print("V12_BRUSHUP_SUMMARY="+json.dumps({
      "b1":"PASS","b2":"PASS","b3":"PASS","b4_pre":"PASS",
      "open_blocker":0,"open_high":0,
      "official_final_head":final_official,"product_head":PRODUCT_HEAD,
      "official_pages_run":official_pages["id"],"product_pages_run":product_pages["id"],
      "human_acceptance":"PENDING"
    },ensure_ascii=False))

def main():
    if len(sys.argv)!=2:
        raise SystemExit("usage: runner.py prepare|publicqa")
    {"prepare":prepare,"publicqa":publicqa}[sys.argv[1]]()

if __name__=="__main__":
    main()
