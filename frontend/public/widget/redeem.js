/**
 * Couponus BD — Embeddable Voucher Redemption Widget
 * 
 * Usage: Paste in <head> or before </body>
 * <script src="https://couponusbd.com/widget/redeem.js"
 *   data-merchant-id="YOUR_MERCHANT_ID"
 *   data-theme="auto"
 *   data-position="bottom-right"
 *   data-color="#10b981"
 *   data-callback="onCouponusRedeem">
 * </script>
 */
(function () {
  "use strict";

  // ── Config ──
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var CONFIG = {
    merchantId: script.getAttribute("data-merchant-id") || "",
    theme: script.getAttribute("data-theme") || "auto",
    position: script.getAttribute("data-position") || "bottom-right",
    color: script.getAttribute("data-color") || "#10b981",
    locale: script.getAttribute("data-locale") || "en",
    callback: script.getAttribute("data-callback") || null,
    apiBase: script.getAttribute("data-api-base") || "https://couponusbd.com/api",
  };

  var TEXTS = {
    en: { button: "Have a Couponus voucher?", title: "Redeem Voucher", placeholder: "Enter Ref ID (e.g. CPB-A7F3BC)", verify: "Verify & Apply", verifying: "Verifying...", success: "Discount applied!", invalid: "Invalid or expired code", error: "Something went wrong", close: "Close", poweredBy: "Powered by Couponus BD", discount: "Your discount" },
    bn: { button: "কুপোনাস ভাউচার আছে?", title: "ভাউচার রিডিম", placeholder: "Ref ID দিন (যেমন CPB-A7F3BC)", verify: "যাচাই ও প্রয়োগ", verifying: "যাচাই হচ্ছে...", success: "ছাড় প্রয়োগ হয়েছে!", invalid: "ভুল বা মেয়াদোত্তীর্ণ কোড", error: "সমস্যা হয়েছে", close: "বন্ধ", poweredBy: "Couponus BD দ্বারা", discount: "আপনার ছাড়" },
  };

  var t = TEXTS[CONFIG.locale] || TEXTS.en;

  // ── Styles ──
  var css = '\
    #cpb-widget-btn{position:fixed;z-index:99998;' + (CONFIG.position === "bottom-left" ? "left:20px" : "right:20px") + ';bottom:20px;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:50px;border:none;background:' + CONFIG.color + ';color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.15);transition:all .2s}\
    #cpb-widget-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.2)}\
    #cpb-widget-btn svg{flex-shrink:0}\
    #cpb-widget-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:none;align-items:flex-end;justify-content:' + (CONFIG.position === "bottom-left" ? "flex-start" : "flex-end") + ';padding:20px}\
    #cpb-widget-overlay.cpb-open{display:flex}\
    #cpb-widget-panel{background:#fff;border-radius:20px;width:380px;max-width:calc(100vw - 40px);box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;animation:cpbSlideUp .25s ease-out;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}\
    @keyframes cpbSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}\
    .cpb-header{background:linear-gradient(135deg,' + CONFIG.color + ',' + CONFIG.color + 'cc);color:#fff;padding:20px;display:flex;align-items:center;justify-content:space-between}\
    .cpb-header h3{margin:0;font-size:16px;font-weight:800}\
    .cpb-close{background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:grid;place-items:center}\
    .cpb-body{padding:20px}\
    .cpb-input-wrap{position:relative;margin-bottom:16px}\
    .cpb-input{width:100%;padding:14px 16px;border:2px solid #e5e7eb;border-radius:14px;font-size:15px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;outline:none;transition:border-color .15s;box-sizing:border-box;font-family:monospace}\
    .cpb-input:focus{border-color:' + CONFIG.color + ';box-shadow:0 0 0 3px ' + CONFIG.color + '22}\
    .cpb-submit{width:100%;padding:14px;border:none;border-radius:14px;background:' + CONFIG.color + ';color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s}\
    .cpb-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px ' + CONFIG.color + '40}\
    .cpb-submit:disabled{opacity:.5;cursor:not-allowed}\
    .cpb-result{margin-top:16px;padding:16px;border-radius:14px;font-size:13px;font-weight:600}\
    .cpb-success{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}\
    .cpb-success .cpb-discount-val{font-size:24px;font-weight:900;color:' + CONFIG.color + '}\
    .cpb-error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}\
    .cpb-powered{text-align:center;padding:12px;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6}\
    .cpb-powered a{color:' + CONFIG.color + ';text-decoration:none;font-weight:700}\
    @media(max-width:480px){#cpb-widget-panel{width:100%;border-radius:20px 20px 0 0}#cpb-widget-overlay{padding:0;align-items:flex-end}}\
  ';

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Ticket Icon SVG ──
  var ticketSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>';

  // ── DOM ──
  // Floating button
  if (CONFIG.position !== "inline") {
    var btn = document.createElement("button");
    btn.id = "cpb-widget-btn";
    btn.innerHTML = ticketSvg + " " + t.button;
    btn.onclick = function () { overlay.classList.add("cpb-open"); btn.style.display = "none"; };
    document.body.appendChild(btn);
  }

  // Overlay + Panel
  var overlay = document.createElement("div");
  overlay.id = "cpb-widget-overlay";
  overlay.innerHTML = '\
    <div id="cpb-widget-panel">\
      <div class="cpb-header">\
        <h3>' + t.title + '</h3>\
        <button class="cpb-close" id="cpb-close-btn">&times;</button>\
      </div>\
      <div class="cpb-body">\
        <div class="cpb-input-wrap">\
          <input class="cpb-input" id="cpb-code-input" placeholder="' + t.placeholder + '" autocomplete="off" />\
        </div>\
        <button class="cpb-submit" id="cpb-submit-btn">' + t.verify + '</button>\
        <div id="cpb-result"></div>\
      </div>\
      <div class="cpb-powered">' + t.poweredBy.replace("Couponus BD", '<a href="https://couponusbd.com" target="_blank" rel="noopener">Couponus BD</a>') + '</div>\
    </div>';

  if (CONFIG.position === "inline") {
    // Inline mode: find a target container or append to body
    var target = document.getElementById("couponus-widget") || document.body;
    target.appendChild(overlay.querySelector("#cpb-widget-panel"));
  } else {
    document.body.appendChild(overlay);
  }

  // ── Events ──
  var closeBtn = document.getElementById("cpb-close-btn");
  var codeInput = document.getElementById("cpb-code-input");
  var submitBtn = document.getElementById("cpb-submit-btn");
  var resultDiv = document.getElementById("cpb-result");

  if (closeBtn) {
    closeBtn.onclick = function () {
      overlay.classList.remove("cpb-open");
      if (btn) btn.style.display = "flex";
    };
  }

  overlay.onclick = function (e) {
    if (e.target === overlay) {
      overlay.classList.remove("cpb-open");
      if (btn) btn.style.display = "flex";
    }
  };

  if (submitBtn && codeInput) {
    submitBtn.onclick = function () { verifyCode(); };
    codeInput.onkeydown = function (e) { if (e.key === "Enter") verifyCode(); };
  }

  function verifyCode() {
    var code = codeInput.value.trim().toUpperCase();
    if (code.length < 5) return;

    submitBtn.disabled = true;
    submitBtn.textContent = t.verifying;
    resultDiv.innerHTML = "";

    // Call Couponus API
    fetch(CONFIG.apiBase + "/voucher/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId: CONFIG.merchantId, code: code }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        submitBtn.disabled = false;
        submitBtn.textContent = t.verify;

        if (data.valid) {
          resultDiv.innerHTML = '<div class="cpb-result cpb-success">\
            <div style="margin-bottom:8px">' + t.success + '</div>\
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px">' + (data.dealTitle || "Deal") + '</div>\
            <div class="cpb-discount-val">' + (data.discountFormatted || ("৳" + data.discount)) + '</div>\
          </div>';

          // Fire callback
          if (CONFIG.callback && typeof window[CONFIG.callback] === "function") {
            window[CONFIG.callback]({ valid: true, discount: data.discount, dealTitle: data.dealTitle, voucherId: data.voucherId, code: code });
          }

          // Fire custom event
          document.dispatchEvent(new CustomEvent("couponus:validated", { detail: data }));
        } else {
          resultDiv.innerHTML = '<div class="cpb-result cpb-error">' + t.invalid + '</div>';

          if (CONFIG.callback && typeof window[CONFIG.callback] === "function") {
            window[CONFIG.callback]({ valid: false, code: code });
          }
          document.dispatchEvent(new CustomEvent("couponus:invalid", { detail: { code: code } }));
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = t.verify;
        resultDiv.innerHTML = '<div class="cpb-result cpb-error">' + t.error + '</div>';
      });
  }

  // Public API
  window.CouponusBD = {
    open: function () { overlay.classList.add("cpb-open"); if (btn) btn.style.display = "none"; },
    close: function () { overlay.classList.remove("cpb-open"); if (btn) btn.style.display = "flex"; },
    validate: function (code) { codeInput.value = code; verifyCode(); },
    redeem: function (voucherId, orderId) {
      return fetch(CONFIG.apiBase + "/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: CONFIG.merchantId, voucherId: voucherId, orderId: orderId }),
      }).then(function (r) { return r.json(); });
    },
  };

})();
