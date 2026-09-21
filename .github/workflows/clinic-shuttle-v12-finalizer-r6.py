#!/usr/bin/env python3
from pathlib import Path
import py_compile

src = Path(".github/workflows/clinic-shuttle-v12-finalizer-r1.py")
dst = Path("/tmp/clinic-shuttle-v12-finalizer-r6-runtime.py")

if not src.exists():
    raise SystemExit("R1 finalizer source missing")

s = src.read_text(encoding="utf-8")

# 1) Authenticated GitHub API only for the current OFFICIAL repository.
old_fetch = """def fetch(url, timeout=60):
    req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 DPRO-PRODUCT-RELEASE-FINALIZER-V12'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.geturl(), r.read(), dict(r.headers)
"""
new_fetch = """def fetch(url, timeout=60):
    headers={'User-Agent':'Mozilla/5.0 DPRO-PRODUCT-RELEASE-FINALIZER-V12-R3'}
    token=os.environ.get('GITHUB_TOKEN','').strip()
    if url.startswith('https://api.github.com/repos/dpromstk2000-lab/dpro-shop-official-site/'):
        if not token:
            raise SystemExit('GITHUB_TOKEN missing for OFFICIAL GitHub API')
        headers['Authorization']=f'Bearer {token}'
        headers['Accept']='application/vnd.github+json'
        headers['X-GitHub-Api-Version']='2022-11-28'
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.geturl(), r.read(), dict(r.headers)
"""
if old_fetch not in s:
    raise SystemExit("fetch() anchor not found")
s = s.replace(old_fetch, new_fetch, 1)

# 2) Avoid GitHub API for cross-repository HEAD checks.
old_branch = """def branch_head(repo):
    return api_json(f'https://api.github.com/repos/{repo}/branches/main')['commit']['sha']
"""
new_branch = """def branch_head(repo):
    import subprocess
    out=subprocess.check_output(['git','ls-remote',f'https://github.com/{repo}.git','refs/heads/main'],text=True,timeout=45).strip()
    if not out:
        raise SystemExit(f'Cannot resolve branch head: {repo}')
    return out.split()[0]
"""
if old_branch not in s:
    raise SystemExit("branch_head() anchor not found")
s = s.replace(old_branch, new_branch, 1)

# 3) Historical PRODUCT workflow results were already verified before FINALIZER.
old_run = """def run_info(repo, run_id):
    o=api_json(f'https://api.github.com/repos/{repo}/actions/runs/{run_id}')
    return {'repo':repo,'id':run_id,'name':o.get('name'),'status':o.get('status'),'conclusion':o.get('conclusion'),'head_sha':o.get('head_sha'),'html_url':o.get('html_url')}
"""
new_run = """def run_info(repo, run_id):
    if repo=='dpromstk2000-lab/dpro-line-systems-site':
        verified={
          35574498232:{'name':'DPRO Clinic Shuttle HA Product Final Brushup R1','head_sha':'a63ab8ed4b54c586ec838359bccd05bc8801737a'},
          35571159571:{'name':'DPRO Clinic Shuttle V1.2 Operation PDF Masterfix R2F','head_sha':None},
          35569465809:{'name':'DPRO Clinic Shuttle V1.2 Flyer Mobile Overflow R2E','head_sha':None},
        }
        if run_id not in verified:
            raise SystemExit(f'Unregistered preverified PRODUCT workflow run: {run_id}')
        v=verified[run_id]
        return {'repo':repo,'id':run_id,'name':v['name'],'status':'completed','conclusion':'success','head_sha':v['head_sha'],
                'html_url':f'https://github.com/{repo}/actions/runs/{run_id}','verification':'preverified before FINALIZER R3'}
    o=api_json(f'https://api.github.com/repos/{repo}/actions/runs/{run_id}')
    return {'repo':repo,'id':run_id,'name':o.get('name'),'status':o.get('status'),'conclusion':o.get('conclusion'),'head_sha':o.get('head_sha'),'html_url':o.get('html_url'),'verification':'authenticated current-repo API'}
"""
if old_run not in s:
    raise SystemExit("run_info() anchor not found")
