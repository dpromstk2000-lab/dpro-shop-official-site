/* DPRO SHOP OFFICIAL TOP V3.2 — CONNECTED MOTION */
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

  const heroStage = document.querySelector('[data-v32-hero-stage]');
  const heroStatus = document.querySelector('[data-v32-live-status]');
  const heroStepEls = [...document.querySelectorAll('[data-v32-live-step]')];
  const leftRoute = document.querySelector('[data-v32-route="left"]');
  const rightRoute = document.querySelector('[data-v32-route="right"]');

  const scenarios = [
    { status: 'LINEで予約を受信 → DPROへ自動反映', left: true, right: false, direction: 'in' },
    { status: 'DPROで受付・顧客情報を一元管理', left: false, right: false, direction: 'out' },
    { status: '店舗PC / iPadへ予約状況を共有', left: false, right: false, direction: 'out' },
    { status: 'WEB更新・LINE通知・再来店フォローへ連動', left: false, right: true, direction: 'out' }
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
    if (leftRoute) leftRoute.classList.toggle('is-hot', scenario.left);
    if (rightRoute) {
      rightRoute.classList.toggle('is-hot', scenario.right);
      rightRoute.dataset.direction = scenario.direction;
    }
  };

  const startHero = () => {
    if (reduceMotion || !heroStage || heroTimer) return;
    heroTimer = window.setInterval(() => { if (heroVisible) setHeroScenario(heroIndex + 1); }, 3900);
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

  const flowStage = document.querySelector('[data-v32-flow-stage]');
  const flowCards = [...document.querySelectorAll('[data-v32-flow-card]')];
  const flowStatus = document.querySelector('[data-v32-flow-status]');
  const flowMessages = [
    '1. お客様がLINEから予約・問い合わせ',
    '2. DPROが受付し、顧客・予約情報へ反映',
    '3. 店舗PC / iPadでスタッフが確認',
    '4. 来店後はLINE通知・クーポンで次回へ'
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
