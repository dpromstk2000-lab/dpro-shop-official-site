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

/* DPRO SHOP OFFICIAL V3.3 — ANIMAL HOSPITAL HP × LINE × DPRO SPOTLIGHT */
(() => {
  'use strict';
  const HP_DEMO = 'https://dpromstk2000-lab.github.io/DPRO-PET-CARE-HP-DEMO/';
  const VET_OFFICIAL = 'systems/vet';
  const VET_PRODUCT = 'https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/pet-care.html';

  function injectStyles(){
    if (document.getElementById('dpro-vet-spotlight-style')) return;
    const style = document.createElement('style');
    style.id = 'dpro-vet-spotlight-style';
    style.textContent = `
      .v33-vet-spotlight{padding:clamp(64px,8vw,112px) 0;background:linear-gradient(135deg,#f3fbf8 0%,#fff 54%,#eef7f4 100%);color:#112e29;overflow:hidden}
      .v33-vet-spotlight__grid{display:grid;grid-template-columns:minmax(0,.88fr) minmax(440px,1.12fr);gap:clamp(28px,5vw,68px);align-items:center}
      .v33-vet-spotlight__badge{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;padding:7px 11px;border:1px solid #bcded4;border-radius:999px;background:#fff;color:#087266;font-size:12px;font-weight:900;letter-spacing:.08em}
      .v33-vet-spotlight__badge:before{content:'NEW';padding:3px 6px;border-radius:999px;background:#087266;color:#fff;font-size:9px;letter-spacing:.12em}
      .v33-vet-spotlight h2{margin:0;font-size:clamp(30px,4.4vw,55px);line-height:1.16;letter-spacing:-.05em}
      .v33-vet-spotlight h2 em{display:block;color:#087b6e;font-style:normal}
      .v33-vet-spotlight__lead{margin:18px 0 0;max-width:640px;color:#526b66;font-size:16px;line-height:1.95}
      .v33-vet-spotlight__points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:22px 0 0;padding:0;list-style:none}
      .v33-vet-spotlight__points li{padding:11px 12px;border:1px solid #d5e8e2;border-radius:12px;background:rgba(255,255,255,.76);font-size:13px;font-weight:800}
      .v33-vet-spotlight__points li:before{content:'✓';margin-right:7px;color:#087b6e;font-weight:1000}
      .v33-vet-spotlight__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
      .v33-vet-spotlight__actions a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:12px;text-decoration:none;font-weight:900}
      .v33-vet-spotlight__actions .is-demo{background:#087b6e;color:#fff;box-shadow:0 12px 28px rgba(8,123,110,.2)}
      .v33-vet-spotlight__actions .is-guide{border:1px solid #b8d6ce;background:#fff;color:#153d36}
      .v33-vet-spotlight__actions .is-product{background:#9f1740;color:#fff}
      .v33-vet-browser{position:relative;border:1px solid #cfe2dc;border-radius:22px;background:#102d29;box-shadow:0 30px 70px rgba(11,56,48,.18);overflow:hidden}
      .v33-vet-browser__bar{height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:#d7ede7;font-size:11px;font-weight:900;letter-spacing:.07em}
      .v33-vet-browser__bar span:before{content:'●  ●  ●';margin-right:12px;color:#79c8b5;letter-spacing:4px}
      .v33-vet-browser__viewport{position:relative;height:clamp(370px,47vw,610px);background:#fff;overflow:hidden}
      .v33-vet-browser iframe{width:1280px;height:1780px;border:0;transform:scale(.54);transform-origin:0 0;pointer-events:none;background:#fff}
      .v33-vet-browser__tap{position:absolute;right:14px;bottom:14px;z-index:2;padding:8px 11px;border-radius:999px;background:rgba(7,48,42,.88);color:#fff;font-size:11px;font-weight:900}
      @media(max-width:980px){.v33-vet-spotlight__grid{grid-template-columns:1fr}.v33-vet-browser__viewport{height:500px}.v33-vet-browser iframe{transform:scale(.5)}}
      @media(max-width:640px){.v33-vet-spotlight{padding:54px 0}.v33-vet-spotlight__points{grid-template-columns:1fr}.v33-vet-spotlight__actions a{width:100%}.v33-vet-browser__viewport{height:390px}.v33-vet-browser iframe{width:980px;height:1700px;transform:scale(.4)}}
    `;
    document.head.appendChild(style);
  }

  function injectSpotlight(){
    if (document.querySelector('.v33-vet-spotlight')) return;
    const target = document.getElementById('auto-demo') || document.getElementById('systems-handoff');
    if (!target) return;
    injectStyles();
    const section = document.createElement('section');
    section.className = 'v33-vet-spotlight';
    section.setAttribute('aria-label','動物病院向けホームページ・LINE・DPRO統合デモ');
    section.innerHTML = `
      <div class="or-shell v33-vet-spotlight__grid">
        <div class="or-reveal">
          <p class="v33-vet-spotlight__badge">ANIMAL HOSPITAL / HP × LINE × DPRO</p>
          <h2>動物病院のホームページから、<em>受付・予約・LINE診察券まで。</em></h2>
          <p class="v33-vet-spotlight__lead">「今日診てもらえる？」をホームページで確認し、そのまま順番受付・日時指定予約・LINEペット診察券へ。病院側ではDPRO PET CARE LINEで受付・診察進行へつなげます。</p>
          <ul class="v33-vet-spotlight__points"><li>本日の診療・受付状況</li><li>当日順番受付</li><li>30分単位の日時予約</li><li>LINEペット診察券</li><li>獣医師・勤務予定</li><li>休診・お知らせ連携</li></ul>
          <div class="v33-vet-spotlight__actions">
            <a class="is-demo" href="${HP_DEMO}" target="_blank" rel="noopener" data-vet-spotlight="hp-demo">実際のHPデモを見る ↗</a>
            <a class="is-guide" href="${VET_OFFICIAL}">動物病院向け詳細を見る</a>
            <a class="is-product" href="${VET_PRODUCT}" target="_blank" rel="noopener">赤PRODUCTで実システムを見る ↗</a>
          </div>
        </div>
        <div class="v33-vet-browser or-reveal" aria-label="DPROどうぶつ病院ホームページ統合デモのプレビュー">
          <div class="v33-vet-browser__bar"><span>LIVE HP DEMO</span><b>DPRO PET CARE</b></div>
          <div class="v33-vet-browser__viewport"><iframe loading="lazy" title="DPROどうぶつ病院ホームページ統合デモ" src="${HP_DEMO}" tabindex="-1"></iframe><span class="v33-vet-browser__tap">実際の操作はデモを開く</span></div>
        </div>
      </div>`;
    target.after(section);

    section.querySelectorAll('[data-vet-spotlight]').forEach((link) => link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') window.gtag('event','select_content',{content_type:'vet_hp_integration_demo',link_url:link.href,page_location:location.href});
    }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectSpotlight, {once:true});
  else injectSpotlight();
})();
