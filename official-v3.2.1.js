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
    { status: 'LINE予約 → DPROへ自動反映', left: true, leftDirection: 'in', right: false, rightDirection: 'in' },
    { status: 'WEB予約 → DPROへ自動反映', left: false, leftDirection: 'in', right: true, rightDirection: 'in' },
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