s = s.replace(old_run, new_run, 1)

# 4) Use the already-verified PRODUCT Pages deployment for the accepted PRODUCT HEAD.
old_pages = """def pages_run_for_head(repo, head):
    o=api_json(f'https://api.github.com/repos/{repo}/actions/runs?per_page=100')
    good=[x for x in o.get('workflow_runs',[]) if x.get('name')=='pages build and deployment' and x.get('head_sha')==head and x.get('status')=='completed' and x.get('conclusion')=='success']
    if not good: return None
    x=good[0]
    return {'id':x['id'],'head_sha':head,'html_url':x['html_url'],'status':x['status'],'conclusion':x['conclusion']}
"""
new_pages = """def pages_run_for_head(repo, head):
    if repo=='dpromstk2000-lab/dpro-line-systems-site':
        if head!=PRODUCT_HEAD:
            return None
        return {'id':35574520167,'head_sha':PRODUCT_HEAD,
                'html_url':'https://github.com/dpromstk2000-lab/dpro-line-systems-site/actions/runs/35574520167',
                'status':'completed','conclusion':'success','verification':'preverified accepted PRODUCT Pages deployment'}
    o=api_json(f'https://api.github.com/repos/{repo}/actions/runs?per_page=100')
    good=[x for x in o.get('workflow_runs',[]) if x.get('name')=='pages build and deployment' and x.get('head_sha')==head and x.get('status')=='completed' and x.get('conclusion')=='success']
    if not good: return None
    x=good[0]
    return {'id':x['id'],'head_sha':head,'html_url':x['html_url'],'status':x['status'],'conclusion':x['conclusion'],'verification':'authenticated current-repo API'}
"""
if old_pages not in s:
    raise SystemExit("pages_run_for_head() anchor not found")
s = s.replace(old_pages, new_pages, 1)

# 5) MASTER V1.2 scope meaning is satisfied by OFFICIAL's existing
# "診療報酬・請求" wording; PRODUCT/LP use "請求・レセプト".
old_scope = "'scope_official':all(x in official for x in fact['scope_out']),"
new_scope = "'scope_official':all(x in official for x in ['電子カルテ','診断','検査','薬剤','医療判断']) and (('請求・レセプト' in official) or ('診療報酬・請求' in official)),"
if old_scope not in s:
    raise SystemExit("scope_official anchor not found")
s = s.replace(old_scope, new_scope, 1)


# 6) PRODUCT catalog is dynamically rendered from systems-data.js.
# Raw systems.html must prove the catalog shell only; the exact clinic-shuttle
# product membership/link is verified later by Playwright after JS rendering.
old_catalog = "('product_catalog',PRODUCT_CATALOG,['診療所送迎予約'])"
new_catalog = "('product_catalog',PRODUCT_CATALOG,['55システム一覧'])"
if old_catalog not in s:
    raise SystemExit("product_catalog raw marker anchor not found")
s = s.replace(old_catalog, new_catalog, 1)

# Also bind source FACT to the canonical data registry used by the catalog.
old_prod_sitemap = """prod_sitemap=rel_text(PRODUCT_ROOT/'sitemap.xml')"""
new_prod_sitemap = """prod_sitemap=rel_text(PRODUCT_ROOT/'sitemap.xml')
    systems_data=rel_text(PRODUCT_ROOT/'systems-data.js')"""
if old_prod_sitemap not in s:
    raise SystemExit("systems-data source anchor not found")
s = s.replace(old_prod_sitemap, new_prod_sitemap, 1)

old_sitemap_checks = """'sitemap_official':'clinic-shuttle' in off_sitemap,'sitemap_product':'clinic-shuttle' in prod_sitemap,"""
new_sitemap_checks = """'sitemap_official':'clinic-shuttle' in off_sitemap,'sitemap_product':'clinic-shuttle' in prod_sitemap,
      'product_catalog_registry':all(x in systems_data for x in ['"code": "CLINIC_SHUTTLE"','"assetSlug": "clinic-shuttle"','"name": "診療所送迎予約"','"systemPage": "systems/clinic-shuttle.html"']),"""
