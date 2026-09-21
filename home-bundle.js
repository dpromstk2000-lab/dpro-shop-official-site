/* DPRO SHOP TOP HOME BUNDLE R2 / 2026-09-21 */

window.DPRO_SITE_CONFIG = Object.freeze({
  productCount: 55,
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
          <p>DPRO SHOPはサービスの説明だけではありません。業種別に完成した55製品をPRODUCT SITEで公開し、対応製品では実際の画面や公開LIVE DEMOまで確認できます。</p>
        </header>
        <div class="dpro-proof-v1__facts">
          <article class="dpro-proof-v1__fact"><small>COMPLETED CATALOG</small><strong>55製品</strong><p>業種別の完成DPROシステムを一覧で確認。</p></article>
          <article class="dpro-proof-v1__fact"><small>REAL SCREENS</small><strong>実画面を公開</strong><p>PC・スマホ・iPadなど、製品ごとの画面を確認。</p></article>
          <article class="dpro-proof-v1__fact"><small>PUBLIC LIVE DEMO</small><strong>触って確認</strong><p>対応製品は公開LIVE DEMOから操作イメージを確認。</p></article>
          <article class="dpro-proof-v1__fact"><small>CATALOG EXPANSION</small><strong>DPRO MEDICAL</strong><p>医療向けDPRO MEDICALも55製品カタログに含まれます。</p></article>
        </div>
        <div class="dpro-proof-v1__actions">
          <a class="is-official" href="${options.systemsHref || 'systems/'}">55システムの公式説明を見る</a>
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
    if (p) p.textContent = '料金と提供条件を確認したら、相談前にPRODUCT SITEで完成済み55製品の実画面・公開LIVE DEMOを確認できます。';
    const tags = document.createElement('div');
    tags.className = 'dpro-proof-v1__inline';
    tags.innerHTML = '<span>55製品</span><span>実画面公開</span><span>公開LIVE DEMO</span><span>DPRO MEDICAL掲載</span>';
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

/* DPRO SHOP OFFICIAL BRUSHUP
 * WEBSITE SAMPLE SIZE FIX R3
 * 2026-08-08
 */

/* DPRO SHOP OFFICIAL TOP V3.2.1 — LINE + WEB DUAL ENTRY → DPRO CORE */
(() => {
  'use strict';

  const cfg = window.DPRO_SITE_CONFIG || {};
  const count = Number(cfg.productCount || 50);
  document.querySelectorAll('[data-product-count]').forEach((el) => { el.textContent = String(count); });
  document.querySelectorAll('[data-line-consult]').forEach((el) => { if (cfg.urls?.lineConsult) el.href = cfg.urls.lineConsult; });
  document.querySelectorAll('[data-product-site]').forEach((el) => { if (cfg.urls?.productSite) el.href = cfg.urls.productSite; });
  document.querySelectorAll('[data-product-catalog]').forEach((el) => { if (cfg.urls?.productCatalog) el.href = cfg.urls.productCatalog; });
  document.querySelectorAll('[data-price]').forEach((el) => {
    const value = cfg.prices?.[el.dataset.price];
    if (Number.isFinite(value)) el.textContent = Number(value).toLocaleString('ja-JP');
  });

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  /* HERO: both customer entries flow INTO DPRO. LINE becomes outbound only at follow-up. */
  const heroStage = document.querySelector('[data-v32-hero-stage]');
  const heroStatus = document.querySelector('[data-v32-live-status]');
  const heroStepEls = [...document.querySelectorAll('[data-v32-live-step]')];
  const leftRoute = document.querySelector('[data-v32-route="left"]');
  const rightRoute = document.querySelector('[data-v32-route="right"]');

  const scenarios = [
    { status: 'LINE予約 → DPROへ連携', left: true, leftDirection: 'in', right: false, rightDirection: 'in' },
    { status: 'WEB予約 → DPROへ連携', left: false, leftDirection: 'in', right: true, rightDirection: 'in' },
    { status: 'LINE・WEB両方の予約をDPROで一元管理', left: true, leftDirection: 'in', right: true, rightDirection: 'in' },
    { status: 'DPROから店舗PC / iPadへ予約状況を共有', left: false, leftDirection: 'in', right: false, rightDirection: 'in' },
    { status: 'DPROの顧客情報からLINE通知・再来店フォロー', left: true, leftDirection: 'out', right: false, rightDirection: 'in' }
  ];

  let heroIndex = 0;
  let heroTimer = null;
  let heroVisible = true;

  const setHeroScenario = (index) => {
    if (!heroStage) return;
    heroIndex = ((index % scenarios.length) + scenarios.length) % scenarios.length;
    const scenario = scenarios[heroIndex];
    heroStage.dataset.scenario = String(heroIndex);
    if (heroStatus) heroStatus.textContent = scenario.status;
    heroStepEls.forEach((el, i) => el.classList.toggle('is-active', i === heroIndex));
    if (leftRoute) {
      leftRoute.classList.toggle('is-hot', scenario.left);
      leftRoute.dataset.direction = scenario.leftDirection;
    }
    if (rightRoute) {
      rightRoute.classList.toggle('is-hot', scenario.right);
      rightRoute.dataset.direction = scenario.rightDirection;
    }
  };

  const startHero = () => {
    if (reduceMotion || !heroStage || heroTimer) return;
    heroTimer = window.setInterval(() => { if (heroVisible) setHeroScenario(heroIndex + 1); }, 3600);
  };

  if (heroStage) {
    setHeroScenario(0);
    startHero();
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { heroVisible = entry.isIntersecting; });
      }, { threshold: 0.08 });
      heroObserver.observe(heroStage);
    }
  }

  /* FLOW: first step now explicitly includes both LINE and WEB. */
  const flowStage = document.querySelector('[data-v32-flow-stage]');
  const flowCards = [...document.querySelectorAll('[data-v32-flow-card]')];
  const flowStatus = document.querySelector('[data-v32-flow-status]');
  const flowMessages = [
    '1. LINEでもWEBでも、お客様が使いやすい入口から予約',
    '2. LINE・WEB双方の予約をDPROへ集約して一元管理',
    '3. 店舗PC / iPadでスタッフが同じ予約一覧を確認',
    '4. 来店後はLINE通知・クーポンで次回来店へ'
  ];
  let flowIndex = 0;
  let flowTimer = null;
  let flowVisible = false;

  const setFlowStep = (index) => {
    if (!flowStage || !flowCards.length) return;
    flowIndex = ((index % flowCards.length) + flowCards.length) % flowCards.length;
    flowStage.style.setProperty('--active-step', String(flowIndex));
    flowCards.forEach((card, i) => card.classList.toggle('is-active', i === flowIndex));
    if (flowStatus) flowStatus.textContent = flowMessages[flowIndex] || '';
  };

  const startFlow = () => {
    if (reduceMotion || flowTimer || !flowStage) return;
    flowTimer = window.setInterval(() => { if (flowVisible) setFlowStep(flowIndex + 1); }, 3300);
  };

  if (flowStage && flowCards.length) {
    setFlowStep(0);
    if ('IntersectionObserver' in window) {
      const flowObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          flowVisible = entry.isIntersecting;
          if (flowVisible) startFlow();
        });
      }, { threshold: 0.16 });
      flowObserver.observe(flowStage);
    } else {
      flowVisible = true;
      startFlow();
    }

    flowCards.forEach((card, index) => {
      card.addEventListener('pointerenter', () => setFlowStep(index), { passive: true });
      card.addEventListener('focusin', () => setFlowStep(index));
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setHeroScenario(heroIndex);
      setFlowStep(flowIndex);
    }
  });
})();

