(() => {
  "use strict";
  const PRODUCT_BASE = "https://dpromstk2000-lab.github.io/dpro-line-systems-site/";
  const LINE_URL = "https://lin.ee/YxJGXV6D";
  const exceptions = {vet:"pet-care.html",hair:"hair-salon.html",shuttle:"welfare-shuttle.html"};
  const currentSlug = () => {
    const parts = location.pathname.replace(/\/$/,"").split("/");
    const last = parts.pop() || "";
    return last.replace(/\.html$/i,"");
  };
  const productDetailUrl = () => {
    const slug=currentSlug();
    if (!slug || slug==="systems" || slug==="index") return PRODUCT_BASE;
    return `${PRODUCT_BASE}systems/${exceptions[slug] || `${slug}.html`}`;
  };
  const ensureV33Css = () => {
    if (document.querySelector('link[href*="systems-v3.3.css"]')) return;
    const link=document.createElement("link"); link.rel="stylesheet"; link.href="systems-v3.3.css?v=3.3"; document.head.appendChild(link);
  };
  const sharedHeader = () => `<header class="v33sys-header" id="v33sys-top"><div class="v33sys-header__inner"><a class="v33sys-brand" href="../"><span>D</span><div><strong>DPRO SHOP</strong><small>OFFICIAL SITE</small></div></a><button class="v33sys-menu" type="button" aria-expanded="false" aria-controls="v33sys-nav" aria-label="メニューを開く"><i></i><i></i><i></i></button><nav class="v33sys-nav" id="v33sys-nav"><a href="../line-build">LINE構築</a><a href="../line-operation">LINE運用</a><a href="../website">HP制作</a><a href="./">DPROシステム</a><a href="../pricing">料金</a><a href="../about">DPRO SHOP</a><a class="v33sys-nav__product" href="${productDetailUrl()}" target="_blank" rel="noopener">PRODUCT SITE / 実際に触る ↗</a><a class="v33sys-nav__cta" href="${LINE_URL}" target="_blank" rel="noopener">LINEで無料相談</a></nav></div></header>`;
  const sharedFooter = () => `<footer class="v33sys-footer"><div class="sys33-shell v33sys-footer__grid"><div><a class="v33sys-brand" href="../"><span>D</span><div><strong>DPRO SHOP</strong><small>OFFICIAL SITE</small></div></a><p>青で詳しく理解し、赤で実際に触る。</p></div><div><strong>OFFICIAL</strong><a href="./">50システム説明</a><a href="../pricing">料金</a><a href="../about">DPRO SHOP</a></div><div><strong>GUIDE</strong><a href="../contact">お問い合わせ</a><a href="${LINE_URL}" target="_blank" rel="noopener">LINEで無料相談</a></div><div class="v33sys-footer__product"><strong>PRODUCT SITE</strong><a href="${productDetailUrl()}" target="_blank" rel="noopener">このシステムを実際に触る ↗</a></div></div><div class="v33sys-footer__bottom"><span>© 2026 DPRO SHOP.</span><span><a href="../privacy">Privacy</a> · <a href="../terms">Terms</a></span></div></footer>`;
  const enhanceDetailPage = () => {
    if (document.body.classList.contains("systems-hub-page") || document.body.classList.contains("sys33-detail-page")) return;
    ensureV33Css(); document.body.classList.add("systems-v33-runtime");
    const oldHeader=document.querySelector(".site-header");
    if (oldHeader) oldHeader.insertAdjacentHTML("afterend", sharedHeader()); else document.body.insertAdjacentHTML("afterbegin", sharedHeader());
    const main=document.querySelector("main");
    if (main) main.insertAdjacentHTML("beforebegin", `<div class="v33sys-runtime-role"><div class="v33sys-runtime-role__inner"><a class="v33sys-runtime-role__blue" href="./">BLUE / OFFICIAL GUIDE</a><span>このページで仕組み・機能・導入条件を詳しく確認</span><a class="v33sys-runtime-role__red" href="${productDetailUrl()}" target="_blank" rel="noopener">RED / PRODUCT SITEで実際に触る ↗</a></div></div>`);
    const target=document.querySelector(".product-final-cta") || document.querySelector("main > section:last-of-type");
    if (target) target.insertAdjacentHTML("beforebegin", `<section class="v33sys-experience-bridge"><div><small>RED / PRODUCT EXPERIENCE</small><h2>ここまでが公式説明。<br>次は完成システムを実際に操作。</h2><p>PRODUCT SITEでは、PC・スマホ・iPadの実画面や公開デモを、製品ごとに確認できます。</p></div><a href="${productDetailUrl()}" target="_blank" rel="noopener">PRODUCT SITEでこのシステムを触る ↗</a></section>`);
    const oldFooter=document.querySelector(".site-footer");
    if (oldFooter) oldFooter.insertAdjacentHTML("afterend",sharedFooter()); else document.body.insertAdjacentHTML("beforeend",sharedFooter());
  };
  const setupMenu=()=>{document.querySelectorAll(".v33sys-menu").forEach(btn=>{btn.addEventListener("click",()=>{const nav=document.getElementById(btn.getAttribute("aria-controls"));const open=btn.getAttribute("aria-expanded")==="true";btn.setAttribute("aria-expanded",String(!open));nav?.classList.toggle("is-open",!open)});});};
  const filters=[...document.querySelectorAll("[data-system-filter]")];
  const cards=[...document.querySelectorAll("[data-system-category]")];
  const empty=document.querySelector("[data-system-empty]"); const resultCount=document.querySelector("[data-system-result-count]");
  const updateCounts=()=>document.querySelectorAll("[data-filter-count]").forEach(node=>{const category=node.dataset.filterCount||"all";const count=category==="all"?cards.length:cards.filter(card=>card.dataset.systemCategory===category).length;node.textContent=String(count)});
  const applyFilter=(filter,updateUrl=true)=>{let visible=0;filters.forEach(button=>{const active=button.dataset.systemFilter===filter;button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",String(active))});cards.forEach(card=>{const show=filter==="all"||card.dataset.systemCategory===filter;card.hidden=!show;if(show)visible++});if(empty)empty.hidden=visible!==0;if(resultCount)resultCount.textContent=`${visible}件を表示中`;if(updateUrl){const url=new URL(location.href);if(filter==="all")url.searchParams.delete("category");else url.searchParams.set("category",filter);history.replaceState(null,"",url)}};
  updateCounts(); filters.forEach(button=>button.addEventListener("click",()=>applyFilter(button.dataset.systemFilter||"all"))); const requested=new URLSearchParams(location.search).get("category");const initial=requested&&filters.some(button=>button.dataset.systemFilter===requested)?requested:"all";if(filters.length)applyFilter(initial,false);
  const progress=document.querySelector(".sys-progress");const updateProgress=()=>{if(!progress)return;const scrollable=document.documentElement.scrollHeight-innerHeight;const ratio=scrollable>0?scrollY/scrollable:0;progress.style.width=`${Math.min(100,Math.max(0,ratio*100))}%`};updateProgress();addEventListener("scroll",updateProgress,{passive:true});addEventListener("resize",updateProgress);
  const localLinks=[...document.querySelectorAll(".product-local-nav a[href^='#']")];const localSections=localLinks.map(link=>{const id=link.getAttribute("href")?.slice(1);return id?{link,section:document.getElementById(id)}:null}).filter(item=>item?.section);if(localSections.length&&"IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;localSections.forEach(({link,section})=>link.classList.toggle("is-active",section===visible.target))},{rootMargin:"-25% 0px -62% 0px",threshold:[0,.05,.2]});localSections.forEach(({section})=>observer.observe(section))}
  document.addEventListener("click",event=>{const systemCard=event.target.closest(".sys-product-card,.sys33-card");if(systemCard&&typeof gtag==="function")gtag("event","select_content",{content_type:"dpro_official_system",item_id:systemCard.getAttribute("href")||"unknown",page_location:location.href});const demoLink=event.target.closest("[data-demo-link]");if(demoLink&&typeof gtag==="function")gtag("event","select_content",{content_type:"dpro_external_demo",item_id:demoLink.dataset.demoLink||"unknown",link_url:demoLink.href,page_location:location.href})});
  enhanceDetailPage(); setupMenu();
})();