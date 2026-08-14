(() => {
  "use strict";

  const VERSION = "DPRO-CONTACT-WEB-FORM-20260814-R2";
  const API_BASE = "https://dpro-shop-contact-v1-api.dpromstk2000.workers.dev";
  const CONFIG_URL = `${API_BASE}/api/public/contact/web-config`;
  const SUBMIT_URL = `${API_BASE}/api/public/contact/web`;

  const form = document.getElementById("dproWebContactForm");
  if (!form) return;

  const submitButton = document.getElementById("dproWebContactSubmit");
  const statusBox = document.getElementById("dproWebContactStatus");

  let publicConfig = null;
  let busy = false;

  function setStatus(message, kind = "info") {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = `dpro-web-form__status is-show is-${kind}`;
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.textContent = "";
    statusBox.className = "dpro-web-form__status";
  }

  function setFormEnabled(enabled) {
    form.querySelectorAll("input,select,textarea,button").forEach((el) => {
      if (el.name === "website") return;
      el.disabled = !enabled;
    });
    if (submitButton) submitButton.disabled = !enabled || busy;
  }

  function uuidV4() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0,4).join("")}-${hex.slice(4,6).join("")}-${hex.slice(6,8).join("")}-${hex.slice(8,10).join("")}-${hex.slice(10).join("")}`;
  }

  function value(name) {
    return String(form.elements[name]?.value || "").trim();
  }

  function getTurnstileToken() {
    const hidden = form.querySelector('input[name="cf-turnstile-response"]');
    const hiddenValue = String(hidden?.value || "").trim();
    if (hiddenValue) return hiddenValue;

    try {
      if (window.turnstile?.getResponse) {
        return String(window.turnstile.getResponse() || "").trim();
      }
    } catch {}
    return "";
  }

  function resetTurnstile() {
    try {
      if (window.turnstile?.reset) window.turnstile.reset();
    } catch {}
  }

  function validateClient(data) {
    const limits = publicConfig?.limits || {};
    if (!data.name || !data.email || !data.message) return "必須項目を入力してください。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "メールアドレスの形式を確認してください。";
    const checks = [
      ["お名前", data.name, Number(limits.name || 80)],
      ["メールアドレス", data.email, Number(limits.email || 254)],
      ["店舗名 / 会社名", data.company, Number(limits.company || 120)],
      ["電話番号", data.phone, Number(limits.phone || 30)],
      ["業種", data.industry, Number(limits.industry || 80)],
      ["相談内容", data.message, Number(limits.message || 3000)],
    ];
    for (const [label, text, max] of checks) {
      if (text.length > max) return `${label}は${max}文字以内で入力してください。`;
    }
    if (!data.turnstileToken) return "迷惑送信防止の送信確認を完了してください。";
    return "";
  }

  function errorMessage(code) {
    const messages = {
      required_fields_missing: "必須項目を入力してください。",
      invalid_email: "メールアドレスの形式を確認してください。",
      invalid_category: "相談カテゴリーを確認してください。",
      validation_failed: "入力文字数を確認してください。",
      turnstile_required: "送信確認を完了してください。",
      turnstile_failed: "送信確認に失敗しました。もう一度お試しください。",
      rate_limited: "短時間に複数回送信されています。少し時間をおいてからお試しください。",
      origin_not_allowed: "このページからは送信できません。",
      web_disabled: "WEB問い合わせフォームは現在準備中です。LINEからお問い合わせください。",
      contact_disabled: "問い合わせ受付は現在準備中です。",
      server_error: "現在送信できません。時間をおいて再度お試しください。",
    };
    return messages[String(code || "")] || "送信できませんでした。入力内容を確認してもう一度お試しください。";
  }

  async function boot() {
    setFormEnabled(false);
    setStatus("WEB問い合わせフォームを準備しています…", "info");

    try {
      const response = await fetch(CONFIG_URL, {
        method: "GET",
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || `config_http_${response.status}`);
      if (!data.enabled || !data.siteKey) throw new Error("web_disabled");

      publicConfig = data;

      const widget = document.getElementById("dproWebTurnstile");
      if (widget && widget.dataset.sitekey !== data.siteKey) {
        console.warn("DPRO_WEB_CONTACT_SITEKEY_MISMATCH", VERSION);
      }

      clearStatus();
      setFormEnabled(true);
    } catch (error) {
      console.warn("DPRO_WEB_CONTACT_BOOT", VERSION, error);
      setFormEnabled(false);
      setStatus(errorMessage(error.message), "error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !publicConfig?.enabled) return;

    const payload = {
      name: value("name"),
      email: value("email"),
      company: value("company"),
      phone: value("phone"),
      industry: value("industry"),
      category: value("category"),
      message: value("message"),
      website: value("website"),
      submissionId: uuidV4(),
      turnstileToken: getTurnstileToken(),
    };

    const validationError = validateClient(payload);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    busy = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送信中…";
    }
    setStatus("問い合わせを送信しています…", "info");

    try {
      const response = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok !== true) {
        throw new Error(data.error || `submit_http_${response.status}`);
      }

      form.reset();
      setStatus("送信しました。内容を確認し、DPRO SHOPからご連絡します。", "success");
      resetTurnstile();
    } catch (error) {
      console.warn("DPRO_WEB_CONTACT_SUBMIT", VERSION, error);
      setStatus(errorMessage(error.message), "error");
      resetTurnstile();
    } finally {
      busy = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "WEBから無料相談を送信する";
      }
    }
  });

  boot();
})();