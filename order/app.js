import { ORDER_API_BASE, ORDER_QA_WRITE_TEST_MODE, ORDER_PRODUCTION_LIVE } from "./config.js";

// Auth tokens intentionally live only in this page's JavaScript memory.
const state = { accessToken: "", expiresAt: 0, authEpoch: 0, busyTicket: 0, scope: null, catalog: [], orders: [],
  adminSetup: null, importPreview: null, standard: {crm:null,company:null,line:null}, selectedCrmBuyer:null, selectedOnboardingBuyer:null, page: "dashboard", activeOrderId: null, busy: false, draftKey: "", draftPayload: null,
  shipKeys: new Map(), shipPayloads: new Map() };
const main = document.querySelector("#main");
const nav = document.querySelector("#nav");
const h = value => String(value ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const yen = value => `¥${Number(value || 0).toLocaleString("ja-JP")}`;
const labelStatus = {
  submitted: "承認待ち", confirmed: "承認済み", partially_shipped: "分納中",
  shipped: "出荷完了", cancelled: "取消済み",
};
const ALLOWED_ROLES = Object.freeze(["buyer", "seller_admin", "seller_sales", "seller_shipper"]);
const PRICE_ROLES = Object.freeze(["buyer", "seller_admin", "seller_sales"]);
const canViewPrices = () => PRICE_ROLES.includes(state.scope?.role);
const isBuyer = () => state.scope?.role === "buyer";
const isSeller = () => ["seller_admin", "seller_sales"].includes(state.scope?.role);
const canShip = () => ["seller_admin", "seller_shipper"].includes(state.scope?.role);
// Client-side defense in depth. Server-side roles and order status remain authoritative.
function canDecideOrder(order, action) {
  return !!order && order.status === "submitted" &&
    (action === "confirm" ? isSeller() : action === "cancel" && (isSeller() || isBuyer()));
}
const API = ORDER_API_BASE.replace(/\/$/, "");
const IS_R58N_QA = API === "https://dpro-order-r58n-qa-api.dpromstk2000.workers.dev";
// Deliberately false in all committed configs; write tests require an explicit isolated QA build.
// This is only a UI safety gate. Cloudflare Worker + DB release gates remain authoritative.
const WRITE_TEST_QA = IS_R58N_QA && ORDER_QA_WRITE_TEST_MODE === true;
// Fail closed for every other Worker endpoint, including typo/misconfigured URLs.
// Production write enablement requires a distinct, reviewed release path.
// Final release switch defaults OFF; turning it ON never bypasses server or DB write gates.
const READ_ONLY_QA = !((IS_R58N_QA && WRITE_TEST_QA) || (!IS_R58N_QA && ORDER_PRODUCTION_LIVE === true));
let toastTimer;
const STATUS_FILTERS = Object.freeze({all:"すべて",submitted:"承認待ち",shipping:"出荷対応中",confirmed:"承認済み",partially_shipped:"分納中",shipped:"出荷完了",cancelled:"取消済み"});
let currentOrderFilter = "all";
let currentOrderQuery = "";
function validOrderId(id) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id||"")); }
function formatDate(value) { const d=new Date(value); return Number.isFinite(d.getTime()) ? d.toLocaleString("ja-JP") : "日時不明"; }
function canChangeOrders() { return !READ_ONLY_QA; }
function noticeMode() { return IS_R58N_QA ? (READ_ONLY_QA ? "R58N隔離QA・閲覧専用" : "R58N隔離QA・書き込み検査専用（本番発注禁止）") : READ_ONLY_QA ? "本番接続準備中・発注停止" : ""; }