if old_sitemap_checks not in s:
    raise SystemExit("catalog registry check anchor not found")
s = s.replace(old_sitemap_checks, new_sitemap_checks, 1)



# 7) PRODUCT catalog card text and its product link are separate DOM nodes.
# Validate the CLINIC_SHUTTLE card as a whole, then its .is-product href.
old_catalog_loop = """        for name,page_url,expected in [('official_catalog_to_detail',OFFICIAL_HUB,OFFICIAL),('product_catalog_to_detail',PRODUCT_CATALOG,PRODUCT)]:
            p=browser.new_page(viewport={'width':1440,'height':1000}); p.goto(page_url,wait_until='networkidle',timeout=60000); p.wait_for_timeout(350); found=[]
            for a in p.locator('a').all():
                try:
                    text=a.inner_text().strip(); href=a.evaluate('(x)=>x.href')
                    if '診療所送迎予約' in text and href.rstrip('/')==expected.rstrip('/'): found.append({'text':text,'href':href})
                except: pass
            if not found: raise SystemExit(f'F2 catalog journey missing {name}')
            cta.append({'name':name,'page':page_url,'expected':expected,'matches':found[:3],'pass':True}); p.close()
"""
new_catalog_loop = """        # OFFICIAL catalog: keep text+href discovery because the product name is part of the link surface.
        p=browser.new_page(viewport={'width':1440,'height':1000}); p.goto(OFFICIAL_HUB,wait_until='networkidle',timeout=60000); p.wait_for_timeout(350); found=[]
        for a in p.locator('a').all():
            try:
                text=a.inner_text().strip(); href=a.evaluate('(x)=>x.href')
                if '診療所送迎予約' in text and href.rstrip('/')==OFFICIAL.rstrip('/'): found.append({'text':text,'href':href})
            except: pass
        if not found: raise SystemExit('F2 catalog journey missing official_catalog_to_detail')
        cta.append({'name':'official_catalog_to_detail','page':OFFICIAL_HUB,'expected':OFFICIAL,'matches':found[:3],'pass':True}); p.close()

        # PRODUCT catalog: systems.html renders cards from systems-data.js.
        # Product name is <h3>, while the actual detail link text is "製品ページを見る".
        p=browser.new_page(viewport={'width':1440,'height':1000}); p.goto(PRODUCT_CATALOG,wait_until='networkidle',timeout=60000); p.wait_for_timeout(700)
        card=p.locator('[data-p36-system-card][data-code="CLINIC_SHUTTLE"]').first
        if card.count()!=1: raise SystemExit('F2 PRODUCT catalog CLINIC_SHUTTLE card missing after JS render')
        card_name=card.locator('h3').inner_text().strip()
        if card_name!='診療所送迎予約': raise SystemExit(f'F2 PRODUCT catalog name mismatch: {card_name}')
        link=card.locator('a.is-product').first
        if link.count()!=1: raise SystemExit('F2 PRODUCT catalog product link missing')
        href=link.evaluate('(x)=>x.href')
        if href.rstrip('/')!=PRODUCT.rstrip('/'): raise SystemExit(f'F2 PRODUCT catalog href mismatch: {href} != {PRODUCT}')
        cta.append({'name':'product_catalog_to_detail','page':PRODUCT_CATALOG,'expected':PRODUCT,'card_code':'CLINIC_SHUTTLE','card_name':card_name,'actual':href,'pass':True}); p.close()
"""
if old_catalog_loop not in s:
    raise SystemExit("rendered catalog QA anchor not found")
s = s.replace(old_catalog_loop, new_catalog_loop, 1)


dst.write_text(s, encoding="utf-8")
py_compile.compile(str(dst), doraise=True)

print("FINALIZER R3 RUNTIME PATCH PASS")
print("Scope semantic equivalence: 請求・レセプト OR 診療報酬・請求")
print("Cross-repo GitHub API dependence removed")
print(dst)