(()=>{
  'use strict';
  const run=()=>{
    if(document.documentElement.dataset.dproReservationEntry==='1') return;
    document.documentElement.dataset.dproReservationEntry='1';

    const css=`
.dpro-reservation-nav-link{white-space:nowrap;color:#dfffa2!important}
.dpro-reservation-entry{position:relative;overflow:hidden;padding:92px 0;background:linear-gradient(135deg,#f7fbf7 0%,#eef9ee 54%,#f7fbff 100%);color:#07110c;border-top:1px solid rgba(15,39,25,.06);border-bottom:1px solid rgba(15,39,25,.08)}
.dpro-reservation-entry:before{content:"";position:absolute;width:520px;height:520px;right:-180px;top:-220px;border-radius:50%;background:radial-gradient(circle,rgba(183,255,36,.24),rgba(183,255,36,0) 68%);pointer-events:none}
.dpro-reservation-entry__grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.9fr) minmax(420px,1.1fr);gap:64px;align-items:center}
.dpro-reservation-entry__copy small{display:block;color:#2f80ed;font-size:10px;font-weight:950;letter-spacing:.16em}.dpro-reservation-entry__copy h2{margin:14px 0 0;font-size:clamp(40px,4.2vw,64px);line-height:1.08;letter-spacing:-.055em}.dpro-reservation-entry__copy h2 span{display:block}.dpro-reservation-entry__copy h2 em{display:block;color:#377e10;font-style:normal}.dpro-reservation-entry__copy>p{max-width:650px;margin:22px 0 0;color:#5d6b62;font-size:14px;line-height:1.85}
.dpro-reservation-entry__chooser{display:grid;grid-template-columns:1fr;gap:10px;margin-top:24px}.dpro-reservation-choice{position:relative;display:grid;grid-template-columns:1fr auto;gap:8px 16px;align-items:center;padding:18px 20px;border-radius:19px;background:#fff;border:1px solid #d8e4dc;color:#173222;box-shadow:0 10px 28px rgba(23,50,34,.06);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.dpro-reservation-choice:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(23,50,34,.11);border-color:#b7d0bd}.dpro-reservation-choice small{grid-column:1/2;color:#2f80ed!important;font-size:8px!important;letter-spacing:.14em!important}.dpro-reservation-choice strong{grid-column:1/2;font-size:18px;line-height:1.35;letter-spacing:-.02em}.dpro-reservation-choice span{grid-column:1/2;color:#66736b;font-size:11px;line-height:1.7}.dpro-reservation-choice b{grid-column:2/3;grid-row:1/4;align-self:center;min-width:126px;padding:11px 13px;border-radius:999px;background:#b7ff24;color:#112007;font-size:10px;text-align:center;white-space:nowrap}.dpro-reservation-choice--waiting{background:linear-gradient(135deg,#f3fbff,#f5fff1);border-color:#cfe2dc}.dpro-reservation-choice--waiting small{color:#267256!important}.dpro-reservation-choice--waiting b{background:#0d1720;color:#fff}.dpro-reservation-choice--customer{background:linear-gradient(135deg,#f7fff3,#f2fbf7);border-color:#cfe3d6}.dpro-reservation-choice--customer small{color:#267256!important}.dpro-reservation-choice--customer b{background:#267256;color:#fff}.dpro-reservation-choice--line{background:linear-gradient(135deg,#effff5,#f5fff0);border-color:#bfe6cd}.dpro-reservation-choice--line small{color:#06a94a!important}.dpro-reservation-choice--line b{background:#06c755;color:#fff}
.dpro-reservation-choice--support{background:linear-gradient(135deg,#f2f7ff,#f6fbff);border-color:#cadcf0}.dpro-reservation-choice--support small{color:#2f80ed!important}.dpro-reservation-choice--support b{background:#2f80ed;color:#fff}
.dpro-reservation-entry__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.dpro-reservation-entry__actions a{min-height:43px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-size:11px;font-weight:950}.dpro-reservation-entry__secondary{border:1px solid #cdd9d0;background:#fff;color:#173222}
.dpro-reservation-entry__visual{position:relative;display:block;overflow:hidden;border-radius:28px;background:#fff;box-shadow:0 26px 70px rgba(25,55,35,.15);aspect-ratio:4/3}.dpro-reservation-entry__visual img{width:100%;height:100%;display:block;object-fit:cover}.dpro-reservation-entry__visual:after{content:"";position:absolute;inset:auto 0 0;height:48%;background:linear-gradient(transparent,rgba(2,10,5,.75))}.dpro-reservation-entry__caption{position:absolute;z-index:2;left:24px;right:24px;bottom:21px;color:#fff}.dpro-reservation-entry__caption small{display:block;color:#cfff75;font-size:9px;font-weight:900;letter-spacing:.14em}.dpro-reservation-entry__caption strong{display:block;margin-top:6px;font-size:21px;line-height:1.25}.dpro-reservation-entry__caption span{display:block;margin-top:5px;color:rgba(255,255,255,.72);font-size:11px}
@media(max-width:980px){.dpro-reservation-entry{padding:72px 0}.dpro-reservation-entry__grid{grid-template-columns:1fr;gap:30px}.dpro-reservation-entry__visual{max-width:720px}.dpro-reservation-entry__copy h2{font-size:clamp(36px,7vw,54px)}}
@media(max-width:560px){.dpro-reservation-entry{padding:60px 0}.dpro-reservation-entry__grid{gap:24px}.dpro-reservation-entry__copy h2{font-size:36px}.dpro-reservation-entry__copy h2 span,.dpro-reservation-entry__copy h2 em{white-space:nowrap}.dpro-reservation-entry__copy>p{font-size:13px}.dpro-reservation-choice{grid-template-columns:1fr;padding:17px}.dpro-reservation-choice small,.dpro-reservation-choice strong,.dpro-reservation-choice span,.dpro-reservation-choice b{grid-column:1;grid-row:auto}.dpro-reservation-choice strong{font-size:17px}.dpro-reservation-choice b{width:100%;margin-top:4px}.dpro-reservation-entry__visual{border-radius:22px}.dpro-reservation-entry__caption{left:17px;right:17px;bottom:15px}.dpro-reservation-entry__caption strong{font-size:17px}.dpro-reservation-entry__actions a{width:100%}}
@media(max-width:360px){.dpro-reservation-entry__copy h2{font-size:27px}}
`;
    const style=document.createElement('style'); style.id='dpro-reservation-entry-style'; style.textContent=css; document.head.appendChild(style);

    const nav=document.querySelector('#or-nav');
    if(nav && !nav.querySelector('a[href="reservation"]')){
      const systems=[...nav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='systems/');
      const a=document.createElement('a'); a.href='reservation'; a.textContent='予約システム'; a.className='dpro-reservation-nav-link';
      systems ? systems.insertAdjacentElement('afterend',a) : nav.prepend(a);
    }

    const footerNav=document.querySelector('.or-footer nav');
    if(footerNav && !footerNav.querySelector('a[href="reservation"]')){
      const systems=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='systems/');
      const a=document.createElement('a'); a.href='reservation'; a.textContent='予約システム';
      systems ? systems.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }
    if(footerNav && !footerNav.querySelector('a[href="waiting-system"]')){
      const reservation=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='reservation');
      const a=document.createElement('a'); a.href='waiting-system'; a.textContent='順番待ち・受付';
      reservation ? reservation.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }
    if(footerNav && !footerNav.querySelector('a[href="customer-management"]')){
      const waiting=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='waiting-system');
      const a=document.createElement('a'); a.href='customer-management'; a.textContent='店舗向け顧客管理';
      waiting ? waiting.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }
    if(footerNav && !footerNav.querySelector('a[href="line-reservation"]')){
      const customer=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='customer-management');
      const a=document.createElement('a'); a.href='line-reservation'; a.textContent='LINE予約システム';
      customer ? customer.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }
    if(footerNav && !footerNav.querySelector('a[href="customer-support"]')){
      const lineReservation=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='line-reservation');
      const a=document.createElement('a'); a.href='customer-support'; a.textContent='店舗向け顧客対応';
      lineReservation ? lineReservation.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }

    if(!document.querySelector('.dpro-reservation-entry')){
      const section=document.createElement('section');
      section.className='dpro-reservation-entry';
      section.id='reservation-guide';
      section.innerHTML=`<div class="or-shell dpro-reservation-entry__grid"><div class="dpro-reservation-entry__copy"><small>RESERVATION / WAITING / CUSTOMER / LINE / SUPPORT GUIDE</small><h2><span>必要な仕組みから、</span><em>DPROを選べる。</em></h2><p>日時予約、当日の順番受付、来店後の顧客管理、LINE予約、問い合わせ・相談対応。DPROなら、入口から履歴・次の対応・再来店まで、店舗の仕事に合わせてつなげられます。</p><div class="dpro-reservation-entry__chooser" aria-label="必要な仕組みを選ぶ"><a class="dpro-reservation-choice" href="reservation"><small>01 / RESERVATION SYSTEM</small><strong>日時を決めて予約したい</strong><span>美容室・サロン・スクール・訪問など。日時・担当者・メニュー・定員を事前に確保。</span><b>予約システムを見る →</b></a><a class="dpro-reservation-choice dpro-reservation-choice--waiting" href="waiting-system"><small>02 / WAITING &amp; RECEPTION</small><strong>当日の受付・待ち順を管理したい</strong><span>病院・動物病院・歯科・飲食店など。受付・待ち状況・呼び出し・到着までを管理。</span><b>順番待ち・受付を見る →</b></a><a class="dpro-reservation-choice dpro-reservation-choice--customer" href="customer-management"><small>03 / CUSTOMER MANAGEMENT</small><strong>顧客情報を次の来店につなげたい</strong><span>顧客台帳・カルテ・写真・来店履歴・次回予約・LINE再来店フォローまで。</span><b>店舗向け顧客管理を見る →</b></a><a class="dpro-reservation-choice dpro-reservation-choice--line" href="line-reservation"><small>04 / LINE RESERVATION</small><strong>LINEを予約の入口にしたい</strong><span>LINE公式から予約へ進み、店舗確認・顧客台帳・次回予約・再来店までつなぐ。</span><b>LINE予約を見る →</b></a><a class="dpro-reservation-choice dpro-reservation-choice--support" href="customer-support"><small>05 / CUSTOMER SUPPORT</small><strong>問い合わせ・相談対応を管理したい</strong><span>LINE・WEBから届く質問・相談・予約変更を、対応状況・履歴・顧客台帳へつなぐ。</span><b>店舗向け顧客対応を見る →</b></a></div><div class="dpro-reservation-entry__actions"><a class="dpro-reservation-entry__secondary" href="systems/">55システムから業種で探す</a></div></div><div class="dpro-reservation-entry__visual" aria-label="予約・受付・顧客管理・LINE予約・顧客対応をつなぐDPROのイメージ"><img src="reservation-industry-hair.webp" alt="美容室の予約と店舗管理をイメージした明るいビジュアル" width="1448" height="1086" loading="lazy"><span class="dpro-reservation-entry__caption"><small>RESERVATION / WAITING / CUSTOMER / LINE / SUPPORT FLOW</small><strong>入口を選んで、その先の業務まで。</strong><span>LINE・WEB → 予約 / 受付 / 問い合わせ → 顧客管理 → 履歴 → 再来店へ</span></span></div></div>`;
      const anchor=document.querySelector('#systems-handoff') || document.querySelector('#services');
      if(anchor){ anchor.id==='systems-handoff' ? anchor.before(section) : anchor.after(section); }
    }
  };
  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',run,{once:true}) : run();
})();