function notice(msg, error = false) {
  const node = document.querySelector("#toast");
  clearTimeout(toastTimer);
  node.textContent = msg;
  node.className = error ? "error" : "";
  node.hidden = false;
  toastTimer = setTimeout(() => { node.hidden = true; }, 4200);
}
function showLogin() {
  state.authEpoch++;
  // A logout must never leave the new login screen locked behind old traffic.
  state.busyTicket++; state.busy = false;
  state.accessToken = ""; state.scope = null; state.catalog = []; state.orders = []; state.adminSetup=null; state.importPreview=null; state.standard={crm:null,company:null,line:null}; state.selectedOnboardingBuyer=null;
  state.draftKey = ""; state.draftPayload = null; state.activeOrderId = null;
  state.shipKeys.clear(); state.shipPayloads.clear();
  state.expiresAt = 0; currentOrderFilter = "all"; currentOrderQuery = ""; nav.hidden = true;
  document.querySelector("#logout").hidden = true;
  document.querySelector("#userLabel").textContent = "";
  document.querySelector("#breadcrumb").textContent = "ログイン";
  const configured = /^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(API);
  main.innerHTML = `<section class="login panel"><p class="eyebrow">DPRO SYSTEMS / ORDER</p>
    <h1>卸売・法人向け受発注</h1><p class="lead">${configured ? "登録済みの担当者としてログインしてください。" : "接続先の設定が完了していません。導入担当者へ確認してください。"}</p>
    ${IS_R58N_QA ? `<div class="notice"><b>${h(noticeMode())}</b>：架空テストアカウントだけを使用してください。実際の注文・個人情報を入力しないでください。${READ_ONLY_QA ? "発注・承認・出荷は停止しています。" : "操作は架空QAの検証用です。実発注には使用しないでください。"}</div>` : READ_ONLY_QA ? '<div class="notice">本番接続準備中です。確認完了まで発注・承認・出荷はできません。</div>' : ""}
    ${configured ? `<form id="loginForm" class="form-stack">
      <label>メールアドレス<input type="email" name="email" autocomplete="username" maxlength="254" required></label>
      <label>パスワード<input type="password" name="password" autocomplete="current-password" required></label>
      <button type="submit" class="primary">ログイン</button></form>` : ""}
    <p class="note">パスワードは保存しません。画面を閉じると再ログインが必要です。</p></section>`;
}
async function api(path, method = "GET", body = null, token = state.accessToken) {
  const requestEpoch = state.authEpoch;
  // An expired response belonging to a previous user must never reset the current session.
  if (token && (requestEpoch !== state.authEpoch || token !== state.accessToken))
    throw new Error("ログイン状態が変更されました。古い通信結果を破棄しました。");
  if (READ_ONLY_QA && method !== "GET" && path !== "/api/login")
    throw new Error("安全確認中のため書き込み操作は停止しています。発注・承認・出荷・管理設定は利用できません。");
  if (!/^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(API)) throw new Error("接続先Workerの設定が必要です。");
  if (token && state.expiresAt && Date.now() > state.expiresAt - 3000) {
    showLogin(); throw new Error("認証期限が切れました。もう一度ログインしてください。");
  }
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  let resp;
  try {
    resp = await fetch(`${API}${path}`, { method, headers,
      body: body === null ? undefined : JSON.stringify(body),
      cache: "no-store", credentials: "omit", redirect: "error",
      signal: AbortSignal.timeout(15000) });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError")
      throw new Error("通信がタイムアウトしました。注文一覧を確認してから再送してください。");
    throw new Error("通信できませんでした。ネット接続を確認してください。注文送信後の場合は一覧を先に確認してください。");
  }
  let data;
  try { data = await resp.json(); } catch { throw new Error("通信結果を読み取れませんでした。"); }
  // Also reject old unauthenticated login responses after explicit logout or a new login.
  // Otherwise a late /api/login could silently restore a user who already logged out.
  if (requestEpoch !== state.authEpoch || (token && token !== state.accessToken))
    throw new Error("ログイン状態が変更されました。古い通信結果を破棄しました。");
  if (!resp.ok || !data.ok) {
    const code = data?.error?.code || "REQUEST_FAILED";
    if (["UNAUTHENTICATED", "NO_UNIQUE_ACTIVE_MEMBERSHIP"].includes(code) && token) showLogin();
    const labels = {
      LOGIN_FAILED: "メールアドレスまたはパスワードを確認してください。",
      UNAUTHENTICATED: "再ログインしてください。", NO_UNIQUE_ACTIVE_MEMBERSHIP: "所属が登録されていないか、複数あります。管理者へ確認してください。",
      PRODUCT_PRICE_OR_LOT_INVALID: "商品・契約単価・発注単位を確認してください。",
      IDEMPOTENCY_CONFLICT: "同じ送信番号で違う内容の注文を送れません。",
      INVALID_STATE: "注文状態が変わりました。更新して確認してください。",
      INSUFFICIENT_STOCK: "在庫が不足しています。数量を確認してください。",
      QUANTITY_EXCEEDS_REMAINING: "未出荷数量を超えています。",
      API_DISABLED: "現在は書き込み機能を停止しています。", NOT_CONFIGURED: "Workerの設定が未完了です。",
      ORDER_DB_WRITE_DISABLED: "データベースの書き込みは安全停止中です。", ORDER_DB_READ_DISABLED: "データベースの読み取りは安全停止中です。",
      FORGED_SCOPE_DENIED: "権限が確認できませんでした。", INVALID_LINES: "商品・数量の入力を確認してください。",
      INVALID_REQUEST_KEY: "送信番号が不正です。", DUPLICATE_PRODUCT: "同じ商品が重複しています。",
      SELLER_ONLY: "卸売側の操作権限が必要です。", BUYER_ONLY: "購入者の操作権限が必要です。",
      ADMIN_ONLY: "管理者権限が必要です。", ORDER_NOT_FOUND: "対象の注文が見つかりません。",
      DB_REQUEST_FAILED: "サーバー処理を確認できませんでした。管理担当者へ確認してください。",
      UPSTREAM_UNAVAILABLE: "接続先サービスに応答がありません。",
    };
    throw new Error(labels[code] || `処理できませんでした（${code}）。`);
  }
  return data.data ?? data;
}
async function sync() {
  const epoch = state.authEpoch, token = state.accessToken;
  const [scope, catalog, orders] = await Promise.all([
    api("/api/me"), api("/api/catalog"), api("/api/orders"),
  ]);
  if (epoch !== state.authEpoch || token !== state.accessToken)
    throw new Error("ログイン状態が変更されました。再ログインしてください。");
  if (!scope || !ALLOWED_ROLES.includes(scope.role) ||
      typeof scope.supplierName !== "string" ||
      (scope.role === "buyer" && typeof scope.buyerName !== "string") ||
      !Array.isArray(catalog) || !Array.isArray(orders))
    throw new Error("所属権限または応答形式を確認できません。管理者へ確認してください。");
  const setup = scope.role === "seller_admin" ? await api("/api/setup") : null;
  if (epoch !== state.authEpoch || token !== state.accessToken)
    throw new Error("ログイン状態が変更されました。再ログインしてください。");
  state.scope = scope; state.catalog = catalog; state.orders = orders; state.adminSetup = setup;
  // A refreshed admin setup invalidates a previous local CSV snapshot.
  state.importPreview = null;
}
function pageTitle(eyebrow, title, desc) {
  return `<p class="eyebrow">${h(eyebrow)}</p><h1>${h(title)}</h1><p class="lead">${h(desc)}</p>`;
}
function statusTag(status) {
  return `<span class="status status-${h(status)}">${h(labelStatus[status] || status)}</span>`;
}
// Contract prices and quantities are integral values. Use BigInt throughout display/CSV
// to avoid silent rounding for large B2B orders. Do not convert invalid data to zero.
function exactLineAmount(line) {
  const p = Number(line?.priceYen), q = Number(line?.quantity);
  if (line?.priceYen == null || !Number.isSafeInteger(p) || !Number.isSafeInteger(q) || p < 0 || q < 0)
    return null;
  return BigInt(p) * BigInt(q);
}
function exactOrderAmount(order) {
  let result = 0n;
  for (const line of order.lines || []) {
    const subtotal = exactLineAmount(line);
    if (subtotal === null) return null;
    result += subtotal;
  }
  return result;
}
function orderRows(orders) {
  if (!orders.length) return `<div class="empty">対象の注文はありません。</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>注文日時</th><th>取引先</th><th>商品</th><th>状態</th><th>商品金額（税抜）</th><th>操作</th></tr></thead><tbody>
    ${orders.map(o => `<tr><td>${h(formatDate(o.createdAt))}<small><br>${h(o.id.slice(0,8))}</small></td>
    <td>${h(o.buyerName)}</td>
    <td>${(o.lines||[]).map(l => `${h(l.name)}<small>［${h(l.sku)}］</small> × ${h(l.quantity)}<small>（出荷済み ${h(l.shipped)}）</small>`).join("<br>")}</td>
    <td>${statusTag(o.status)}</td><td>${!canViewPrices() ? "閲覧権限なし" : exactOrderAmount(o) === null ? "金額確認要" : summaryYen(exactOrderAmount(o))}</td>
    <td><button type="button" class="secondary" data-action="detail" data-id="${h(o.id)}">詳細</button>
    ${canDecideOrder(o,"confirm") && !READ_ONLY_QA ? `<div class="row-actions"><button data-action="confirm" data-id="${h(o.id)}">承認</button><button data-action="cancel" data-id="${h(o.id)}">取消</button></div>` : ""}
    ${canDecideOrder(o,"cancel") && isBuyer() && !READ_ONLY_QA ? `<div class="row-actions"><button data-action="cancel" data-id="${h(o.id)}">注文を取消</button></div>` : ""}</td></tr>`).join("")}
    </tbody></table></div>`;
}
function remainingShipment(line) {
  const quantity = Number(line.quantity), shipped = Number(line.shipped);
  return Number.isSafeInteger(quantity) && Number.isSafeInteger(shipped) &&
    quantity >= 0 && shipped >= 0 && shipped <= quantity ? String(quantity - shipped) : "要確認";
}
function orderDetailPage() {
  const order = state.orders.find(o => o.id === state.activeOrderId);
  if (!order) return pageTitle("ORDER DETAILS", "注文詳細", "現在ログイン中の会社から閲覧できる注文だけを表示します。") +
    '<section class="panel empty">この注文は表示できません。注文一覧から再確認してください。</section><div class="actions"><button type="button" class="secondary" data-page="orders">注文一覧に戻る</button></div>';
  const seePrice = canViewPrices();
  const lines = (order.lines || []).map(l => {
    const remaining = remainingShipment(l);
    const subtotal = seePrice ? exactLineAmount(l) : null;
    return `<tr><td><b>${h(l.name)}</b><small>${h(l.sku)}</small></td>
      <td>${h(l.quantity)} ${h(l.unit)}</td><td>${h(l.shipped)} ${h(l.unit)}</td>
      <td>${h(remaining)} ${h(l.unit)}</td>
      ${seePrice ? `<td>${subtotal === null ? "要確認" : h(summaryYen(BigInt(l.priceYen)))}</td>
        <td>${subtotal === null ? "要確認" : h(summaryYen(subtotal))}</td>` : ""}</tr>`;
  }).join("");
  const mobileRows = (order.lines || []).map(l => {
    const remaining = remainingShipment(l);
    const subtotal = seePrice ? exactLineAmount(l) : null;
    return `<article class="detail-mobile-card"><h3>${h(l.name)}</h3><p class="small">SKU：${h(l.sku)}</p>
      <div class="line"><b>発注数</b><span>${h(l.quantity)} ${h(l.unit)}</span></div>
      <div class="line"><b>出荷済数</b><span>${h(l.shipped)} ${h(l.unit)}</span></div>
      <div class="line"><b>未出荷数</b><span>${h(remaining)} ${h(l.unit)}</span></div>
      ${seePrice ? `<div class="line"><b>契約単価（税抜）</b><span>${subtotal === null ? "要確認" : h(summaryYen(BigInt(l.priceYen)))}</span></div>
        <div class="line"><b>小計（税抜）</b><span>${subtotal === null ? "要確認" : h(summaryYen(subtotal))}</span></div>` : ""}
    </article>`;
  }).join("");
  const total = seePrice ? exactOrderAmount(order) : null;
  return pageTitle("ORDER DETAILS", "注文詳細", "発注数・出荷済数・未出荷数を確認できます。") +
    `<section class="panel detail-panel"><div class="line"><b>注文番号</b><span>${h(order.id)}</span></div>
      <div class="line"><b>注文日時</b><span>${h(formatDate(order.createdAt))}</span></div>
      <div class="line"><b>取引先</b><span>${h(order.buyerName)}</span></div>
      <div class="line"><b>注文状態</b><span>${statusTag(order.status)}</span></div>
      <h2>注文明細</h2><div class="table-wrap detail-desktop-table"><table><thead><tr><th>商品・SKU</th>
      <th>発注数</th><th>出荷済数</th><th>未出荷数</th>
      ${seePrice ? "<th>税抜契約単価</th><th>税抜小計</th>" : ""}</tr></thead>
      <tbody>${lines || `<tr><td colspan="${seePrice ? 6 : 4}">明細がありません。</td></tr>`}</tbody></table></div><div class="detail-mobile-list">${mobileRows || "明細がありません。"}</div>
      ${seePrice ? `<p class="detail-total">税抜商品合計：${total === null ? "要確認" : h(summaryYen(total))}</p>` : `<p class="note">出荷担当者には契約単価・金額を表示しません。</p>`}
    </section><div class="actions"><button type="button" class="secondary" data-page="orders">注文一覧に戻る</button></div>`;
}
// Read-only work queue derives exclusively from the orders already returned to
// the authenticated scope; it never broadens server query access or authorizes a write.
function workQueueBuckets(orders = state.orders, role = state.scope?.role) {
  const canReview = role === "seller_admin" || role === "seller_sales";
  const canDispatch = role === "seller_admin" || role === "seller_shipper";
  const oldestFirst = list => list.slice().sort((a, b) => {
    const first = Date.parse(a.createdAt), second = Date.parse(b.createdAt);
    if (!Number.isFinite(first) && !Number.isFinite(second)) return 0;
    if (!Number.isFinite(first)) return 1;
    if (!Number.isFinite(second)) return -1;
    return first - second;
  });
  return {
    approvals: canReview ? oldestFirst(orders.filter(o => o.status === "submitted")) : [],
    dispatches: canDispatch ? oldestFirst(orders.filter(o =>
      ["confirmed", "partially_shipped"].includes(o.status) &&
      (o.lines || []).some(l => Number.isSafeInteger(Number(l.quantity)) &&
        Number.isSafeInteger(Number(l.shipped)) &&
        Number(l.quantity) > Number(l.shipped)))) : [],
  };
}
function workQueuePage() {
  if (isBuyer()) return pageTitle("WORK QUEUE", "担当業務一覧", "購入者は注文一覧から発注状況を確認できます。") +
    `<section class="panel"><button class="secondary" data-page="orders">注文一覧を開く</button></section>`;
  const queues = workQueueBuckets();
  const review = ["seller_admin", "seller_sales"].includes(state.scope?.role);
  const dispatch = ["seller_admin", "seller_shipper"].includes(state.scope?.role);
  const section = (heading, list, action, empty) => `<section class="panel work-queue-section">
    <div class="work-queue-heading"><h2>${h(heading)}（${list.length}件）</h2>
    <button class="secondary" data-action="queue-filter" data-status="${h(action)}">注文一覧で確認</button></div>
    ${list.length ? orderRows(list) : `<div class="empty">${h(empty)}</div>`}</section>`;
  return pageTitle("WORK QUEUE", "未処理業務一覧", "自分の担当権限に対応する注文を古い順で表示します。注文の操作権限はサーバーで最終判定します。") +
    `<div class="notice">表示元は現在ログイン中の会社の注文一覧（最大100件）です。全期間の件数ではありません。
    ${READ_ONLY_QA ? "現在は安全確認中の閲覧専用です。承認・出荷操作はできません。" : "実行前に注文内容を確認してください。"}</div>` +
    `<div class="metrics"><div class="metric"><span>承認待ち（担当分）</span><strong>${queues.approvals.length}件</strong></div>
    <div class="metric"><span>出荷残あり（担当分）</span><strong>${queues.dispatches.length}件</strong></div></div>` +
    (review ? section("承認確認待ち", queues.approvals, "submitted", "承認待ちの注文はありません。") : "") +
    (dispatch ? section("出荷・分納の残数あり", queues.dispatches, "shipping", "出荷残のある注文はありません。") : "") +
    (!review && !dispatch ? `<section class="panel empty">この権限では処理対象業務はありません。</section>` : "");
}
function dashboard() {
  const pending = state.orders.filter(o => o.status === "submitted");
  const confirmed = state.orders.filter(o => ["confirmed", "partially_shipped"].includes(o.status));
  return pageTitle("OVERVIEW", isBuyer() ? "発注状況" : "今日の受注状況", READ_ONLY_QA ? "接続確認中のため閲覧専用です。発注・承認・出荷はできません。" : "必要な業務をここから確認できます。") +
    `<div class="notice">所属：${h(state.scope.supplierName)}${state.scope.buyerName ? ` ／ ${h(state.scope.buyerName)}` : ""}　｜　${h(state.scope.role)}</div>
    <div class="metrics"><div class="metric"><span>注文総数（直近100件）</span><strong>${state.orders.length}件</strong></div>
    <div class="metric"><span>承認待ち</span><strong>${pending.length}件</strong></div>
    <div class="metric"><span>出荷対応中</span><strong>${confirmed.length}件</strong></div></div>
    <div class="actions">${isBuyer() && !READ_ONLY_QA ? `<button class="primary" data-page="new">＋ 新規発注</button>` : ""}${!isBuyer() ? `<button class="secondary" data-page="queue">担当する未処理業務を確認</button>` : ""}<button class="secondary" data-page="orders">注文をすべて確認</button><button class="secondary" data-action="refresh">最新情報に更新</button></div>
    <section class="panel"><h2>最近の注文</h2>${orderRows(state.orders.slice(0,5))}</section>`;
}
function visibleOrders() {
  const query=currentOrderQuery.trim().toLocaleLowerCase("ja-JP");
  return state.orders.filter(o => (currentOrderFilter==="all" || o.status===currentOrderFilter ||
    (currentOrderFilter==="shipping" && ["confirmed","partially_shipped"].includes(o.status))) &&
    (!query || [o.id,o.buyerName,o.status,...(o.lines||[]).flatMap(l=>[l.name,l.sku])]
      .some(x => String(x??"").toLocaleLowerCase("ja-JP").includes(query))));
}
function csvCell(value) {
  let cell = String(value ?? "").replace(/\r\n?/g,"\n");
  // Defend against CSV/Excel formula injection even when prefixed by whitespace.
  if (/^\s*[=+@-]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replace(/"/g,'""') + '"';
}
function buildOrderCsv(orders) {
  const seePrice = canViewPrices();
  const header = ["注文番号","注文日時","取引先","状態","商品コード","商品名","発注数","出荷済数","単位","税抜単価","税抜小計"];
  const rows = [header];
  for (const o of orders) {
    for (const l of (o.lines || [])) {
      const subtotal = exactLineAmount(l);
      const valid = seePrice && subtotal !== null;
      rows.push([o.id,formatDate(o.createdAt),o.buyerName,labelStatus[o.status] || o.status,
        l.sku,l.name,l.quantity,l.shipped,l.unit,valid?String(l.priceYen):"",valid?subtotal.toString():""]);
    }
  }
  return "\ufeff" + rows.map(cols => cols.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
function buildAdminCsv(type) {
  if (state.scope?.role !== "seller_admin" || !state.adminSetup)
    throw new Error("卸売管理者のみエクスポートできます。");
  const setup = state.adminSetup;
  const buyers = new Map((setup.buyers||[]).map(b=>[b.id,b]));
  const products = new Map((setup.products||[]).map(p=>[p.id,p]));
  let data;
  if(type === "buyers") data = [
    ["取引先コード","会社名","支払条件"],
    ...(setup.buyers||[]).map(b=>[b.code,b.name,b.paymentTerms])
  ];
  else if(type === "products") data = [
    ["商品コード","商品名","単位","発注ロット","現在庫","引当済み"],
    ...(setup.products||[]).map(p=>[p.sku,p.name,p.unit,p.lot,p.onHand,p.reserved])
  ];
  else if(type === "prices") data = [
    ["取引先コード","取引先名","商品コード","商品名","契約単価（税抜円）"],
    ...(setup.prices||[]).map(p=>[buyers.get(p.buyerId)?.code,
      buyers.get(p.buyerId)?.name,products.get(p.productId)?.sku,
      products.get(p.productId)?.name,p.priceYen])
  ];
  else throw new Error("出力対象を確認してください。");
  return "\ufeff" + data.map(row=>row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
function downloadCsv(csv,name) {
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href=url; link.download=name; link.style.display="none";
  document.body.appendChild(link);
  try { link.click(); } finally {
    link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
}
function ordersPage() {
  const filtered=visibleOrders();
  return pageTitle("ORDERS", "注文一覧", "注文は最大100件まで表示します。状態別・取引先・商品名で検索できます。") +
    `<section class="panel"><div class="order-tools"><label>状態で絞り込み
      <select id="orderStatusFilter">${Object.entries(STATUS_FILTERS).map(([value,label])=>`<option value="${h(value)}" ${value===currentOrderFilter?"selected":""}>${h(label)}</option>`).join("")}</select></label>
      <label>検索<input id="orderSearch" type="search" maxlength="100" value="${h(currentOrderQuery)}" placeholder="商品名・取引先・注文番号"></label>
      <span class="small" aria-live="polite">表示 ${filtered.length} / ${state.orders.length} 件</span><button class="secondary" data-action="export-csv" type="button" ${!filtered.length?"disabled":""}>表示中の注文をCSV出力</button></div>
      ${orderRows(filtered)}</section>`;
}
function catalogPage() {
  const showPrices = canViewPrices();
  return pageTitle("CATALOG", "商品・契約単価", isBuyer() ? "自社に設定された契約単価の商品だけを表示します。" : "卸売会社で有効な商品です。取引先別単価は発注者のログインにより確定します。") +
    `<section class="panel"><div class="table-wrap"><table><thead><tr><th>商品名・SKU</th><th>単位</th><th>発注ロット</th>${showPrices ? "<th>契約単価（税抜）</th>" : ""}</tr></thead><tbody>
    ${state.catalog.map(p => `<tr><td><b>${h(p.name)}</b><small><br>${h(p.sku)}</small></td><td>${h(p.unit)}</td><td>${h(p.lot)}</td>${showPrices ? `<td>${p.priceYen == null ? "―" : yen(p.priceYen)}</td>` : ""}</tr>`).join("") || `<tr><td colspan="${showPrices ? 4 : 3}">登録商品はありません。</td></tr>`}
    </tbody></table></div></section>`;
}
function calculateOrderPreview(lines, catalog) {
  let total = 0n;
  const items = [];
  if (!Array.isArray(lines) || lines.length > 40) throw new Error("商品数を確認してください。");
  for (const line of lines) {
    const product = catalog.find(p => p.id === line.productId);
    if (!product) throw new Error("商品が更新されました。画面を再読み込みしてください。");
    const qty = Number(line.quantity), lot = Number(product.lot), price = Number(product.priceYen);
    if (!Number.isSafeInteger(qty) || qty <= 0 || qty > 999999999 ||
        !Number.isSafeInteger(lot) || lot <= 0 || qty % lot !== 0)
      throw new Error(`${product.name}の発注数量は${lot}単位で入力してください。`);
    if (!Number.isSafeInteger(price) || price < 0 || price > 1000000000)
      throw new Error(`${product.name}の契約単価を確認してください。`);
    const subtotal = BigInt(qty) * BigInt(price);
    total += subtotal; items.push({ name:product.name, quantity:qty, unit:product.unit,
      subtotalYen:subtotal.toString() });
  }
  return { items, itemCount:items.length, totalYen:total.toString() };
}
function summaryYen(value) { return "¥" + BigInt(value).toLocaleString("ja-JP"); }
function orderPreviewHtml(summary) {
  return summary.itemCount
    ? `<b>発注内容の確認（税抜概算）</b><ul>${summary.items.map(i=>
      `<li>${h(i.name)} × ${i.quantity}${h(i.unit)}：${summaryYen(i.subtotalYen)}</li>`).join("")}</ul>
      <strong>合計：${summaryYen(summary.totalYen)}</strong><p class="note">契約単価の最終確定は発注受付時です。</p>`
    : "<b>商品と数量を入力すると合計金額が表示されます。</b>";
}
function safeOrderPreviewHtml(lines) {
  try { return orderPreviewHtml(calculateOrderPreview(lines,state.catalog)); }
  catch (error) { return `<span class="helper">${h(error.message || "数量を確認してください。")}</span>`; }
}
function updateOrderPreview(form) {
  const target = document.querySelector("#orderPreview");
  if (!target || !isBuyer()) return;
  const data = new FormData(form);
  const lines = state.catalog.map(p=>({productId:p.id,quantity:Number(data.get(`qty-${p.id}`)||0)}))
    .filter(l=>l.quantity!==0);
  try { target.innerHTML = orderPreviewHtml(calculateOrderPreview(lines,state.catalog)); }
  catch (error) { target.textContent = error.message || "数量を確認してください。"; }
}
function newOrderPage() {
  if (READ_ONLY_QA) return pageTitle("READ ONLY", "発注は停止中", "接続確認が完了するまで発注できません。");
  if (!isBuyer()) return pageTitle("ORDER", "新規発注", "発注は購入者のアカウントから行ってください。");
  if (!state.catalog.length) return pageTitle("ORDER", "新規発注", "契約単価が設定された商品がありません。卸売会社へ確認してください。");
  if (!state.draftKey) state.draftKey = crypto.randomUUID();
  const pending = state.draftPayload;
  return pageTitle("ORDER", "新規発注", "数量はロットの倍数で入力してください。単価・税率は送信時点で固定します。") +
    `<form id="orderForm" class="two-col"><section class="panel"><h2>商品と数量</h2>
    ${state.catalog.map(p => `<label style="margin:15px 0">${h(p.name)}<small class="small">　${h(p.sku)} ／ ${yen(p.priceYen)} ／ ロット ${h(p.lot)}${h(p.unit)}</small>
      <input type="number" name="qty-${h(p.id)}" min="0" step="${h(p.lot)}" value="${h(pending?.lines.find(l => l.productId === p.id)?.quantity ?? 0)}" inputmode="numeric"></label>`).join("")}</section>
    <section class="panel"><h2>注文内容</h2>
    <div id="orderPreview" class="order-preview" role="status" aria-live="polite">${pending ? safeOrderPreviewHtml(pending.lines) : "商品と数量を入力すると合計金額が表示されます。"}</div>
    <label>連絡事項<textarea name="note" maxlength="500" rows="4" placeholder="必要な場合のみ">${h(pending?.note ?? "")}</textarea></label>
    <p class="note">送信後の承認・取消は「注文一覧」から確認できます。通信エラー時の二重注文を防ぐため送信番号は維持されます。</p>
    ${pending ? `<div class="notice">前回の送信結果が未確認です。同じ内容なら安全に再送できます。内容を変更する場合は、注文一覧で受付状況を確認してから送信番号を新しくしてください。<button type="button" class="secondary" data-action="reset-draft">別の発注を作成する</button></div>` : ""}
    <button type="submit" class="primary">発注を送信する</button></section></form>`;
}
function shippingPage() {
  if (READ_ONLY_QA) return pageTitle("READ ONLY", "出荷は停止中", "接続確認が完了するまで出荷できません。");
  if (!canShip()) return pageTitle("SHIPPING", "出荷処理", "出荷権限のある担当者のみ実行できます。");
  const shipping = state.orders.filter(o => ["confirmed", "partially_shipped"].includes(o.status));
  return pageTitle("SHIPPING", "出荷・分納", "在庫を確認し、出荷した数量だけ入力してください。分納と残数の管理に対応します。") +
    (!shipping.length ? `<section class="panel empty">出荷待ちの注文はありません。</section>` : shipping.map(o => `
    <section class="panel" style="margin:16px 0"><h2>${h(o.buyerName)}　${statusTag(o.status)}</h2>
    <p class="small">注文番号 ${h(o.id.slice(0,8))}　注文日時 ${h(formatDate(o.createdAt))}</p>
    <form class="shipmentForm" data-order-id="${h(o.id)}">
    ${(o.lines||[]).filter(l=>Number(l.quantity)>Number(l.shipped)).map(l=>`<label style="margin:12px 0">${h(l.name)} ／ 未出荷 ${h(Number(l.quantity)-Number(l.shipped))}${h(l.unit)}
      <input type="number" name="line-${h(l.id)}" min="0" step="1" value="${h(state.shipPayloads.get(o.id)?.lines.find(p => p.lineId === l.id)?.quantity ?? 0)}" inputmode="numeric"></label>`).join("")}
    ${state.shipPayloads.has(o.id) ? `<p class="helper">前回の送信結果が未確認です。内容を変えずに再送してください。出荷状況は更新して確認できます。</p>` : ""}
    <button class="primary" type="submit">今回の出荷数量を登録</button></form></section>`).join(""));
}
// V2.8.5: local master-data integrity diagnostics. This is a dashboard report,
// NOT a commercial go-live gate, and does not alter any account or data.
function diagnoseAdminMasterSetup(setup) {
  if (!setup || !Array.isArray(setup.buyers) || !Array.isArray(setup.products) ||
      !Array.isArray(setup.prices)) return null;
  const buyers = setup.buyers, products = setup.products, prices = setup.prices;
  const hasId = item => typeof item?.id === "string" && item.id.length > 0;
  const isWhole = value => Number.isSafeInteger(Number(value)) &&
    value !== null && value !== undefined && String(value).trim() !== "";
  const buyerIds = new Set(buyers.filter(hasId).map(x => x.id));
  const productIds = new Set(products.filter(hasId).map(x => x.id));
  const buyerCodes = new Set(), productCodes = new Set(), pairKeys = new Set();
  const problems = [];
  function checkCode(items,field,seen,code) {
    for (const item of items) {
      const key = String(item?.[field] ?? "").toLocaleUpperCase("en-US");
      if (!key || seen.has(key) || !hasId(item)) problems.push(code);
      if (key) seen.add(key);
    }
  }
  checkCode(buyers,"code",buyerCodes,"BUYER_CODE_OR_ID_INVALID");
  checkCode(products,"sku",productCodes,"PRODUCT_SKU_OR_ID_INVALID");
  if (buyerIds.size !== buyers.length) problems.push("BUYER_ID_DUPLICATE_OR_MISSING");
  if (productIds.size !== products.length) problems.push("PRODUCT_ID_DUPLICATE_OR_MISSING");
  for (const product of products) {
    if (![product?.lot,product?.onHand,product?.reserved].every(isWhole) ||
        Number(product.lot) < 1 || Number(product.onHand) < 0 ||
        Number(product.reserved) < 0 || Number(product.reserved) > Number(product.onHand))
      problems.push("STOCK_OR_LOT_INVALID");
  }
  let priceZeroCount=0;
  for (const price of prices) {
    if (!buyerIds.has(price?.buyerId) || !productIds.has(price?.productId)) {
      problems.push("PRICE_REFERENCE_INVALID"); continue;
    }
    const pair=price.buyerId+"/"+price.productId;
    if (pairKeys.has(pair)) problems.push("DUPLICATE_PRICE_PAIR");
    else pairKeys.add(pair);
    if (!isWhole(price.priceYen) || Number(price.priceYen)<0 || Number(price.priceYen)>1_000_000_000)
      problems.push("PRICE_AMOUNT_INVALID");
    else if (Number(price.priceYen)===0) priceZeroCount++;
  }
  const combinations=BigInt(buyers.length)*BigInt(products.length);
  const missing=combinations-BigInt(pairKeys.size);
  return Object.freeze({buyerCount:buyers.length,productCount:products.length,
    priceCount:prices.length,validPairCount:pairKeys.size,
    unpricedPairCount:(missing>0n?missing:0n).toString(),
    zeroPriceCount:priceZeroCount,problemCount:problems.length,
    problems:Object.freeze(problems.slice(0,10)),truncated:problems.length>10,
    writesPerformed:false,commercialReleaseApproved:false});
}
const MASTER_AUDIT_LABELS = Object.freeze({
  BUYER_CODE_OR_ID_INVALID:"取引先コードまたは内部識別子に不足・重複があります",
  BUYER_ID_DUPLICATE_OR_MISSING:"取引先の内部識別子が重複または欠落しています",
  PRODUCT_SKU_OR_ID_INVALID:"商品コードまたは内部識別子に不足・重複があります",
  PRODUCT_ID_DUPLICATE_OR_MISSING:"商品の内部識別子が重複または欠落しています",
  STOCK_OR_LOT_INVALID:"在庫・引当数・発注ロットの数値に矛盾があります",
  PRICE_REFERENCE_INVALID:"契約単価の参照先の取引先・商品が見つかりません",
  DUPLICATE_PRICE_PAIR:"同じ取引先と商品の契約単価が重複しています",
  PRICE_AMOUNT_INVALID:"契約単価に無効な数値があります",
});
function masterAuditHtml(setup) {
  if (state.scope?.role !== "seller_admin") return "";
  const report=diagnoseAdminMasterSetup(setup);
  if (!report) return "";
  return `<section class="panel master-audit" aria-label="管理台帳の整合性診断">
    <h2>管理台帳の整合性診断（閲覧専用）</h2>
    <p class="note">ログイン中の卸売会社の登録値だけを画面内で照合します。DBへ保存・送信しません。</p>
    <div class="metrics"><div class="metric"><span>台帳内の矛盾候補</span><strong>${h(report.problemCount)}件</strong></div>
      <div class="metric"><span>契約単価の未設定組合せ</span><strong>${h(report.unpricedPairCount)}件</strong></div>
      <div class="metric"><span>0円設定の契約単価</span><strong>${h(report.zeroPriceCount)}件</strong></div></div>
    ${report.problems.length ? `<ul class="master-audit-issues">${report.problems.map(code=>
      `<li>${h(MASTER_AUDIT_LABELS[code] || "登録内容に確認が必要です")}</li>`).join("")}</ul>` :
      `<p class="helper">検査対象のコード・数値・参照関係に矛盾は見つかりませんでした。</p>`}
    ${report.truncated ? `<p class="note">表示は先頭10件のみです。全件は管理台帳CSVでご確認ください。</p>` : ""}
    <p class="note">「未設定組合せ」は全取引先×全商品の推計です。販売対象外の商品を含むため、必ずしも設定漏れではありません。
    この診断が正常でも本番稼働を許可するものではありません。</p>
  </section>`;
}
// This checklist describes data configuration only. It is not a production readiness pass.
function setupReadinessHtml(setup) {
  if (state.scope?.role !== "seller_admin" || !setup) return "";
  const buyers = Array.isArray(setup.buyers) ? setup.buyers : [];
  const products = Array.isArray(setup.products) ? setup.products : [];
  const prices = Array.isArray(setup.prices) ? setup.prices : [];
  const stockReady = products.some(p => Number.isSafeInteger(Number(p.onHand)) && Number(p.onHand) > 0);
  const checks = [
    ["取引先", buyers.length > 0, `${buyers.length}社登録`],
    ["商品マスター", products.length > 0, `${products.length}商品登録`],
    ["取引先別の契約単価", prices.length > 0, `${prices.length}件登録`],
    ["在庫", stockReady, stockReady ? "在庫のある商品あり" : "在庫設定が必要"],
  ];
  const rows = checks.map(([name,ok,desc]) => `<li class="setup-check ${ok ? "ready" : "pending"}">
    <b>${h(ok ? "設定あり" : "未設定")}</b><span>${h(name)}</span><small>${h(desc)}</small></li>`).join("");
  return `<section class="panel setup-readiness" aria-label="導入前の設定チェック"><h2>初期設定チェック</h2>
    <p class="note">設定状況の目安です。「設定あり」でも本番運用可能とは判定しません。</p>
    <ul>${rows}</ul>
    <p class="note">担当者アカウント・所属登録、通知配信、支払条件の運用確認、実HTTP書込検査は別途必要です。</p>
  </section>`;
}

const CSV_DIAGNOSTIC_LABELS = Object.freeze({
  EMPTY_ROW: "空白行があります", UNSAFE_OR_OVERSIZED_CELL: "危険な文字または文字数超過です",
  INVALID_BUYER_FIELDS: "取引先の入力形式を確認してください",
  INVALID_PRODUCT_FIELDS: "商品・在庫・ロットの入力形式を確認してください",
  INVALID_PRICE_FIELDS: "契約単価の入力形式を確認してください",
  REFERENCE_NOT_FOUND: "登録済み取引先・商品を参照していません",
  REFERENCE_NAME_MISMATCH: "コードに対する会社名・商品名が一致しません",
  CSV_DUPLICATE_KEY: "CSV内に同じコード・組合せがあります",
  EXISTING_RECORD_DIFFERS: "既存登録と内容が異なります（目視照合が必要）",
  STOCK_CHANGE_REQUIRES_RECONCILIATION: "在庫数変更は実棚卸と照合してください",
});
function importPreviewHtml() {
  if (state.scope?.role !== "seller_admin" || !state.adminSetup) return "";
  const p=state.importPreview;
  let result="";
  if(p && p.supplierId===state.scope.supplierId){
    const lines=[...p.errors,...p.warnings].map(x=>
      "<li>"+h(x.row)+"行目："+h(CSV_DIAGNOSTIC_LABELS[x.code]||x.code)+"</li>").join("");
    result='<div class="import-preview-result" role="status"><h3>確認結果：'+
      (p.ok?"形式エラーなし":"要修正")+'（保存はしていません）</h3><p>CSV '+
      h(p.recordCount)+'行／既存と一致 '+h(p.unchangedCount)+
      '行／差分・新規候補 '+h(p.proposedCount)+'行／エラー '+
      h(p.errorCount)+'件／注意 '+h(p.warningCount)+'件</p>'+
      (lines?'<ul>'+lines+'</ul>':'')+
      '<p class="note">入力値・CSV原本・パスワードは保存しません。差分候補は自動登録されません。</p></div>';
  }
  return '<section class="panel setup-preflight" aria-label="CSV導入事前点検">'+
    '<h2>CSV導入事前点検（端末内で確認）</h2>'+
    '<p class="note">管理台帳CSVを、サーバー送信せずに形式・重複・登録済みマスターとの相違まで点検します。<strong>本機能からデータを登録・更新することはできません。</strong></p>'+
    '<form id="importPreviewForm" class="form-stack">'+
      '<label>点検する台帳<select name="kind" required><option value="buyers">取引先CSV</option><option value="products">商品・在庫CSV</option><option value="prices">契約単価CSV</option></select></label>'+
      '<label>CSVファイル（256KB以下・最大1000行）<input type="file" name="csv" accept=".csv,text/csv" required></label>'+
      '<button type="submit" class="secondary">CSVを端末内で事前点検する</button>'+
    '</form>'+result+'</section>';
}

function settingsPage() {
  const setup = state.adminSetup;
  const buyerNames = new Map((setup?.buyers || []).map(b => [b.id, b.name]));
  const productNames = new Map((setup?.products || []).map(p => [p.id, p.name]));
  const overview = setup && state.scope?.role === "seller_admin" ? `<section class="panel" style="margin-top:18px">
    <h2>登録済みの取引先・商品・契約単価</h2>
    <p class="note">現在有効な登録内容です。設定を保存すると一覧も更新されます。</p>
    <div class="admin-exports"><button type="button" class="secondary" data-action="export-admin-csv" data-type="buyers">取引先CSV</button>
      <button type="button" class="secondary" data-action="export-admin-csv" data-type="products">商品・在庫CSV</button>
      <button type="button" class="secondary" data-action="export-admin-csv" data-type="prices">契約単価CSV</button></div>
    <h3>取引先（${setup.buyers.length}社）</h3>
    <div class="table-wrap"><table><thead><tr><th>取引先コード</th><th>会社名</th><th>支払条件</th></tr></thead><tbody>
    ${setup.buyers.map(b => `<tr><td>${h(b.code)}</td><td>${h(b.name)}</td><td>${h(b.paymentTerms || "―")}</td></tr>`).join("") || `<tr><td colspan="3">未登録</td></tr>`}
    </tbody></table></div>
    <h3 style="margin-top:28px">商品と現在庫（${setup.products.length}商品）</h3>
    <div class="table-wrap"><table><thead><tr><th>SKU・商品</th><th>ロット・単位</th><th>現在庫</th><th>引当済み</th></tr></thead><tbody>
    ${setup.products.map(p => `<tr><td>${h(p.sku)}<small><br>${h(p.name)}</small></td><td>${h(p.lot)} ${h(p.unit)}</td><td>${h(p.onHand)}</td><td>${h(p.reserved)}</td></tr>`).join("") || `<tr><td colspan="4">未登録</td></tr>`}
    </tbody></table></div>
    <h3 style="margin-top:28px">有効な取引先別契約単価（${setup.prices.length}件）</h3>
    <div class="table-wrap"><table><thead><tr><th>取引先</th><th>商品</th><th>契約単価（税抜）</th></tr></thead><tbody>
    ${setup.prices.map(p => `<tr><td>${h(buyerNames.get(p.buyerId) || "―")}</td><td>${h(productNames.get(p.productId) || "―")}</td><td>${yen(p.priceYen)}</td></tr>`).join("") || `<tr><td colspan="3">未登録</td></tr>`}
    </tbody></table></div></section>` : "";
  const selections = setup && !READ_ONLY_QA && state.scope?.role === "seller_admin" ? `<section class="panel" style="margin-top:18px">
    <h2>導入設定（卸売管理者）</h2>
    <p class="note">購入者・商品・契約単価・在庫を設定します。購入者のログイン用Auth招待と所属登録は導入担当者が別途行います。</p>
    <div class="two-col">
      <form class="adminForm form-stack" data-type="buyer"><h3>① 購入者（取引先）を追加</h3>
        <label>取引先コード<input name="code" required maxlength="40" placeholder="BUYER001"></label>
        <label>会社名<input name="name" required maxlength="100"></label>
        <label>支払条件<input name="terms" maxlength="120" placeholder="月末締め翌月末払い"></label>
        <button class="secondary" type="submit">取引先を登録</button></form>
      <form class="adminForm form-stack" data-type="product"><h3>② 商品を追加</h3>
        <label>商品コード（SKU）<input name="sku" required maxlength="60" placeholder="ITEM001"></label>
        <label>商品名<input name="name" required maxlength="120"></label>
        <label>単位<input name="unit" required maxlength="20" placeholder="箱"></label>
        <label>発注ロット<input name="lot" required type="number" min="1" value="1"></label>
        <label>税率（%）<input name="tax" required type="number" min="0" max="100" value="10" step="1"></label>
        <button class="secondary" type="submit">商品を登録</button></form>
      <form class="adminForm form-stack" data-type="stock"><h3>③ 在庫数を設定</h3>
        <label>商品<select name="productId" required>${setup.products.map(p=>`<option value="${h(p.id)}">${h(p.name)}（現在 ${h(p.onHand)}）</option>`).join("")}</select></label>
        <label>現在在庫<input name="onHand" type="number" min="0" required></label>
        <button class="secondary" type="submit" ${!setup.products.length ? "disabled" : ""}>在庫を保存</button></form>
      <form class="adminForm form-stack" data-type="price"><h3>④ 取引先別単価を設定</h3>
        <label>購入者<select name="buyerId" required>${setup.buyers.map(b=>`<option value="${h(b.id)}">${h(b.name)}</option>`).join("")}</select></label>
        <label>商品<select name="productId" required>${setup.products.map(p=>`<option value="${h(p.id)}">${h(p.name)}</option>`).join("")}</select></label>
        <label>税抜単価（円）<input name="priceYen" type="number" min="0" max="1000000000" step="1" required></label>
        <button class="secondary" type="submit" ${!setup.buyers.length || !setup.products.length ? "disabled" : ""}>契約単価を保存</button></form>
    </div></section>` : "";
  return pageTitle("ACCOUNT", "現在の所属", "所属と認証はSupabase Authの本人情報から毎回取得します。") +
    `<section class="panel"><div class="line"><b>卸売会社</b><span>${h(state.scope.supplierName)}</span></div>
    <div class="line"><b>購入者</b><span>${h(state.scope.buyerName || "卸売側アカウント")}</span></div>
    <div class="line"><b>権限</b><span>${h(state.scope.role)}</span></div>
    <p class="note">パスワードやトークンはPCへ永続保存しません。</p></section>` + setupReadinessHtml(setup) + masterAuditHtml(setup) + importPreviewHtml() + selections + overview;
}

// DPRO ORDER STANDARD V3.1: CRM, owner settings and LINE status. No new auth or direct DB calls.
const STANDARD_PAGES = Object.freeze({crm:'/api/crm',company:'/api/company',line:'/api/line/status'});
async function loadStandardPage(name){
 if(state.scope?.role!=='seller_admin'||!Object.hasOwn(STANDARD_PAGES,name))throw new Error('管理者権限が必要です。');
 const data=await api(STANDARD_PAGES[name]);
 if(!state.scope || state.scope.role!=='seller_admin')return;
 state.standard[name]=data;
}
const eInput=(name,value,max=120,type='text')=>`<input name="${name}" value="${h(value||'')}" maxlength="${max}" type="${type}">`;
const standardLoading=title=>pageTitle('DPRO STANDARD',title,'DPRO標準の管理機能です。')+
 '<section class="panel"><p>サーバーの設定を確認しています。追加APIが未反映の場合は、DEMOをご利用ください。</p><button class="secondary" type="button" data-action="standard-refresh">再読み込み</button></section>';
function crmPage(){
 if(state.scope?.role!=='seller_admin')return pageTitle('ACCESS','権限がありません','この機能は管理者専用です。');
 const a=state.standard.crm?.buyers;
 if(!Array.isArray(a))return standardLoading('取引先・顧客管理');
 const b=a.find(x=>x.id===state.selectedCrmBuyer)||a[0];
 return pageTitle('CUSTOMERS','取引先・顧客管理','会社・担当者・連絡先・メモと発注履歴を、卸売会社ごとに管理します。')+
 `<section class="panel"><h2>取引先一覧（${a.length}件）</h2><div class="table-wrap"><table><thead><tr><th>会社・コード</th><th>担当者・電話</th><th>累計注文</th><th>LINE</th><th>編集</th></tr></thead><tbody>
 ${a.map(x=>`<tr><td><b>${h(x.name)}</b><small><br>${h(x.code)}</small></td><td>${h(x.contact||'―')}<small><br>${h(x.phone||'―')}</small></td><td>${h(x.orderCount||0)}件</td><td>${x.lineLinked?'紐付け済み':'未紐付け'}</td><td><button class="secondary" type="button" data-action="standard-select-buyer" data-id="${h(x.id)}">詳細・編集</button></td></tr>`).join('')||'<tr><td colspan="5">取引先はまだありません</td></tr>'}</tbody></table></div></section>`+
 (b?`<section class="panel"><h2>${h(b.name)}｜連絡先・メモ</h2><form id="standardCrmForm" data-id="${h(b.id)}" class="form-stack">
 <div class="two-col"><label>担当者名${eInput('contact',b.contact,100)}</label><label>電話番号${eInput('phone',b.phone,32)}</label><label>郵便番号${eInput('postal',b.postal,20)}</label><label>メールアドレス${eInput('email',b.email,254,'email')}</label></div>
 <label>住所${eInput('address',b.address,240)}</label><label>メモ<textarea name="note" maxlength="1500" rows="3">${h(b.note||'')}</textarea></label>
 <button class="secondary" type="submit" ${READ_ONLY_QA?'disabled':''}>${READ_ONLY_QA?'現在は保存停止中':'この顧客情報を保存'}</button></form>
 <p class="note">注文履歴 ${h(b.orderCount||0)}件　/　最新発注 ${h(b.lastOrderAt?formatDate(b.lastOrderAt):'なし')}。顧客の詳細は他社から閲覧できません。</p></section>`:'')+
 '<section class="panel"><p>新規取引先の基本登録は従来の「アカウント → 導入設定」から行います。登録後にこの画面で詳細を入力できます。</p></section>';
}
// OWNER ONLY: Customer onboarding preflight, not account issuance.
// Never call Supabase Auth or persist invite links from this screen.
function customerOnboardingMessage(buyer) {
  return `【DPRO ORDER 公開DEMOのご案内／実注文はできません】\n${String(buyer?.name || 'お取引先')} ご担当者様\n\nDPRO ORDERの操作体験画面をご案内します。\nURL：https://dpro-shop.com/order/demo.html\n共通DEMOコード：1234\n\n架空データのみの体験です。実際の注文・保存・LINE通知は発生しません。\n正式な個別ログイン案内は、商用運用の安全確認完了後に別途お送りします。\n※この案内文は正式なアカウント招待ではありません。`;
}
function onboardingPage(){
  if(state.scope?.role!=='seller_admin')return pageTitle('ACCESS','権限がありません','卸売管理者専用の画面です。');
  const buyers=state.standard.crm?.buyers;
  if(!Array.isArray(buyers)) return standardLoading('取引先の利用開始準備');
  const setup=state.adminSetup;
  const emailOk=x=>typeof x?.email==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email);
  const contactReady=buyers.filter(x=>emailOk(x)&&String(x.contact||'').trim()).length;
  const chosen=buyers.find(x=>x.id===state.selectedOnboardingBuyer)||buyers[0];
  const message=chosen?customerOnboardingMessage(chosen):'';
  const products=Array.isArray(setup?.products)?setup.products.length:0;
  const prices=Array.isArray(setup?.prices)?setup.prices.length:0;
  return pageTitle('OWNER ONBOARDING','取引先の利用開始準備','卸売会社のオーナーが、顧客への利用案内に必要な準備状況を確認します。')+
  `<div class="notice"><b>本番の招待発行・メール配信・LINE配信はまだ停止中です。</b> この画面で作成できるのは公開DEMOの案内文だけです。正式アカウントは発行しません。</div>
  <section class="panel"><h2>導入の進み具合</h2>
  <div class="metrics"><div class="metric"><span>登録取引先</span><strong>${h(buyers.length)}社</strong></div>
  <div class="metric"><span>連絡先・メール入力済み</span><strong>${h(contactReady)}社</strong></div>
  <div class="metric"><span>登録商品</span><strong>${h(products)}件</strong></div>
  <div class="metric"><span>契約単価</span><strong>${h(prices)}件</strong></div></div>
  <p class="note">これらは登録情報の入力状況です。メールの到達確認や顧客の本人確認、アカウント発行完了を示すものではありません。</p>
  <div class="actions"><button class="secondary" type="button" data-page="crm">取引先・顧客管理へ</button><button class="secondary" type="button" data-page="settings">商品・契約単価へ</button><button class="secondary" type="button" data-page="company">会社設定へ</button></div></section>
  <section class="panel"><h2>取引先別・利用開始チェック</h2><div class="table-wrap"><table><thead><tr><th>取引先</th><th>連絡先の入力</th><th>本人確認・招待</th><th>操作</th></tr></thead><tbody>
  ${buyers.map(b=>`<tr><td><b>${h(b.name)}</b><small><br>${h(b.code||'―')}</small></td>
    <td>${emailOk(b)&&String(b.contact||'').trim()?'入力済み':'要確認'}</td>
    <td>未確認（招待発行停止中）</td>
    <td><button class="secondary" type="button" data-action="onboarding-select-buyer" data-id="${h(b.id)}">準備内容</button></td></tr>`).join('')||'<tr><td colspan="4">取引先が登録されていません</td></tr>'}
  </tbody></table></div></section>
  ${chosen?`<section class="panel"><h2>${h(chosen.name)}｜案内準備</h2>
  <div class="line"><b>担当者</b><span>${h(chosen.contact||'未設定')}</span></div>
  <div class="line"><b>連絡先メール</b><span>${h(chosen.email||'未設定')}</span></div>
  <div class="line"><b>電話番号</b><span>${h(chosen.phone||'未設定')}</span></div>
  <p class="note">登録された連絡先メールと正式ログインのメールは、同一とは限りません。正式招待では本人確認後に照合が必要です。</p>
  <h3>公開DEMOの案内文（コピー用）</h3>
  <textarea id="onboardingPreviewText" class="guide-message" rows="9" readonly aria-label="公開DEMOの案内文">${h(message)}</textarea>
  <div class="actions"><button class="secondary" type="button" data-action="onboarding-copy-demo">DEMO案内文をコピー</button><button class="secondary" type="button" disabled title="正式招待機能は安全確認後に提供">正式招待を発行（未提供）</button></div></section>`:''}
  <section class="panel"><h2>本番導入までの手順</h2><ol>
    <li>会社・取引先・商品・契約単価を整える</li>
    <li>取引先本人と連絡先メールを確認する</li>
    <li>本人確認付きの正式招待を発行する（現在は未提供）</li>
    <li>顧客ログイン・会社別隔離・発注から出荷までの安全検査に合格する</li>
    <li>LINE公式との連携検査後に通知を有効化する</li>
  </ol><p class="note">実発注や招待発行を行うために本番ロックを解除しないでください。ロック解除は別途承認と受入検査が必要です。</p></section>`;
}
function companyPage(){
 if(state.scope?.role!=='seller_admin')return pageTitle('ACCESS','権限がありません','この機能は管理者専用です。');
 const c=state.standard.company;if(!c)return standardLoading('会社・営業所設定');
 return pageTitle('OWNER SETTINGS','会社・営業所設定','会社の連絡先・締切・配送運用を登録します。')+
 `<section class="panel"><h2>${h(c.companyName)}｜基本設定</h2><form id="standardCompanyForm" class="form-stack">
 <div class="two-col"><label>営業所名${eInput('branch',c.branch,100)}</label><label>電話番号${eInput('phone',c.phone,32)}</label><label>郵便番号${eInput('postal',c.postal,20)}</label><label>発注締切${eInput('cutoff',c.cutoff||'15:00',5,'time')}</label></div>
 <label>住所${eInput('address',c.address,240)}</label><label>配送・営業曜日${eInput('delivery',c.delivery,150)}</label>
 <label>運用メモ<textarea rows="2" name="note" maxlength="500">${h(c.note||'')}</textarea></label>
 <h3>通知方針（配信の実行はLINE接続完了後）</h3>
 <div class="actions"><label><input name="noticeOrder" type="checkbox" ${c.noticeOrder?'checked':''}>注文受付</label><label><input name="noticeApproval" type="checkbox" ${c.noticeApproval?'checked':''}>承認</label><label><input name="noticeShipment" type="checkbox" ${c.noticeShipment?'checked':''}>出荷</label></div>
 <button class="secondary" type="submit" ${READ_ONLY_QA?'disabled':''}>${READ_ONLY_QA?'本番設定の保存は停止中':'会社設定を保存'}</button></form>
 <p class="note">本番ロックが有効な間は入力内容を保存しません。スタッフの認証・会社別権限は別途管理します。</p></section>`;
}
function lineStatusPage(){
 if(state.scope?.role!=='seller_admin')return pageTitle('ACCESS','権限がありません','この機能は管理者専用です。');
 const l=state.standard.line;if(!l)return standardLoading('公式LINE連携');
 return pageTitle('LINE OFFICIAL','公式LINE連携','注文受付・承認・出荷通知の準備状況を確認します。')+
 `<section class="panel"><h2>接続状況：${h(l.status||'unconfigured')}</h2>
 <p class="note"><b>現在、LINEメッセージは送信していません。</b>　${h(l.message||'実配信は停止しています。')}</p>
 <div class="metrics"><div class="metric"><span>紐付け済み取引先</span><strong>${h(l.lineLinkedBuyers||0)}</strong></div><div class="metric"><span>通知キュー</span><strong>${h(l.queuedEvents||0)}</strong></div><div class="metric"><span>配信状態</span><strong>${l.deliveryEnabled?'要監査':'OFF'}</strong></div></div>
 <h3>正式連携時に必要な確認</h3><p>LINE公式アカウントと署名付きWebhook、取引先との本人確認付き紐付け、送信テスト、送信失敗時の再送管理を検査してから接続します。</p></section>`;
}
function staffStandardPage(){
 if(state.scope?.role!=='seller_admin')return pageTitle('ACCESS','権限がありません','この機能は管理者専用です。');
 return pageTitle('STAFF / ROLES','スタッフ・権限','認証済みユーザーだけが会社別所属で利用できる権限です。')+
 `<section class="panel"><table><thead><tr><th>役割</th><th>担当範囲</th></tr></thead><tbody><tr><td>seller_admin</td><td>取引先・商品・価格・在庫・会社設定</td></tr><tr><td>seller_sales</td><td>注文承認・取消</td></tr><tr><td>seller_shipper</td><td>出荷・分納。価格は非表示</td></tr><tr><td>buyer</td><td>所属する取引先自身の注文</td></tr></tbody></table>
 <p class="note">スタッフ追加や権限変更は、本人認証と会社別隔離を守る導入手続きで行います。ここではパスワードの表示・一括権限付与はできません。</p></section>`;
}
function render() {
  if (!state.scope) return showLogin();
  const pages = { dashboard: dashboard, queue: workQueuePage, orders: ordersPage, catalog: catalogPage,
    new: newOrderPage, shipping: shippingPage, settings: settingsPage, crm:crmPage, company:companyPage, line:lineStatusPage, staff:staffStandardPage, onboarding:onboardingPage, detail: orderDetailPage };
  const names = { dashboard: "今日の状況", queue: "未処理業務", orders: "注文一覧", catalog: "商品・契約単価", new: "新規発注", shipping: "出荷処理", settings: "アカウント", crm:"取引先・顧客管理",company:"会社・営業所設定",line:"公式LINE連携",staff:"スタッフ・権限",detail: "注文詳細" };
  document.querySelector("#breadcrumb").textContent = READ_ONLY_QA ? `${noticeMode()}｜${names[state.page]}` : names[state.page];
  document.querySelector("#userLabel").textContent = isBuyer() ? state.scope.buyerName : state.scope.supplierName;
  document.querySelector("#logout").hidden = false;
  nav.hidden = false;
  document.querySelector("#navNew").hidden = !isBuyer() || READ_ONLY_QA;
  document.querySelector("#navShipping").hidden = !canShip() || READ_ONLY_QA;
  document.querySelector("#navQueue").hidden = isBuyer();
  nav.querySelectorAll("button[data-standard]").forEach(b=>b.hidden=state.scope?.role!=="seller_admin");
  nav.querySelectorAll("button[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === state.page));
  main.innerHTML = `${READ_ONLY_QA ? `<div class="qa-ribbon" role="status">${h(noticeMode())} — 書き込み停止中</div>` : IS_R58N_QA ? `<div class="qa-ribbon" role="status">${h(noticeMode())} — 架空データのみ</div>` : ""}${pages[state.page]()}`;
}
async function busyAction(doWork) {
  if (state.busy) return;
  state.busy = true;
  const ticket = ++state.busyTicket;
  const button = document.activeElement;
  if (button?.tagName === "BUTTON") button.disabled = true;
  try { await doWork(); }
  catch (error) {
    // Old network failures cannot repaint or display errors on the new login.
    if (ticket !== state.busyTicket) return;
    // Preserve the exact in-memory payload and make the replay boundary visible.
    if (state.scope && (state.draftPayload || state.shipPayloads.size)) render();
    notice(error.message || "処理に失敗しました。", true);
  }
  finally {
    if (ticket === state.busyTicket) {
      state.busy = false; if (button?.isConnected) button.disabled = false;
    }
  }
}

document.addEventListener("submit", event => {
  if (["standardCrmForm","standardCompanyForm"].includes(event.target.id)) {
    event.preventDefault(); const form=event.target;
    busyAction(async()=>{
      if(state.scope?.role!=="seller_admin")throw new Error("管理者権限が必要です。");
      if(READ_ONLY_QA)throw new Error("本番の書き込みを停止しています。");
      const f=new FormData(form);
      if(form.id==="standardCrmForm"){
        await api("/api/admin/crm","POST",{buyerId:form.dataset.id,
          contact:f.get("contact"),phone:f.get("phone"),postal:f.get("postal"),address:f.get("address"),
          email:f.get("email"),note:f.get("note")});
        await loadStandardPage("crm");
      } else {
        await api("/api/admin/company","POST",{
          branch:f.get("branch"),phone:f.get("phone"),postal:f.get("postal"),address:f.get("address"),
          cutoff:f.get("cutoff"),delivery:f.get("delivery"),note:f.get("note"),
          noticeOrder:f.has("noticeOrder"),noticeApproval:f.has("noticeApproval"),noticeShipment:f.has("noticeShipment")});
        await loadStandardPage("company");
      }
      render();notice("設定を保存しました。");
    });return;
  }
  if (!["loginForm", "orderForm"].includes(event.target.id) &&
      !event.target.classList.contains("shipmentForm") && !event.target.classList.contains("adminForm") &&
      event.target.id !== "importPreviewForm") return;
  event.preventDefault();
  const form = event.target;
  busyAction(async () => {
    if (form.id === "importPreviewForm") {
      // Reading a local file is asynchronous. Logout, re-login or a refresh must
      // invalidate the old preview before it can ever be shown to a new account.
      const previewEpoch = state.authEpoch, previewToken = state.accessToken;
      const previewScope = state.scope, previewSetup = state.adminSetup;
      if (state.scope?.role !== "seller_admin" || !state.adminSetup)
        throw new Error("卸売管理者だけが台帳を事前点検できます。");
      const data = new FormData(form),file=data.get("csv"),kind=data.get("kind");
      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv") ||
          file.size<1 || file.size>256*1024)
        throw new Error("256KB以下のCSVファイルを選択してください。");
      // Local file read only: no API, storage, or automatic update path exists.
      const csv = await file.text();
      const { previewMasterCsv } = await import("./setup_import_preview.mjs");
      if (previewEpoch !== state.authEpoch || previewToken !== state.accessToken ||
          previewScope !== state.scope || previewSetup !== state.adminSetup) return;
      const report=previewMasterCsv(kind,csv,previewScope,previewSetup);
      // No raw CSV data is kept after this function returns.
      state.importPreview=report;
      render(); notice(report.ok ? "端末内の事前点検を完了しました。保存・送信はしていません。" :
        "CSVの修正点があります。結果を確認してください。",!report.ok);
      return;
    }
    if (form.classList.contains("adminForm")) {
      if (READ_ONLY_QA) throw new Error("安全確認中のため書き込みは停止しています。");
      if (state.scope?.role !== "seller_admin") throw new Error("管理者権限が必要です。");
      const data = new FormData(form);
      const kind = form.dataset.type;
      const payloads = {
        buyer: { code:data.get("code"), name:data.get("name"), terms:data.get("terms") },
        product: { sku:data.get("sku"), name:data.get("name"), unit:data.get("unit"),
          lot:Number(data.get("lot")), taxBasisPoints:Number(data.get("tax"))*100 },
        stock: { productId:data.get("productId"), onHand:Number(data.get("onHand")) },
        price: { buyerId:data.get("buyerId"), productId:data.get("productId"),
          priceYen:Number(data.get("priceYen")) },
      };
      if (!Object.hasOwn(payloads,kind)) throw new Error("設定項目を確認してください。");
      await api(`/api/admin/${kind}`,"POST",payloads[kind]);
      await sync(); render(); notice("設定を保存しました。"); return;
    }
    if (form.classList.contains("shipmentForm")) {
      if (READ_ONLY_QA) throw new Error("安全確認中のため書き込みは停止しています。");
      if (!canShip()) throw new Error("出荷権限がありません。");
      const order = state.orders.find(o => o.id === form.dataset.orderId);
      if (!order) throw new Error("注文が見つかりません。");
      const data = new FormData(form);
      const lines = order.lines.map(l => ({ lineId:l.id, quantity:Number(data.get(`line-${l.id}`) || 0) }))
        .filter(l => l.quantity > 0);
      if (!lines.length) throw new Error("出荷する数量を入力してください。");
      for (const line of lines) {
        const current = order.lines.find(l => l.id === line.lineId);
        if (!Number.isSafeInteger(line.quantity) || line.quantity > Number(current.quantity)-Number(current.shipped))
          throw new Error(`${current.name}の出荷数量を確認してください。`);
      }
      if (!confirm("入力した数量を出荷済みにしますか？在庫も減算されます。")) return;
      let requestKey = state.shipKeys.get(order.id);
      if (!requestKey) { requestKey = crypto.randomUUID(); state.shipKeys.set(order.id,requestKey); }
      const previous = state.shipPayloads.get(order.id);
      if (previous && JSON.stringify(previous.lines) !== JSON.stringify(lines))
        throw new Error("送信結果の確認前に出荷数量が変更されました。前回と同じ数量で再送するか、注文一覧・最新情報を確認してください。");
      if (!previous) state.shipPayloads.set(order.id, { lines });
      await api("/api/shipment", "POST", { orderId:order.id, requestKey, lines:state.shipPayloads.get(order.id).lines });
      await sync(); state.shipKeys.delete(order.id); state.shipPayloads.delete(order.id);
      render(); notice("出荷数量を登録しました。"); return;
    }
    if (form.id === "loginForm") {
      const data = new FormData(form);
      const result = await api("/api/login", "POST", { email: data.get("email"), password: data.get("password") }, "");
      if (typeof result.accessToken !== "string") throw new Error("ログイン結果が不正です。");
      // Starting a new authenticated session invalidates every older in-flight request.
      state.authEpoch++;
      state.accessToken = result.accessToken;
      state.expiresAt = Date.now() + Number(result.expiresIn || 0) * 1000;
      form.querySelector('input[name="password"]').value = "";
      const sessionEpoch = state.authEpoch;
      try { await sync(); } catch (error) {
        // A delayed failure from an old login must not terminate the replacement session.
        if (sessionEpoch === state.authEpoch && state.accessToken === result.accessToken) showLogin();
        throw error;
      }
      if (sessionEpoch !== state.authEpoch || state.accessToken !== result.accessToken)
        throw new Error("ログイン状態が変更されました。古い通信結果を破棄しました。");
      state.page = "dashboard"; render(); notice("ログインしました。");
      return;
    }
    if (READ_ONLY_QA) throw new Error("安全確認中のため書き込みは停止しています。");
    if (!state.scope || !isBuyer()) throw new Error("購入者のログインが必要です。");
    const data = new FormData(form);
    const lines = state.catalog.map(p => ({ productId: p.id, quantity: Number(data.get(`qty-${p.id}`)) }))
      .filter(l => l.quantity > 0);
    if (!lines.length) throw new Error("発注する商品を選択してください。");
    for (const line of lines) {
      const product = state.catalog.find(p => p.id === line.productId);
      if (!Number.isSafeInteger(line.quantity) || line.quantity > 999999999 ||
          line.quantity % product.lot !== 0) throw new Error(`${product.name}の発注ロットを確認してください。`);
    }
    const preview=calculateOrderPreview(lines,state.catalog);
    if (!confirm(`発注内容：${preview.itemCount}商品、税抜概算 ${summaryYen(preview.totalYen)}。
在庫・契約単価をサーバーで最終確認して発注しますか？`)) return;
    const key = state.draftKey;
    const payload = { requestKey:key, lines, note:data.get("note") };
    if (state.draftPayload && JSON.stringify(state.draftPayload) !== JSON.stringify(payload))
      throw new Error("前回と異なる発注内容です。送信結果を注文一覧で確認し、『別の発注を作成する』から送信番号を新しくしてください。");
    if (!state.draftPayload) state.draftPayload = payload;
    const result = await api("/api/orders", "POST", state.draftPayload);
    await sync(); state.draftKey = ""; state.draftPayload = null;
    state.page = "orders"; render();
    notice(result.replayed ? "既に受け付けた注文です。" : "発注を受け付けました。");
  });
});

document.addEventListener("change", event => {
  if (event.target?.id==="orderStatusFilter" && state.scope) {
    const v=event.target.value;
    if (Object.hasOwn(STATUS_FILTERS,v)) currentOrderFilter=v;
    render();
  }
});
document.addEventListener("input", event => {
  if (event.target?.closest?.("#orderForm") && state.scope && isBuyer() && !READ_ONLY_QA) {
    updateOrderPreview(event.target.closest("#orderForm"));
  }
  if (event.target?.id==="orderSearch" && state.scope) {
    currentOrderQuery=event.target.value.slice(0,100);
    // Avoid replacing the focused input on each keystroke; update on Enter or blur.
  }
});
document.addEventListener("keydown", event => {
  if (event.target?.id==="orderSearch" && event.key==="Enter") {
    event.preventDefault(); render();
  }
});
document.addEventListener("focusout", event => {
  if (event.target?.id==="orderSearch" && state.scope) render();
});
document.addEventListener("click", event => {
  if (event.target.closest("#logout")) { showLogin(); notice("ログアウトしました。"); return; }
  const pageButton = event.target.closest("[data-page]");
  if (pageButton && state.scope) {
    const next=pageButton.dataset.page;
    if ([...Object.keys(STANDARD_PAGES),'staff','onboarding'].includes(next)) {
      if(state.scope.role!=="seller_admin") {notice("管理者権限が必要です。",true);return;}
      state.page=next;render(); main.focus(); window.scrollTo(0,0);
      if(Object.hasOwn(STANDARD_PAGES,next)||next==='onboarding') busyAction(async()=>{
        await loadStandardPage(next==='onboarding'?'crm':next);render();
      });
      return;
    }
    state.page = next; render(); main.focus(); window.scrollTo(0,0); return;
  }
  const action = event.target.closest("[data-action]");
  if (!action || !state.scope) return;
  busyAction(async () => {
    if (action.dataset.action === "standard-refresh"){
      const reloadPage = state.page==="onboarding" ? "crm" : state.page;
      if(state.scope?.role!=="seller_admin"||!Object.hasOwn(STANDARD_PAGES,reloadPage))throw new Error("管理者権限が必要です。");
      await loadStandardPage(reloadPage);render();return;
    }
    if (action.dataset.action === "onboarding-select-buyer") {
      if(state.scope?.role!=="seller_admin"||state.page!=="onboarding")throw new Error("管理者権限が必要です。");
      const id=action.dataset.id;
      if(!(state.standard.crm?.buyers||[]).some(x=>x.id===id))throw new Error("取引先を確認してください。");
      state.selectedOnboardingBuyer=id;render();return;
    }
    if (action.dataset.action === "onboarding-copy-demo") {
      if(state.scope?.role!=="seller_admin"||state.page!=="onboarding")throw new Error("管理者権限が必要です。");
      const buyer=(state.standard.crm?.buyers||[]).find(x=>x.id===state.selectedOnboardingBuyer)||state.standard.crm?.buyers?.[0];
      if(!buyer)throw new Error("取引先を確認してください。");
      const message=customerOnboardingMessage(buyer);
      if(!navigator.clipboard?.writeText)throw new Error("ブラウザのコピー機能を利用できません。案内文を選択してコピーしてください。");
      await navigator.clipboard.writeText(message);
      notice("公開DEMOの案内文をコピーしました。実顧客への正式招待ではありません。");return;
    }
    if (action.dataset.action === "standard-select-buyer"){
      if(state.scope?.role!=="seller_admin"||state.page!=="crm")throw new Error("管理者権限が必要です。");
      const id=action.dataset.id;
      if(!(state.standard.crm?.buyers||[]).some(x=>x.id===id))throw new Error("取引先を確認してください。");
      state.selectedCrmBuyer=id;render();return;
    }
    if (action.dataset.action === "reset-draft" && isBuyer() && state.page === "new") {
      if (!confirm("前回の発注が受け付け済みの可能性があります。注文一覧で確認しましたか？別の送信番号で新たに作成します。")) return;
      state.draftKey = crypto.randomUUID(); state.draftPayload = null;
      render(); notice("新しい送信番号に切り替えました。"); return;
    }
    if (action.dataset.action === "refresh") { await sync(); render(); notice("更新しました。"); return; }
    if (action.dataset.action === "queue-filter" && state.page === "queue") {
      const status = action.dataset.status;
      if (!Object.hasOwn(STATUS_FILTERS,status)) throw new Error("検索条件を確認してください。");
      currentOrderFilter = status; currentOrderQuery = ""; state.page = "orders";
      render(); main.focus(); return;
    }
    if (action.dataset.action === "export-csv" && state.page === "orders") {
      const visible = visibleOrders();
      if (!visible.length) { notice("出力する注文がありません。"); return; }
      downloadCsv(buildOrderCsv(visible),`DPRO_ORDER_注文一覧_${new Date().toISOString().slice(0,10)}.csv`);
      notice("表示中の注文をCSV出力しました。"); return;
    }
    if (action.dataset.action === "export-admin-csv" && state.page === "settings") {
      if (state.scope?.role !== "seller_admin") throw new Error("管理者権限が必要です。");
      const kind = action.dataset.type;
      const csv = buildAdminCsv(kind);
      downloadCsv(csv,`DPRO_ORDER_管理台帳_${kind}_${new Date().toISOString().slice(0,10)}.csv`);
      notice("管理台帳CSVを出力しました。共有先には注意してください。"); return;
    }
    const id = action.dataset.id;
    const verb = action.dataset.action;
    if (verb === "detail") {
      if (!validOrderId(id) || !state.orders.some(o => o.id === id))
        throw new Error("この注文は表示できません。");
      state.activeOrderId = id; state.page = "detail"; render(); main.focus(); return;
    }
    if (READ_ONLY_QA) throw new Error("安全確認中のため書き込みは停止しています。");
    if (!validOrderId(id)) throw new Error("注文番号が不正です。");
    if (!["confirm", "cancel"].includes(verb)) return;
    const order = state.orders.find(o => o.id === id);
    if (!canDecideOrder(order,verb)) throw new Error("この操作の権限がないか、注文状態が変わりました。");
    if (!confirm(verb === "confirm" ? "この注文を承認しますか？" : "この注文を取消しますか？")) return;
    await api("/api/decision", "POST", { orderId: id, action: verb });
    await sync(); render(); notice("注文を更新しました。");
  });
});

showLogin();
