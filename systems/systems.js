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
  const sharedFooter = () => `<footer class="v33sys-footer"><div class="sys33-shell v33sys-footer__grid"><div><a class="v33sys-brand" href="../"><span>D</span><div><strong>DPRO SHOP</strong><small>OFFICIAL SITE</small></div></a><p>青で詳しく理解し、赤で実際に触る。</p></div><div><strong>OFFICIAL</strong><a href="./">52システム説明</a><a href="../pricing">料金</a><a href="../about">DPRO SHOP</a></div><div><strong>GUIDE</strong><a href="../contact">お問い合わせ</a><a href="${LINE_URL}" target="_blank" rel="noopener">LINEで無料相談</a></div><div class="v33sys-footer__product"><strong>PRODUCT SITE</strong><a href="${productDetailUrl()}" target="_blank" rel="noopener">このシステムを実際に触る ↗</a></div></div><div class="v33sys-footer__bottom"><span>© 2026 DPRO SHOP.</span><span><a href="../privacy">Privacy</a> · <a href="../terms">Terms</a></span></div></footer>`;
  const polishCustomerCopy = () => {
    const slug = currentSlug();
    const exactReplacements = {
      careplan: [
        ["新規相談、担当割当、LINE連携承認、書類確認、記録承認、通知キュー、system-checkを管理します。", "新規相談、担当割当、LINE連携承認、書類確認、記録承認、通知予定や運用状況を確認します。"],
        ["割当・期限・承認・通知・検査", "割当・期限・承認・通知・要確認"],
        ["PDF・画像・Office文書を非公開Storageへ保存し、受領・差戻し・再提出・監査履歴を管理します。", "PDF・画像・Office文書を安全に保管し、受領・差戻し・再提出の履歴を管理します。"],
        ["期限・LINE通知基盤", "期限・LINE通知"],
        ["認定、計画、モニタリング、書類、予定を毎朝確認し、LINE未連携やデモ配信は安全に保留します。", "認定、計画、モニタリング、書類、予定の期限を確認し、必要な案内をLINEへつなげます。"],
        ["管理者PC・iPad・検査", "管理者PC・iPad"],
        ["事業所全体の承認・期限・担当状況と、DB・RLS・公開ファイルをsystem-checkで一括確認します。", "事業所全体の承認・期限・担当状況を、PC・iPadからまとめて確認できます。"],
        ["期限・未対応を自動確認", "期限・未対応を定期確認"],
        ["毎朝8時に期限と未対応を確認し、通知履歴へ記録します。", "期限と未対応を定期的に確認し、通知履歴へ記録します。"],
        ["通知管理・system-check", "通知管理・運用状況"],
        ["API・DB検査", "全体状況の確認"],
        ["相談入口、利用者・家族、ケアマネ、管理者PC、管理者iPad、system-checkを実際に開いて確認できます。", "相談入口、利用者・家族、ケアマネ、管理者PC、管理者iPadの実画面を確認できます。"],
        ["今日、承認、期限、担当状況、API・DB検査を大きなタブで確認します。", "今日、承認、期限、担当状況を大きなタブで確認します。"],
        ["書類は非公開Storageへ保存", "書類は非公開で保管"],
        ["提出ファイルは非公開Storageへ保存し、認証と権限を確認した管理者だけがダウンロードできます。", "提出ファイルは非公開で保管し、権限を確認した管理者だけがダウンロードできます。"],
        ["ファイル形式、容量、ハッシュ、二重送信を検査し、管理者権限で受領・差戻し・ダウンロードします。", "ファイル形式や容量を確認し、管理者権限で受領・差戻し・ダウンロードします。"],
        ["デモ環境では通知対象と履歴を作成しますが、実際のLINE送信は安全に保留します。本番移行時に配信設定を行います。", "デモ環境では実際のLINE送信は行いません。導入時に配信設定を確認します。"]
      ],
      homecare: [
        ["管理者iPad・system-check", "管理者iPad・運用状況の確認"],
        ["当日の訪問、記録未提出、申し送り、事故・問い合わせを確認し、営業前の一括検査を実行します。", "当日の訪問、記録未提出、申し送り、事故・問い合わせをまとめて確認できます。"]
      ]
    };
    const replacements = exactReplacements[slug] || [];
    const root = document.querySelector("main");
    if (!root) return;

    document.querySelectorAll(".brand-copy small").forEach((node) => {
      if ((node.textContent || "").trim() === "LINE BUSINESS DESIGN") node.textContent = "OFFICIAL SITE";
    });

    if (replacements.length) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        let value = node.nodeValue || "";
        replacements.forEach(([from, to]) => {
          if (value.includes(from)) value = value.split(from).join(to);
        });
        node.nodeValue = value;
      });
    }

    /* system-check is an internal operations screen, not customer-facing product content. */
    root.querySelectorAll(".product-live-row").forEach((row) => {
      if (row.querySelector('a[href*="system-check"]')) row.remove();
    });

    if (slug === "careplan") {
      document.querySelectorAll(".dayservice-check-row span").forEach((node) => {
        if (node.textContent.trim() === "検査") node.textContent = "要確認";
      });
    }
  };
  const enhanceDetailPage = () => {
    if (document.body.classList.contains("systems-hub-page") || document.body.classList.contains("sys33-detail-page")) return;
    ensureV33Css(); document.body.classList.add("systems-v33-runtime");
    const oldHeader=document.querySelector(".site-header");
    if (oldHeader) oldHeader.insertAdjacentHTML("afterend", sharedHeader()); else document.body.insertAdjacentHTML("afterbegin", sharedHeader());
    const main=document.querySelector("main");
    if (main) main.insertAdjacentHTML("beforebegin", `<div class="v33sys-runtime-role"><div class="v33sys-runtime-role__inner"><a class="v33sys-runtime-role__blue" href="./">BLUE / OFFICIAL GUIDE</a><span>このページで仕組み・機能・導入条件を詳しく確認</span><a class="v33sys-runtime-role__red" href="${productDetailUrl()}" target="_blank" rel="noopener">RED / PRODUCT SITEで実際に触る ↗</a></div></div>`);
    const target=document.querySelector(".product-final-cta") || document.querySelector("main > section:last-of-type");
    if (target) target.insertAdjacentHTML("beforebegin", `<section class="v33sys-experience-bridge"><div><small>RED / PRODUCT EXPERIENCE</small><h2>ここまでが公式説明。<br>次は完成システムを<span class="dpro-jp-keep">実際に操作。</span></h2><p>PRODUCT SITEでは、PC・スマホ・iPadの実画面や公開デモを、製品ごとに確認できます。</p></div><a href="${productDetailUrl()}" target="_blank" rel="noopener">PRODUCT SITEでこのシステムを触る ↗</a></section>`);
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
  polishCustomerCopy(); enhanceDetailPage(); setupMenu();
})();

