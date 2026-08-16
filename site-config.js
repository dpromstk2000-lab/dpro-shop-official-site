window.DPRO_SITE_CONFIG = Object.freeze({
  productCount: 50,
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

/* DPRO SHOP SITE-BRUSHUP-4
   REAL CONNECTED CASE / DPRO PET CARE
   - Keeps the official hero / connected-flow / services unchanged.
   - Replaces the legacy V3.3 veterinary spotlight at DOM ready.
   - Inserts one proof section immediately after #connected-flow.
*/
(() => {
  'use strict';

  const PET_PRODUCT =
    'https://dpromstk2000-lab.github.io/dpro-line-systems-site/systems/pet-care.html';
  const PET_INTEGRATED_DEMO =
    'https://dpromstk2000-lab.github.io/DPRO-VET-QR/integrated-demo.html?clinic_code=dpro_vet_demo&demo=ready';

  const STYLE_ID = 'dpro-site-brushup4-pet-proof-style';
  const SECTION_ID = 'real-connected-case';

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sb4-proof{
        position:relative;
        overflow:hidden;
        padding:clamp(70px,8vw,118px) 0;
        background:
          radial-gradient(circle at 12% 20%,rgba(36,190,155,.14),transparent 28%),
          radial-gradient(circle at 88% 78%,rgba(42,109,95,.12),transparent 30%),
          linear-gradient(180deg,#f4fbf8 0%,#ffffff 52%,#f2f8f6 100%);
        color:#123a31;
      }
      .sb4-proof:before{
        content:"";
        position:absolute;inset:0;pointer-events:none;opacity:.36;
        background-image:
          linear-gradient(rgba(18,58,49,.045) 1px,transparent 1px),
          linear-gradient(90deg,rgba(18,58,49,.045) 1px,transparent 1px);
        background-size:36px 36px;
        mask-image:linear-gradient(to bottom,transparent,#000 18%,#000 82%,transparent);
      }
      .sb4-proof__inner{position:relative;z-index:1}
      .sb4-proof__head{
        max-width:900px;
        margin:0 auto clamp(34px,5vw,60px);
        text-align:center;
      }
      .sb4-proof__eyebrow{
        margin:0 0 12px;
        color:#087b6e;
        font-size:12px;
        font-weight:950;
        letter-spacing:.16em;
      }
      .sb4-proof__head h2{
        margin:0;
        color:#0d332a;
        font-size:clamp(34px,5.4vw,66px);
        line-height:1.08;
        letter-spacing:-.055em;
      }
      .sb4-proof__head p{
        max-width:780px;
        margin:18px auto 0;
        color:#506b64;
        font-size:clamp(15px,1.8vw,18px);
        line-height:1.9;
      }
      .sb4-proof__board{
        display:grid;
        grid-template-columns:minmax(0,.92fr) 54px minmax(250px,.74fr) 54px minmax(0,.92fr);
        gap:14px;
        align-items:stretch;
        padding:clamp(18px,3vw,30px);
        border:1px solid #cce3dc;
        border-radius:28px;
        background:rgba(255,255,255,.9);
        box-shadow:0 30px 80px rgba(17,72,60,.11);
        backdrop-filter:blur(12px);
      }
      .sb4-proof__entries{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
      }
      .sb4-proof__entry{
        display:flex;
        min-height:116px;
        flex-direction:column;
        justify-content:center;
        padding:16px;
        border:1px solid #d6e7e2;
        border-radius:16px;
        background:#fff;
      }
      .sb4-proof__entry small,
      .sb4-proof__output small,
      .sb4-proof__core small{
        display:block;
        margin-bottom:5px;
        color:#16806f;
        font-size:10px;
        font-weight:950;
        letter-spacing:.12em;
      }
      .sb4-proof__entry strong,
      .sb4-proof__output strong{
        color:#183e35;
        font-size:17px;
        line-height:1.35;
      }
      .sb4-proof__entry span,
      .sb4-proof__output span{
        margin-top:5px;
        color:#6a7e78;
        font-size:12px;
        line-height:1.55;
      }
      .sb4-proof__arrow{
        display:grid;
        place-items:center;
        color:#16806f;
        font-size:30px;
        font-weight:1000;
      }
      .sb4-proof__core{
        display:flex;
        min-height:246px;
        flex-direction:column;
        justify-content:center;
        padding:24px 20px;
        border-radius:22px;
        background:linear-gradient(145deg,#0d493c,#087b6e);
        color:#fff;
        text-align:center;
        box-shadow:0 22px 44px rgba(8,123,110,.18);
      }
      .sb4-proof__core small{color:#b8f2df}
      .sb4-proof__core strong{
        display:block;
        font-size:clamp(23px,2.5vw,32px);
        line-height:1.2;
      }
      .sb4-proof__core em{
        display:block;
        margin-top:7px;
        color:#d8f7ed;
        font-style:normal;
        font-size:12px;
        font-weight:800;
      }
      .sb4-proof__core ul{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:6px;
        margin:18px 0 0;
        padding:0;
        list-style:none;
      }
      .sb4-proof__core li{
        padding:7px 6px;
        border:1px solid rgba(255,255,255,.16);
        border-radius:9px;
        background:rgba(255,255,255,.08);
        font-size:11px;
        font-weight:850;
      }
      .sb4-proof__outputs{display:grid;gap:10px}
      .sb4-proof__output{
        display:flex;
        min-height:116px;
        flex-direction:column;
        justify-content:center;
        padding:16px;
        border:1px solid #d6e7e2;
        border-radius:16px;
        background:#fff;
      }
      .sb4-proof__output--sync{
        border-color:#b9ddd3;
        background:#edf9f5;
      }
      .sb4-proof__scope{
        margin:16px 0 0;
        padding:12px 15px;
        border-left:4px solid #16806f;
        border-radius:0 10px 10px 0;
        background:#f0f8f5;
        color:#4e675f;
        font-size:12px;
        line-height:1.7;
      }
      .sb4-proof__facts{
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:9px;
        margin-top:22px;
      }
      .sb4-proof__fact{
        min-height:88px;
        padding:13px;
        border:1px solid #d6e7e2;
        border-radius:14px;
        background:#fff;
      }
      .sb4-proof__fact b{
        display:block;
        margin-bottom:3px;
        color:#16806f;
        font-size:10px;
        letter-spacing:.11em;
      }
      .sb4-proof__fact strong{
        display:block;
        color:#183e35;
        font-size:13px;
        line-height:1.45;
      }
      .sb4-proof__actions{
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
        gap:10px;
        margin-top:26px;
      }
      .sb4-proof__actions a{
        display:inline-flex;
        min-height:50px;
        align-items:center;
        justify-content:center;
        padding:0 20px;
        border-radius:12px;
        text-decoration:none;
        font-size:14px;
        font-weight:950;
      }
      .sb4-proof__actions .is-demo{
        background:#087b6e;
        color:#fff;
        box-shadow:0 12px 28px rgba(8,123,110,.2);
      }
      .sb4-proof__actions .is-product{
        border:1px solid #bfd8d1;
        background:#fff;
        color:#173d35;
      }
      .sb4-proof__note{
        margin:13px auto 0;
        color:#6b7d78;
        text-align:center;
        font-size:11px;
        line-height:1.65;
      }
      @media(max-width:980px){
        .sb4-proof__board{
          grid-template-columns:1fr;
        }
        .sb4-proof__arrow{
          min-height:30px;
          transform:rotate(90deg);
        }
        .sb4-proof__core{min-height:210px}
        .sb4-proof__outputs{grid-template-columns:1fr 1fr}
        .sb4-proof__facts{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
      @media(max-width:640px){
        .sb4-proof{padding:58px 0}
        .sb4-proof__head{text-align:left}
        .sb4-proof__head p{margin-left:0}
        .sb4-proof__entries,
        .sb4-proof__outputs,
        .sb4-proof__facts{grid-template-columns:1fr}
        .sb4-proof__board{padding:14px;border-radius:20px}
        .sb4-proof__core ul{grid-template-columns:1fr 1fr}
        .sb4-proof__actions a{width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  function removeLegacyVetSpotlight() {
    document.querySelectorAll('.v33-vet-spotlight').forEach((el) => el.remove());
    const legacyStyle = document.getElementById('dpro-vet-spotlight-style');
    if (legacyStyle) legacyStyle.remove();
  }

  function createProofSection() {
    const existing = document.getElementById(SECTION_ID);
    if (existing) return existing;

    const section = document.createElement('section');
    section.className = 'sb4-proof';
    section.id = SECTION_ID;
    section.setAttribute('aria-labelledby', 'real-connected-case-title');

    section.innerHTML = `
      <div class="or-shell sb4-proof__inner">
        <header class="sb4-proof__head">
          <p class="sb4-proof__eyebrow">REAL CONNECTED CASE / DPRO PET CARE</p>
          <h2 id="real-connected-case-title">実際に、ここまで<br>つながっています。</h2>
          <p>LINE・WEB・現場をひとつにつなぐDPROの考え方を、動物病院向け「DPRO PET CARE」で実際に確認できます。ホームページやLINEから入った受付をDPROで確認し、病院側の設定変更を対応するホームページ・LINE表示へつなげる統合DEMOまで実装しています。</p>
        </header>

        <div class="sb4-proof__board" role="img" aria-label="WEB、LINE、電話、窓口の受付をDPRO PET CAREへ集約し、病院PC・iPadで確認。病院共通設定は対応するホームページとLINE表示へ連携する実証構成">
          <div class="sb4-proof__entries">
            <div class="sb4-proof__entry"><small>WEB</small><strong>ホームページ受付</strong><span>お客様がWEBから受付</span></div>
            <div class="sb4-proof__entry"><small>LINE</small><strong>LINE受付</strong><span>LINEから同じ病院データへ</span></div>
            <div class="sb4-proof__entry"><small>PHONE</small><strong>電話受付</strong><span>病院側で共通受付へ登録</span></div>
            <div class="sb4-proof__entry"><small>COUNTER</small><strong>窓口受付</strong><span>来院受付も同じ確認先へ</span></div>
          </div>

          <div class="sb4-proof__arrow" aria-hidden="true">→</div>

          <div class="sb4-proof__core">
            <small>ONE OPERATION CORE</small>
            <strong>DPRO<br>PET CARE</strong>
            <em>病院側の確認先をひとつに</em>
            <ul>
              <li>共通受付</li>
              <li>日時予約</li>
              <li>診療進行</li>
              <li>病院設定</li>
            </ul>
          </div>

          <div class="sb4-proof__arrow" aria-hidden="true">→</div>

          <div class="sb4-proof__outputs">
            <div class="sb4-proof__output">
              <small>HOSPITAL OPERATION</small>
              <strong>PC / iPad・スタッフ</strong>
              <span>受付・予約・診療進行を確認</span>
            </div>
            <div class="sb4-proof__output sb4-proof__output--sync">
              <small>SUPPORTED SYNC</small>
              <strong>病院設定 → HP / LINE</strong>
              <span>対応する診療状態・案内・予約可否へ</span>
            </div>
          </div>
        </div>

        <p class="sb4-proof__scope"><strong>連携範囲を明確に表示：</strong> WEB / LINE / 電話 / 窓口はDPROの共通受付で確認。病院共通設定は、実装済みの対応範囲でホームページ・LINE表示や予約可否へ連携します。</p>

        <div class="sb4-proof__facts" aria-label="統合LIVE DEMOで確認できる5つのポイント">
          <div class="sb4-proof__fact"><b>WEB</b><strong>ホームページ受付 → DPRO</strong></div>
          <div class="sb4-proof__fact"><b>LINE</b><strong>LINE受付 → 同じDPRO</strong></div>
          <div class="sb4-proof__fact"><b>RECEPTION</b><strong>4入口を共通受付で確認</strong></div>
          <div class="sb4-proof__fact"><b>SYNC</b><strong>病院設定 → HP / LINE</strong></div>
          <div class="sb4-proof__fact"><b>BOOKING</b><strong>診療状態に応じて予約可否</strong></div>
        </div>

        <div class="sb4-proof__actions">
          <a class="is-demo" href="${PET_INTEGRATED_DEMO}" target="_blank" rel="noopener">統合LIVE DEMOを見る ↗</a>
          <a class="is-product" href="${PET_PRODUCT}" target="_blank" rel="noopener">DPRO PET CAREを見る ↗</a>
        </div>
        <p class="sb4-proof__note">DPRO PET CAREは実証例のひとつです。DPROでは業種ごとの専用システムを展開しています。</p>
      </div>
    `;

    return section;
  }

  function applyBrushup4() {
    const connected = document.getElementById('connected-flow');
    if (!connected) return;

    removeLegacyVetSpotlight();
    installStyle();

    const section = createProofSection();
    connected.insertAdjacentElement('afterend', section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrushup4, { once: true });
  } else {
    applyBrushup4();
  }
})();
