(() => {
  "use strict";

  const READABILITY_STYLE_ID = "dpro-site-readability-r1";
  const ORIGINAL_SCRIPT_SOURCES = [
    "https://cdn.jsdelivr.net/gh/dpromstk2000-lab/dpro-shop-official-site@c4df1ea58c5f5fc4fa2dd2057a5b45e31216bfca/script.js",
    "https://raw.githack.com/dpromstk2000-lab/dpro-shop-official-site/c4df1ea58c5f5fc4fa2dd2057a5b45e31216bfca/script.js"
  ];

  const addReadabilityStyle = () => {
    if (document.getElementById(READABILITY_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = READABILITY_STYLE_ID;
    style.textContent = `
      /*
       * DPRO SHOP SITE-WIDE READABILITY R1
       * 小さい本文・補足・ナビ・カード説明を一段読みやすくする。
       * 画面モック内の細かな文字は、レイアウトを守るため対象外。
       */
      html {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }

      body {
        font-size: 16px;
        line-height: 1.75;
      }

      .global-nav a {
        font-size: 14px !important;
        font-weight: 750 !important;
      }

      .brand-copy strong {
        font-size: 13px !important;
      }

      .brand-copy small {
        font-size: 9px !important;
        line-height: 1.35 !important;
      }

      .eyebrow,
      .green-eyebrow,
      .sys-product-card-copy small,
      .catalog-card-copy small,
      .product-feature > span,
      .live-copy > span,
      .feature-showcase-copy > span,
      .phase-live-copy > span {
        font-size: 12px !important;
        line-height: 1.45 !important;
        letter-spacing: .12em !important;
        font-weight: 900 !important;
      }

      .hero-lead,
      .phase-hero-lead,
      .sys-hero-lead,
      .product-hero-copy > p:not(.eyebrow),
      .green-lead {
        font-size: clamp(16px, 1.25vw, 19px) !important;
        line-height: 1.95 !important;
      }

      .section-heading > p:last-child,
      .sys-section-head > p,
      .green-heading > p,
      .green-detail-copy > p,
      .green-final-inner > div > p,
      .catalog-note-inner > p,
      .product-proof-inner > p {
        font-size: 15px !important;
        line-height: 1.9 !important;
      }

      .service-card p,
      .experience-card p,
      .system-card small,
      .product-feature p,
      .live-copy p,
      .live-copy li,
      .feature-showcase-copy p,
      .feature-showcase-copy li,
      .phase-number p,
      .industry-panel p,
      .phase-live-copy p,
      .phase-principles p,
      .owner-problem-card p,
      .sales-summary-card li,
      .sales-problem-before strong,
      .sales-problem-after strong,
      .catalog-card-copy p,
      .sys-product-card-copy p,
      .green-card p,
      .green-card li,
      .green-problem-card p,
      .green-detail-list li,
      .green-ba-before,
      .green-ba-after,
      .green-security-card p,
      .green-fit-card p,
      .green-faq-answer,
      .green-price-card p,
      .green-price-card li,
      .green-price-note {
        font-size: 14px !important;
        line-height: 1.85 !important;
      }

      .sys-product-card-link,
      .catalog-card-cta,
      .text-link,
      .green-demo-note,
      .green-proof span,
      .green-role-chip,
      .green-value-strip span,
      .sys-publish-note {
        font-size: 13px !important;
        line-height: 1.7 !important;
      }

      .button,
      .green-button,
      .nav-cta,
      button {
        font-size: 14px;
      }

      .site-footer p,
      .site-footer a,
      .footer-bottom,
      .footer-legal-links a {
        font-size: 13px !important;
        line-height: 1.75 !important;
      }

      .faq-list summary,
      .green-faq-question {
        font-size: 16px !important;
        line-height: 1.65 !important;
      }

      input,
      select,
      textarea {
        font-size: 16px;
      }

      @media (max-width: 760px) {
        body {
          font-size: 16px;
        }

        .global-nav a {
          font-size: 15px !important;
        }

        .hero-lead,
        .phase-hero-lead,
        .sys-hero-lead,
        .product-hero-copy > p:not(.eyebrow),
        .green-lead,
        .section-heading > p:last-child,
        .sys-section-head > p,
        .green-heading > p {
          font-size: 15px !important;
          line-height: 1.9 !important;
        }

        .service-card p,
        .experience-card p,
        .system-card small,
        .product-feature p,
        .live-copy p,
        .live-copy li,
        .feature-showcase-copy p,
        .feature-showcase-copy li,
        .catalog-card-copy p,
        .sys-product-card-copy p,
        .green-card p,
        .green-card li,
        .green-problem-card p,
        .green-detail-list li,
        .green-faq-answer {
          font-size: 14px !important;
        }

        .site-footer p,
        .site-footer a {
          font-size: 13px !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => resolve(src);
      script.onerror = () => reject(new Error(`読み込み失敗: ${src}`));
      document.head.appendChild(script);
    });

  const loadOriginalScript = async () => {
    let lastError = null;
    for (const src of ORIGINAL_SCRIPT_SOURCES) {
      try {
        await loadScript(src);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("DPRO SHOP共通処理を読み込めませんでした。");
  };

  addReadabilityStyle();

  loadOriginalScript().catch((error) => {
    console.error("[DPRO SHOP] 共通処理の読み込みに失敗しました。", error);
  });
})();
