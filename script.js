/* DPRO SHOP OFFICIAL / FINAL SITE-WIDE SAFETY + IDENTITY R1 / 20260813 */
(() => {
  "use strict";

  const PRODUCT_SITE = "https://dpromstk2000-lab.github.io/dpro-line-systems-site/";
  const LEGACY_SOURCES = [
    "https://cdn.jsdelivr.net/gh/dpromstk2000-lab/dpro-shop-official-site@648871083f6b96bf0678441b683140d2edfc514b/script.js",
    "https://raw.githack.com/dpromstk2000-lab/dpro-shop-official-site/648871083f6b96bf0678441b683140d2edfc514b/script.js"
  ];

  const installRevealFailsafe = () => {
    const reveals = [...document.querySelectorAll(".reveal")];
    if (!reveals.length) return;
    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -20px 0px" });
    reveals.forEach((el) => observer.observe(el));
    requestAnimationFrame(() => {
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    });
  };

  const ensureFinalCss = () => {
    if (document.querySelector('link[href*="official-final.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "official-final.css?v=3.3-final";
    document.head.appendChild(link);
  };

  const enhanceLegacyOfficial = () => {
    const body = document.body;
    if (!body) return;
    if (body.classList.contains("official-v33") || body.classList.contains("official-v32")) return;
    if (location.pathname.includes("/systems/") || location.pathname.includes("/system-check")) return; // dedicated system layers own these pages.

    ensureFinalCss();
    body.classList.add("dpro-legacy-official");

    document.querySelectorAll(".brand-copy small").forEach((node) => {
      node.textContent = "OFFICIAL SITE";
    });

    const nav = document.querySelector(".global-nav,.or-nav");
    if (nav?.classList.contains("global-nav")) {
      nav.innerHTML = `
        <a href="line-build">LINE構築</a>
        <a href="line-operation">LINE運用</a>
        <a href="website">HP制作</a>
        <a href="systems/">DPROシステム</a>
        <a href="pricing">料金</a>
        <a href="about">DPRO SHOP</a>
        <a class="dpro-system-site-link" data-system-site-link href="${PRODUCT_SITE}" target="_blank" rel="noopener">PRODUCT SITE / 50製品を触る ↗</a>
        <a class="nav-cta" href="https://lin.ee/YxJGXV6D" target="_blank" rel="noopener">LINEで無料相談</a>`;
    } else if (nav && !nav.querySelector("[data-system-site-link]")) {
      const a = document.createElement("a");
      a.href = PRODUCT_SITE;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "dpro-system-site-link";
      a.dataset.systemSiteLink = "";
      a.textContent = "PRODUCT SITE / 50製品を触る ↗";
      const cta = nav.querySelector(".nav-cta,.or-nav__cta");
      cta ? nav.insertBefore(a, cta) : nav.appendChild(a);
    }

    document.querySelectorAll(`a[href^="${PRODUCT_SITE}"]`).forEach((a) => {
      if (a.closest(".global-nav,.or-nav")) return;
      a.classList.add("dpro-system-site-link");
      if (/49製品|DPRO製品サイト|実際に動く49製品/.test(a.textContent || "")) {
        a.textContent = "PRODUCT SITE / 50製品を実際に触る ↗";
      }
    });

    /* V3.3.5: legal pages stay accurate while avoiding developer-only service names. */
    if (body.classList.contains("privacy-page")) {
      document.querySelectorAll(".legal-document p").forEach((node) => {
        if ((node.textContent || "").includes("Cloudflare Pagesによるホスティング")) {
          node.textContent = "本サイトは、ホスティングサービス、Google Analytics、LINE公式アカウント、外部サイトへのリンク等を利用しています。これらの提供者が技術情報等を取り扱う場合は、各提供者の規約・プライバシーポリシーが適用されます。";
        }
      });
    }

    if (body.classList.contains("terms-page")) {
      document.querySelectorAll(".legal-document li").forEach((node) => {
        if ((node.textContent || "").includes("LINE、GitHub、Supabase等")) {
          node.textContent = "外部サービスや管理アカウント等、店舗側の権限でのみ可能な操作";
        }
      });
      document.querySelectorAll(".legal-document p").forEach((node) => {
        if ((node.textContent || "").includes("LINE、GitHub、Cloudflare、メールサービス")) {
          node.textContent = "LINE、公開環境、メールサービス、ドメイン管理、アクセス解析、問い合わせフォームなどの外部サービスを利用する場合があります。保守、障害、緊急のセキュリティ対応、外部サービス停止、災害、通信障害等により、サービスの全部または一部を一時停止する場合があります。";
        }
      });
    }

    if (body.classList.contains("error-page")) {
      const links = document.querySelector(".error-links");
      if (links && !links.querySelector(".dpro-error-product")) {
        const a = document.createElement("a");
        a.href = PRODUCT_SITE;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "dpro-error-product dpro-system-site-link";
        a.textContent = "50システムを実際に触る ↗";
        links.appendChild(a);
      }
    }
  };

  const load = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`読み込み失敗: ${src}`));
    document.head.appendChild(s);
  });

  const runLegacyCompat = async () => {
    let lastError = null;
    for (const src of LEGACY_SOURCES) {
      try {
        await load(src);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) console.warn("[DPRO SHOP] 既存処理の読込確認", lastError);
  };

  const run = () => {
    installRevealFailsafe();
    enhanceLegacyOfficial();
    runLegacyCompat();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();

(() => {
  'use strict';
  if (window.__DPRO_SHUKYAKU_TRACKER__) return;
  window.__DPRO_SHUKYAKU_TRACKER__ = true;

  const API = 'https://dpro-shukyaku-api.dpromstk2000.workers.dev/api/public/conversion';
  const EVENT_NAMES = new Set(['line_consult_click', 'phone_click', 'inquiry_submit', 'demo_view']);
  const safeStorage = (storage, key, factory) => {
    try {
      let value = storage.getItem(key);
      if (!value) { value = factory(); storage.setItem(key, value); }
      return value;
    } catch { return factory(); }
  };
  const randomId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const anonymousId = safeStorage(localStorage, 'dpro_shukyaku_anon_v1', randomId);
  const sessionKey = safeStorage(sessionStorage, 'dpro_shukyaku_session_v1', randomId);
  const params = new URLSearchParams(location.search);
  const attribution = (() => {
    const current = {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
    };
    try {
      const saved = JSON.parse(sessionStorage.getItem('dpro_shukyaku_attribution_v1') || '{}');
      const merged = { source: current.source || saved.source || '', medium: current.medium || saved.medium || '', campaign: current.campaign || saved.campaign || '' };
      sessionStorage.setItem('dpro_shukyaku_attribution_v1', JSON.stringify(merged));
      return merged;
    } catch { return current; }
  })();

  const send = (eventName, detail = {}) => {
    if (!EVENT_NAMES.has(eventName)) return;
    const payload = {
      eventId: randomId(), eventName, anonymousId, sessionKey,
      pageUrl: location.href, referrerUrl: document.referrer || '',
      source: attribution.source, medium: attribution.medium, campaign: attribution.campaign,
      targetUrl: detail.targetUrl || '', linkText: detail.linkText || '', placement: detail.placement || '',
    };
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        page_location: location.href, link_url: payload.targetUrl,
        link_text: payload.linkText, placement: payload.placement, transport_type: 'beacon',
      });
    }
    fetch(API, {
      method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).catch(() => {});
  };

  const classifyLink = (anchor) => {
    const explicit = anchor.closest('[data-dpro-conversion]')?.getAttribute('data-dpro-conversion');
    if (EVENT_NAMES.has(explicit)) return explicit;
    const href = anchor.href || '';
    if (/^tel:/i.test(anchor.getAttribute('href') || '')) return 'phone_click';
    if (/https?:\/\/(lin\.ee|line\.me|liff\.line\.me)\//i.test(href)) return 'line_consult_click';
    if (/dpromstk2000-lab\.github\.io\/dpro-line-systems-site/i.test(href) || anchor.hasAttribute('data-dpro-demo')) return 'demo_view';
    return '';
  };

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a,button,[data-dpro-conversion]');
    if (!anchor) return;
    const eventName = classifyLink(anchor);
    if (!eventName) return;
    send(eventName, {
      targetUrl: anchor.href || anchor.getAttribute('data-target-url') || '',
      linkText: (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
      placement: anchor.getAttribute('data-dpro-placement') || anchor.closest('header,footer,main,nav,section')?.tagName.toLowerCase() || '',
    });
  }, true);

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form[data-dpro-inquiry-form]');
    if (!form) return;
    send('inquiry_submit', { placement: form.id || form.getAttribute('name') || 'form' });
  }, true);

  window.DPRO_SHUKYAKU_TRACK = send;
})();
