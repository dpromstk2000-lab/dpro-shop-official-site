(() => {
  "use strict";

  const READABILITY_STYLE_ID = "dpro-site-readability-r2";
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
       * DPRO SHOP SITE-WIDE READABILITY R2
       * 年配の方を含め、誰でも読みやすい文字サイズ・濃さ・行間へ調整。
       * 実画面モック、端末プレビュー、iframe内はレイアウト保護のため対象外。
       */

      :root {
        --muted: #4c5a6b !important;
        --sys-muted: #4c5a6b !important;
      }

      html {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        text-rendering: optimizeLegibility;
      }

      body {
        font-size: 18px !important;
        line-height: 1.9 !important;
        letter-spacing: .012em;
        -webkit-font-smoothing: antialiased;
      }

      /* ヘッダー・ブランド */
      .global-nav {
        gap: 23px !important;
      }

      .global-nav a {
        font-size: 15px !important;
        font-weight: 800 !important;
        color: rgba(255,255,255,.92) !important;
        line-height: 1.5 !important;
      }

      .brand-copy strong {
        font-size: 17px !important;
        font-weight: 900 !important;
      }

      .brand-copy small {
        margin-top: 5px !important;
        font-size: 10px !important;
        line-height: 1.4 !important;
        color: rgba(255,255,255,.76) !important;
      }

      .nav-cta {
        min-height: 48px !important;
        padding-inline: 20px !important;
      }

      /* パンくず・小見出し */
      .sys-breadcrumb,
      .green-breadcrumb,
      .breadcrumb {
        font-size: 13px !important;
        line-height: 1.65 !important;
        color: rgba(255,255,255,.80) !important;
      }

      .sys-breadcrumb-light {
        color: #4e5d6e !important;
      }

      .eyebrow,
      .green-eyebrow,
      .green-kicker,
      .sys-product-card-copy small,
      .catalog-card-copy small,
      .product-feature > span,
      .live-copy > span,
      .feature-showcase-copy > span,
      .phase-live-copy > span,
      .service-label,
      .service-number {
        font-size: 12px !important;
        line-height: 1.55 !important;
        letter-spacing: .12em !important;
        font-weight: 900 !important;
      }

      .eyebrow-dark {
        color: #4b5969 !important;
      }

      .eyebrow-light {
        color: rgba(255,255,255,.84) !important;
      }

      /* ファーストビュー説明 */
      .hero-lead,
      .phase-hero-lead,
      .sys-hero-lead,
      .product-hero-copy > p:not(.eyebrow),
      .green-lead,
      .green-hero-lead {
        font-size: clamp(18px, 1.35vw, 21px) !important;
        line-height: 1.95 !important;
        font-weight: 500 !important;
        color: rgba(255,255,255,.88) !important;
      }

      .hero-metrics small,
      .sys-hero-proof span,
      .green-proof span,
      .proof-strip-inner,
      .green-value-strip span {
        font-size: 13px !important;
        line-height: 1.65 !important;
        color: rgba(255,255,255,.82) !important;
      }

      .proof-strip-inner {
        color: #39495a !important;
      }

      /* セクション冒頭説明 */
      .section-heading > p,
      .sys-section-head > p,
      .green-heading > p,
      .green-detail-copy > p,
      .green-final-inner > div > p,
      .catalog-note-inner > p,
      .product-proof-inner > p,
      .mission-lead,
      .phase-intro,
      .catalog-hero-inner > p:not(.eyebrow) {
        font-size: 17px !important;
        line-height: 1.95 !important;
        font-weight: 500 !important;
        color: #435264 !important;
      }

      /* カード・機能説明 */
      .service-card p,
      .experience-card p,
      .system-card small,
      .product-feature p,
      .product-feature li,
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
      .green-price-note,
      .green-scope,
      .reform-exclusion-note {
        font-size: 16px !important;
        line-height: 1.9 !important;
        font-weight: 500 !important;
        color: #415164 !important;
      }

      .service-card-dark p,
      .section-dark p,
      .sys-final-cta p,
      .green-section-dark p,
      .green-cta p,
      .green-final-cta p,
      .phase-dark p,
      .site-footer p {
        color: rgba(255,255,255,.82) !important;
      }

      /* カード見出し */
      .service-card h3,
      .experience-card h3,
      .system-card h3,
      .product-feature h3,
      .catalog-card-copy h3,
      .sys-product-card-copy h3,
      .green-card h3,
      .green-problem-card h3,
      .green-security-card h3,
      .green-fit-card h3,
      .green-price-card h3 {
        line-height: 1.5 !important;
        font-weight: 900 !important;
      }

      .catalog-card-copy h3,
      .sys-product-card-copy h3,
      .green-card h3 {
        font-size: 20px !important;
      }

      /* リンク・補足 */
      .sys-product-card-link,
      .catalog-card-cta,
      .text-link,
      .green-demo-note,
      .green-role-chip,
      .sys-publish-note,
      .phase-mini-proof span,
      .product-proof-item p,
      .catalog-summary-grid p {
        font-size: 14px !important;
        line-height: 1.75 !important;
        font-weight: 700 !important;
      }

      main p a:not(.button):not(.green-button),
      main li a:not(.button):not(.green-button) {
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
      }

      /* ボタン・入力 */
      .button,
      .green-button,
      button,
      input[type="submit"],
      input[type="button"] {
        min-height: 50px;
        font-size: 15px !important;
        font-weight: 800 !important;
        line-height: 1.4 !important;
      }

      input,
      select,
      textarea {
        min-height: 48px;
        font-size: 16px !important;
        line-height: 1.6 !important;
      }

      a:focus-visible,
      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible,
      summary:focus-visible {
        outline: 3px solid #ffb347 !important;
        outline-offset: 3px !important;
      }

      /* FAQ */
      .faq-list summary,
      .green-faq-question {
        font-size: 17px !important;
        line-height: 1.7 !important;
        font-weight: 850 !important;
        color: #17283b !important;
      }

      .faq-list details p,
      .green-faq-answer {
        font-size: 16px !important;
        line-height: 1.9 !important;
        color: #405164 !important;
      }

      /* フッター */
      .site-footer p,
      .site-footer a,
      .footer-bottom,
      .footer-legal-links a {
        font-size: 14px !important;
        line-height: 1.8 !important;
      }

      .site-footer a {
        color: rgba(255,255,255,.86) !important;
      }

      .footer-links strong {
        font-size: 13px !important;
        color: #ffffff !important;
      }

      /* 薄い文字の濃度を改善 */
      .section-heading > p,
      .service-card p,
      .experience-card p,
      .catalog-card-copy p,
      .sys-product-card-copy p,
      .green-card p,
      .green-detail-copy > p,
      .green-faq-answer,
      .green-price-note,
      .sys-publish-note {
        opacity: 1 !important;
      }

      /*
       * 端末モック・画面プレビューは意図的に対象外。
       * 下記内部の文字サイズは変更せず、表示崩れを防止する。
       */
      .monitor-device,
      .phone-device,
      .product-monitor,
      .sys-product-visual,
      .catalog-visual,
      .product-live-placeholder,
      .green-monitor-shell,
      .green-phone-shell,
      .green-tablet-shell,
      .green-demo-frame,
      iframe {
        letter-spacing: normal;
      }

      @media (max-width: 960px) {
        .global-nav a {
          font-size: 16px !important;
        }

        .brand-copy strong {
          font-size: 16px !important;
        }
      }

      @media (max-width: 760px) {
        body {
          font-size: 17px !important;
          line-height: 1.9 !important;
        }

        .hero-lead,
        .phase-hero-lead,
        .sys-hero-lead,
        .product-hero-copy > p:not(.eyebrow),
        .green-lead,
        .green-hero-lead,
        .section-heading > p,
        .sys-section-head > p,
        .green-heading > p,
        .mission-lead {
          font-size: 17px !important;
          line-height: 1.9 !important;
        }

        .service-card p,
        .experience-card p,
        .system-card small,
        .product-feature p,
        .product-feature li,
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
        .green-faq-answer,
        .green-price-card p,
        .green-price-card li {
          font-size: 16px !important;
          line-height: 1.9 !important;
        }

        .catalog-card-copy h3,
        .sys-product-card-copy h3,
        .green-card h3 {
          font-size: 21px !important;
        }

        .site-footer p,
        .site-footer a,
        .footer-bottom,
        .footer-legal-links a {
          font-size: 14px !important;
        }
      }

      @media (max-width: 430px) {
        body {
          font-size: 17px !important;
        }

        .button,
        .green-button,
        button {
          font-size: 15px !important;
        }

        .eyebrow,
        .green-eyebrow,
        .green-kicker {
          font-size: 12px !important;
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