/* DPRO BAKERY tutorial bridge preserved after canonical-52 flattening. */
(() => {
  'use strict';
function injectBakeryTutorial() {
    if (!document.body || !document.body.classList.contains("official-product-page")) return;
    const path = location.pathname.replace(/\/+$/, "");
    if (!/(?:\/systems\/bakery|\/systems\/bakery\.html)$/.test(path)) return;
    if (document.getElementById("dproBakeryTutorialR6")) return;

    const quickPdf = "https://dpromstk2000-lab.github.io/bakery-line-system/DPRO_BAKERY_QUICK_START_A4.pdf";
    const detailedPdf = "https://dpromstk2000-lab.github.io/bakery-line-system/DPRO_BAKERY_DETAILED_MANUAL_A4.pdf";
    const guideUrl = "https://dpromstk2000-lab.github.io/bakery-line-system/guide.html";
    const first10Url = "https://dpromstk2000-lab.github.io/bakery-line-system/owner.html?tutorial=replay";

    if (!document.getElementById("dproBakeryTutorialR6Styles")) {
      const style = document.createElement("style");
      style.id = "dproBakeryTutorialR6Styles";
      style.textContent = `
        #dproBakeryTutorialR6{position:relative;overflow:hidden;background:linear-gradient(145deg,#fff8ed,#fff);color:#29211b}
        #dproBakeryTutorialR6 .dpro-r6-inner{width:min(1180px,calc(100% - 32px));margin:auto;padding:76px 0}
        #dproBakeryTutorialR6 .dpro-r6-head{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:34px;align-items:end}
        #dproBakeryTutorialR6 .dpro-r6-kicker{margin:0 0 10px;color:#9a4e16;font-size:12px;font-weight:900;letter-spacing:.12em}
        #dproBakeryTutorialR6 h2{margin:0;color:#2d211a;font-size:clamp(30px,5vw,54px);line-height:1.16;letter-spacing:-.045em}
        #dproBakeryTutorialR6 h2 em{color:#9a4e16;font-style:normal}
        #dproBakeryTutorialR6 .dpro-r6-lead{margin:0;color:#65574d;font-size:15px;line-height:1.9;font-weight:700}
        #dproBakeryTutorialR6 .dpro-r6-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px}
        #dproBakeryTutorialR6 .dpro-r6-card{min-width:0;display:flex;flex-direction:column;padding:21px;border:1px solid #ead8c3;border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(72,42,22,.08)}
        #dproBakeryTutorialR6 .dpro-r6-card small{color:#9a4e16;font-size:11px;font-weight:950;letter-spacing:.08em}
        #dproBakeryTutorialR6 .dpro-r6-card h3{margin:7px 0 8px;font-size:21px;line-height:1.35;color:#2d211a}
        #dproBakeryTutorialR6 .dpro-r6-card p{flex:1;margin:0;color:#6b5c52;font-size:13px;line-height:1.75;font-weight:700}
        #dproBakeryTutorialR6 .dpro-r6-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
        #dproBakeryTutorialR6 .dpro-r6-button{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:10px 13px;text-decoration:none;font-size:12px;font-weight:950;transition:transform .18s ease,box-shadow .18s ease}
        #dproBakeryTutorialR6 .dpro-r6-button:hover{transform:translateY(-1px)}
        #dproBakeryTutorialR6 .dpro-r6-view{background:#3b2518;color:#fff}
        #dproBakeryTutorialR6 .dpro-r6-print{background:#fff3e1;color:#8a4416;border:1px solid #e6c49e}
        #dproBakeryTutorialR6 .dpro-r6-online{background:#16704b;color:#fff}
        #dproBakeryTutorialR6 .dpro-r6-note{margin-top:15px;padding:13px 15px;border-radius:15px;background:#fff4df;border:1px solid #eed1a7;color:#6d523d;font-size:12px;line-height:1.75;font-weight:750}
        #dproBakeryTutorialR6 a:focus-visible{outline:3px solid #2563eb;outline-offset:3px}
        @media(max-width:860px){#dproBakeryTutorialR6 .dpro-r6-head{grid-template-columns:1fr}#dproBakeryTutorialR6 .dpro-r6-grid{grid-template-columns:1fr 1fr}#dproBakeryTutorialR6 .dpro-r6-grid .dpro-r6-card:last-child{grid-column:1/-1}}
        @media(max-width:560px){#dproBakeryTutorialR6 .dpro-r6-inner{width:min(100% - 18px,1180px);padding:54px 0}#dproBakeryTutorialR6 .dpro-r6-grid{grid-template-columns:1fr}#dproBakeryTutorialR6 .dpro-r6-grid .dpro-r6-card:last-child{grid-column:auto}#dproBakeryTutorialR6 .dpro-r6-actions{display:grid;grid-template-columns:1fr}#dproBakeryTutorialR6 .dpro-r6-button{width:100%}}
      `;
      document.head.appendChild(style);
    }

    const section = document.createElement("section");
    section.id = "dproBakeryTutorialR6";
    section.setAttribute("aria-labelledby", "dproBakeryTutorialR6Title");
    section.innerHTML = `
      <div class="dpro-r6-inner">
        <div class="dpro-r6-head">
          <div>
            <p class="dpro-r6-kicker">AFTER CONTRACT / TUTORIAL &amp; PRINT SUPPORT</p>
            <h2 id="dproBakeryTutorialR6Title">契約後も、<em>説明なしで始めやすい。</em></h2>
          </div>
          <p class="dpro-r6-lead">画面内の「最初の10分」、いつでも検索できる操作ガイド、印刷して渡せる2種類のPDFを用意しています。PCでも紙でも確認できます。</p>
        </div>
        <div class="dpro-r6-grid">
          <article class="dpro-r6-card">
            <small>01 / FIRST 10 + QUICK START</small>
            <h3>最初の10分から始める</h3>
            <p>オーナーが最初に確認する7章・15項目。画面内ガイドに加え、A4・5ページのクイックスタートを印刷できます。</p>
            <div class="dpro-r6-actions">
              <a class="dpro-r6-button dpro-r6-view" href="${quickPdf}" target="_blank" rel="noopener" data-dpro-r6="quick-view">PDFを見る</a>
              <a class="dpro-r6-button dpro-r6-print" href="${quickPdf}" target="_blank" rel="noopener" data-dpro-r6="quick-print" title="PDFを開き、ブラウザの印刷機能を使用します">印刷する</a>
              <a class="dpro-r6-button dpro-r6-online" href="${first10Url}" target="_blank" rel="noopener" data-dpro-r6="first10">画面ガイドを体験</a>
            </div>
          </article>
          <article class="dpro-r6-card">
            <small>02 / DETAILED MANUAL</small>
            <h3>詳しい操作も紙で確認</h3>
            <p>7カテゴリ・29記事・12FAQを収録したA4詳細マニュアル。店舗で保管し、必要な時に印刷して確認できます。</p>
            <div class="dpro-r6-actions">
              <a class="dpro-r6-button dpro-r6-view" href="${detailedPdf}" target="_blank" rel="noopener" data-dpro-r6="detail-view">PDFを見る</a>
              <a class="dpro-r6-button dpro-r6-print" href="${detailedPdf}" target="_blank" rel="noopener" data-dpro-r6="detail-print" title="PDFを開き、ブラウザの印刷機能を使用します">印刷する</a>
            </div>
          </article>
          <article class="dpro-r6-card">
            <small>03 / ONLINE GUIDE CENTER</small>
            <h3>分からない操作を検索</h3>
            <p>Guide Centerは検索・カテゴリ・FAQから確認でき、実際の機能画面へも移動できます。印刷物のQRからも同じガイドを開けます。</p>
            <div class="dpro-r6-actions">
              <a class="dpro-r6-button dpro-r6-online" href="${guideUrl}" target="_blank" rel="noopener" data-dpro-r6="guide">オンライン操作ガイド</a>
            </div>
          </article>
        </div>
        <p class="dpro-r6-note">印刷ボタンはPDFを新しいタブで開きます。開いたPDFの印刷ボタン、または Ctrl+P / Command+P で印刷できます。チュートリアルは保存・更新・送信・決済などの業務操作を自動実行しません。</p>
      </div>
    `;

    const pricing = document.getElementById("pricing");
    const main = document.getElementById("main") || document.querySelector("main");
    if (pricing && pricing.parentNode) pricing.parentNode.insertBefore(section, pricing);
    else if (main) main.appendChild(section);
  }
  injectBakeryTutorial();
})();
