window.DPRO_SITE_CONFIG = Object.freeze({
  productCount: 51,
  identity: Object.freeze({ official: 'blue', product: 'red' }),
  urls: Object.freeze({
    lineConsult: 'https://lin.ee/YxJGXV6D',
    productSite: 'https://dpromstk2000-lab.github.io/dpro-line-systems-site/',
    productCatalog: 'https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems.html'
  }),
  prices: Object.freeze({
    lineBuild: 77000,
    lineOperation: 3300,
    websiteOperation: 1100,
    websiteOperationStandalone: 3300,
    websiteOperationContractStore: 1100,
    dproInitial: 33000,
    dproOperation: 1100,
    unifiedMonthly: 5500
  })
});

/* DPRO SHOP / OFFICIAL SALES BRUSH-UP V1.0
   2026-08-18
   Scope: OFFICIAL SITE only.
   Purpose: make completed-product proof visible before consultation.
   Protection: PRODUCT SITE / LIVE DEMO routing / API / DB / AUTH untouched.
*/
(() => {
  'use strict';

  const CFG = window.DPRO_SITE_CONFIG;
  const PRODUCT_SITE = CFG.urls.productSite;
  const PRODUCT_CATALOG = CFG.urls.productCatalog;
  const PET_PRODUCT = 'https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/pet-care.html';
  const PET_INTEGRATED_DEMO = 'https://dpromstk2000-lab.github.io/DPRO-VET-QR/integrated-demo.html?clinic_code=dpro_vet_demo&demo=ready';
  const STYLE_ID = 'dpro-official-sales-proof-v1-style';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function normalizeProductClaims() {
    document.querySelectorAll('[data-product-count]').forEach((el) => {
      el.textContent = String(CFG.productCount);
    });

    document.querySelectorAll('[data-product-site]').forEach((el) => {
      if (!el.getAttribute('href')) el.setAttribute('href', PRODUCT_SITE);
    });

    const replacements = [
      ['PRODUCT SITE・50製品', 'PRODUCT SITE・51製品'],
      ['実際に動く50製品', '実際に動く51製品'],
      ['50の業種別システム', '51の業種別システム'],
      ['50システム一覧・検索', '51システム一覧・検索'],
      ['50システムを実際に触る', '51システムを実際に触る'],
      ['50の完成システム', '51の完成システム']
    ];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let value = node.nodeValue;
      replacements.forEach(([from, to]) => { value = value.split(from).join(to); });
      if (value !== node.nodeValue) node.nodeValue = value;
    });

    ['description', 'og:description'].forEach((key) => {
      const selector = key === 'description' ? 'meta[name="description"]' : 'meta[property="og:description"]';
      const meta = document.querySelector(selector);
      if (!meta) return;
      let value = meta.getAttribute('content') || '';
      replacements.forEach(([from, to]) => { value = value.split(from).join(to); });
      meta.setAttribute('content', value);
    });
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .dpro-proof-v1{position:relative;overflow:hidden;padding:clamp(56px,7vw,92px) 0;background:linear-gradient(180deg,#f5f9ff 0%,#fff 100%);color:#10233d;border-top:1px solid #dbe7f6;border-bottom:1px solid #dbe7f6}
      .dpro-proof-v1:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 12% 15%,rgba(25,93,180,.10),transparent 30%),radial-gradient(circle at 88% 82%,rgba(194,44,93,.08),transparent 28%)}
      .dpro-proof-v1__inner{position:relative;z-index:1;width:min(1180px,calc(100% - 36px));margin:0 auto}
      .dpro-proof-v1__head{max-width:860px;margin:0 auto 30px;text-align:center}
      .dpro-proof-v1__eyebrow{margin:0 0 10px;color:#174ea6;font-size:12px;font-weight:950;letter-spacing:.14em}
      .dpro-proof-v1__head h2{margin:0;color:#10233d;font-size:clamp(30px,4.7vw,56px);line-height:1.12;letter-spacing:-.045em}
      .dpro-proof-v1__head h2 em{color:#c22c5d;font-style:normal}
      .dpro-proof-v1__head p{max-width:760px;margin:16px auto 0;color:#53657c;font-size:clamp(14px,1.6vw,17px);line-height:1.85}
      .dpro-proof-v1__facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
      .dpro-proof-v1__fact{min-height:150px;padding:22px;border:1px solid #d7e4f4;border-radius:18px;background:rgba(255,255,255,.94);box-shadow:0 18px 42px rgba(21,60,110,.07)}
      .dpro-proof-v1__fact small{display:block;margin-bottom:8px;color:#174ea6;font-size:10px;font-weight:950;letter-spacing:.12em}
      .dpro-proof-v1__fact strong{display:block;color:#122a49;font-size:clamp(18px,2vw,24px);line-height:1.25}
      .dpro-proof-v1__fact p{margin:9px 0 0;color:#5d6f84;font-size:13px;line-height:1.65}
      .dpro-proof-v1__actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:26px}
      .dpro-proof-v1__actions a{display:inline-flex;min-height:50px;align-items:center;justify-content:center;padding:0 20px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:950}
      .dpro-proof-v1__actions .is-official{background:#174ea6;color:#fff;box-shadow:0 12px 28px rgba(23,78,166,.18)}
      .dpro-proof-v1__actions .is-product{background:#c22c5d;color:#fff;box-shadow:0 12px 28px rgba(194,44,93,.16)}
      .dpro-proof-v1__actions .is-ghost{border:1px solid #cbdcf1;background:#fff;color:#174ea6}
      .dpro-proof-v1__note{margin:13px auto 0;color:#718096;text-align:center;font-size:11px;line-height:1.65}
      .dpro-proof-v1--compact{padding:34px 0}
      .dpro-proof-v1--compact .dpro-proof-v1__head{margin-bottom:20px}
      .dpro-proof-v1--compact .dpro-proof-v1__facts{grid-template-columns:repeat(3,minmax(0,1fr))}
      .dpro-proof-v1--compact .dpro-proof-v1__fact{min-height:118px;padding:18px}
      .dpro-proof-v1__inline{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
      .dpro-proof-v1__inline span{display:inline-flex;align-items:center;min-height:34px;padding:0 11px;border:1px solid #d5e2f2;border-radius:999px;background:#fff;color:#23456e;font-size:11px;font-weight:900}
      .dpro-proof-v1__inline span:before{content:"✓";margin-right:6px;color:#174ea6;font-weight:1000}

      .sb4-proof{position:relative;overflow:hidden;padding:clamp(66px,8vw,108px) 0;background:linear-gradient(180deg,#f3fbf8 0%,#fff 100%);color:#123a31}
      .sb4-proof__inner{width:min(1180px,calc(100% - 36px));margin:0 auto}
      .sb4-proof__head{max-width:850px;margin:0 auto 32px;text-align:center}
      .sb4-proof__eyebrow{margin:0 0 10px;color:#087b6e;font-size:12px;font-weight:950;letter-spacing:.14em}
      .sb4-proof__head h2{margin:0;color:#0d332a;font-size:clamp(32px,5vw,58px);line-height:1.1;letter-spacing:-.045em}
      .sb4-proof__head p{margin:16px auto 0;color:#506b64;line-height:1.85}
      .sb4-proof__board{display:grid;grid-template-columns:minmax(0,1fr) 46px minmax(230px,.72fr) 46px minmax(0,.92fr);gap:12px;align-items:stretch;padding:22px;border:1px solid #cce3dc;border-radius:24px;background:#fff;box-shadow:0 26px 70px rgba(17,72,60,.10)}
      .sb4-proof__entries,.sb4-proof__outputs{display:grid;gap:9px}.sb4-proof__entries{grid-template-columns:1fr 1fr}
      .sb4-proof__entry,.sb4-proof__output{display:flex;min-height:102px;flex-direction:column;justify-content:center;padding:14px;border:1px solid #d6e7e2;border-radius:14px;background:#fff}
      .sb4-proof__entry small,.sb4-proof__output small,.sb4-proof__core small{color:#16806f;font-size:10px;font-weight:950;letter-spacing:.11em}
      .sb4-proof__entry strong,.sb4-proof__output strong{margin-top:3px;color:#183e35;font-size:16px;line-height:1.35}.sb4-proof__entry span,.sb4-proof__output span{margin-top:4px;color:#6a7e78;font-size:12px;line-height:1.5}
      .sb4-proof__arrow{display:grid;place-items:center;color:#16806f;font-size:28px;font-weight:1000}
      .sb4-proof__core{display:flex;min-height:220px;flex-direction:column;justify-content:center;padding:22px 18px;border-radius:20px;background:linear-gradient(145deg,#0d493c,#087b6e);color:#fff;text-align:center}
      .sb4-proof__core small{color:#b8f2df}.sb4-proof__core strong{display:block;margin-top:4px;font-size:clamp(22px,2.4vw,30px);line-height:1.15}.sb4-proof__core em{margin-top:6px;color:#d8f7ed;font-style:normal;font-size:12px;font-weight:800}
      .sb4-proof__scope{margin:14px 0 0;padding:11px 14px;border-left:4px solid #16806f;background:#f0f8f5;color:#4e675f;font-size:12px;line-height:1.7}
      .sb4-proof__actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}.sb4-proof__actions a{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 18px;border-radius:11px;text-decoration:none;font-size:13px;font-weight:950}.sb4-proof__actions .is-demo{background:#087b6e;color:#fff}.sb4-proof__actions .is-product{border:1px solid #bfd8d1;background:#fff;color:#173d35}
      .sb4-proof__note{margin:12px auto 0;color:#6b7d78;text-align:center;font-size:11px;line-height:1.65}
      @media(max-width:900px){.dpro-proof-v1__facts{grid-template-columns:1fr 1fr}.dpro-proof-v1--compact .dpro-proof-v1__facts{grid-template-columns:1fr}.sb4-proof__board{grid-template-columns:1fr}.sb4-proof__arrow{min-height:26px;transform:rotate(90deg)}.sb4-proof__outputs{grid-template-columns:1fr 1fr}}
      @media(max-width:620px){.dpro-proof-v1{padding:46px 0}.dpro-proof-v1__inner,.sb4-proof__inner{width:min(100% - 24px,1180px)}.dpro-proof-v1__head,.sb4-proof__head{text-align:left}.dpro-proof-v1__head p,.sb4-proof__head p{margin-left:0}.dpro-proof-v1__facts,.sb4-proof__entries,.sb4-proof__outputs{grid-template-columns:1fr}.dpro-proof-v1__actions a,.sb4-proof__actions a{width:100%}.dpro-proof-v1__fact{min-height:auto}.sb4-proof__board{padding:14px;border-radius:18px}}
    `;
    document.head.appendChild(style);
  }

  function makeSalesProof(options = {}) {
    const section = document.createElement('section');
    section.className = `dpro-proof-v1${options.compact ? ' dpro-proof-v1--compact' : ''}`;
    section.id = options.id || 'completed-product-proof';
    section.setAttribute('aria-labelledby', `${section.id}-title`);
    section.innerHTML = `
      <div class="dpro-proof-v1__inner">
        <header class="dpro-proof-v1__head">
          <p class="dpro-proof-v1__eyebrow">COMPLETED PRODUCT PROOF / BEFORE CONSULTATION</p>
          <h2 id="${section.id}-title">相談する前に、<em>完成済みの実画面</em>を確認できます。</h2>
          <p>DPRO SHOPはサービスの説明だけではありません。業種別に完成した51製品をPRODUCT SITEで公開し、対応製品では実際の画面や公開LIVE DEMOまで確認できます。</p>
        </header>
        <div class="dpro-proof-v1__facts">
          <article class="dpro-proof-v1__fact"><small>COMPLETED CATALOG</small><strong>51製品</strong><p>業種別の完成DPROシステムを一覧で確認。</p></article>
          <article class="dpro-proof-v1__fact"><small>REAL SCREENS</small><strong>実画面を公開</strong><p>PC・スマホ・iPadなど、製品ごとの画面を確認。</p></article>
          <article class="dpro-proof-v1__fact"><small>PUBLIC LIVE DEMO</small><strong>触って確認</strong><p>対応製品は公開LIVE DEMOから操作イメージを確認。</p></article>
          <article class="dpro-proof-v1__fact"><small>CATALOG EXPANSION</small><strong>DPRO MEDICAL</strong><p>医療向けDPRO MEDICALも51製品カタログに含まれます。</p></article>
        </div>
        <div class="dpro-proof-v1__actions">
          <a class="is-official" href="${options.systemsHref || 'systems/'}">51システムの公式説明を見る</a>
          <a class="is-product" href="${PRODUCT_SITE}" target="_blank" rel="noopener">PRODUCT SITEで実際に触る ↗</a>
          <a class="is-ghost" href="${options.medicalHref || 'systems/medical'}">DPRO MEDICALを見る</a>
        </div>
        <p class="dpro-proof-v1__note">OFFICIAL SITEは「理解・信頼・料金・相談」、PRODUCT SITEは「実画面・操作確認」のための証拠環境です。</p>
      </div>`;
    return section;
  }

  function applyHomeProof() {
    const finalCta = document.querySelector('.or-cta');
    if (!finalCta || document.getElementById('home-completed-product-proof')) return;
    const proof = makeSalesProof({ id: 'home-completed-product-proof' });
    finalCta.insertAdjacentElement('beforebegin', proof);
  }

  function createPetProof() {
    if (document.getElementById('real-connected-case')) return null;
    const section = document.createElement('section');
    section.className = 'sb4-proof';
    section.id = 'real-connected-case';
    section.setAttribute('aria-labelledby', 'real-connected-case-title');
    section.innerHTML = `
      <div class="sb4-proof__inner">
        <header class="sb4-proof__head">
          <p class="sb4-proof__eyebrow">REAL CONNECTED CASE / DPRO PET CARE</p>
          <h2 id="real-connected-case-title">実際に、ここまで<br>つながっています。</h2>
          <p>LINE・WEB・現場をひとつにつなぐDPROの考え方を、動物病院向け「DPRO PET CARE」で実際に確認できます。</p>
        </header>
        <div class="sb4-proof__board" role="img" aria-label="WEB、LINE、電話、窓口の受付をDPRO PET CAREへ集約し、病院PC・iPadで確認する実証構成">
          <div class="sb4-proof__entries">
            <div class="sb4-proof__entry"><small>WEB</small><strong>ホームページ受付</strong><span>WEBから受付</span></div>
            <div class="sb4-proof__entry"><small>LINE</small><strong>LINE受付</strong><span>LINEから同じ受付へ</span></div>
            <div class="sb4-proof__entry"><small>PHONE</small><strong>電話受付</strong><span>病院側で共通受付へ登録</span></div>
            <div class="sb4-proof__entry"><small>COUNTER</small><strong>窓口受付</strong><span>来院受付も同じ確認先へ</span></div>
          </div>
          <div class="sb4-proof__arrow" aria-hidden="true">→</div>
          <div class="sb4-proof__core"><small>ONE OPERATION CORE</small><strong>DPRO<br>PET CARE</strong><em>病院側の確認先をひとつに</em></div>
          <div class="sb4-proof__arrow" aria-hidden="true">→</div>
          <div class="sb4-proof__outputs">
            <div class="sb4-proof__output"><small>HOSPITAL OPERATION</small><strong>PC / iPad・スタッフ</strong><span>受付・予約・診療進行を確認</span></div>
            <div class="sb4-proof__output"><small>SUPPORTED SYNC</small><strong>病院設定 → HP / LINE</strong><span>実装済み範囲で表示・予約可否へ連携</span></div>
          </div>
        </div>
        <p class="sb4-proof__scope"><strong>連携範囲：</strong> WEB / LINE / 電話 / 窓口をDPROの共通受付で確認。病院共通設定は、実装済みの対応範囲でホームページ・LINE表示や予約可否へ連携します。</p>
        <div class="sb4-proof__actions"><a class="is-demo" href="${PET_INTEGRATED_DEMO}" target="_blank" rel="noopener">統合LIVE DEMOを見る ↗</a><a class="is-product" href="${PET_PRODUCT}" target="_blank" rel="noopener">DPRO PET CAREを見る ↗</a></div>
        <p class="sb4-proof__note">DPRO PET CAREは実証例のひとつです。DPROでは業種ごとの専用システムを展開しています。</p>
      </div>`;
    return section;
  }

  function applyPetProof() {
    const connected = document.getElementById('connected-flow');
    if (!connected) return;
    document.querySelectorAll('.v33-vet-spotlight').forEach((el) => el.remove());
    const legacyStyle = document.getElementById('dpro-vet-spotlight-style');
    if (legacyStyle) legacyStyle.remove();
    const section = createPetProof();
    if (section) connected.insertAdjacentElement('afterend', section);
  }

  function applyPricingProof() {
    if (!/\/pricing(?:\.html)?\/?$/.test(location.pathname)) return;
    const bridge = document.querySelector('.v33-product-bridge');
    if (!bridge || bridge.querySelector('.dpro-proof-v1__inline')) return;
    const p = bridge.querySelector('p');
    if (p) p.textContent = '料金と提供条件を確認したら、相談前にPRODUCT SITEで完成済み51製品の実画面・公開LIVE DEMOを確認できます。';
    const tags = document.createElement('div');
    tags.className = 'dpro-proof-v1__inline';
    tags.innerHTML = '<span>51製品</span><span>実画面公開</span><span>公開LIVE DEMO</span><span>DPRO MEDICAL掲載</span>';
    const actions = bridge.querySelector('.v33-actions');
    (actions || bridge).insertAdjacentElement(actions ? 'beforebegin' : 'beforeend', tags);
  }

  function applyAboutProof() {
    if (!/\/about(?:\.html)?\/?$/.test(location.pathname)) return;
    const role = document.getElementById('site-role');
    if (!role || document.getElementById('about-completed-product-proof')) return;
    const proof = makeSalesProof({ id: 'about-completed-product-proof', compact: true });
    role.insertAdjacentElement('afterend', proof);
  }

  function applyContactProof() {
    if (!/\/contact(?:\.html)?\/?$/.test(location.pathname)) return;
    const form = document.getElementById('web-contact');
    if (!form || document.getElementById('contact-completed-product-proof')) return;
    const proof = makeSalesProof({ id: 'contact-completed-product-proof', compact: true });
    form.insertAdjacentElement('beforebegin', proof);
  }

  ready(() => {
    normalizeProductClaims();
    installStyle();
    applyPetProof();
    applyHomeProof();
    applyPricingProof();
    applyAboutProof();
    applyContactProof();
  });
})();
