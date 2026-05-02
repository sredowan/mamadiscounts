/**
 * Couponus BD — Checkout AJAX handler
 */
(function ($) {
  "use strict";

  var $toggle = $("#couponus-toggle");
  var $form = $("#couponus-form");
  var $arrow = $("#couponus-arrow");
  var $input = $("#couponus-code-input");
  var $applyBtn = $("#couponus-apply-btn");
  var $message = $("#couponus-message");
  var $applied = $("#couponus-applied");
  var $removeBtn = $("#couponus-remove-btn");
  var $appliedTitle = $("#couponus-applied-title");
  var $appliedDiscount = $("#couponus-applied-discount");
  var isOpen = false;

  // Toggle form
  $toggle.on("click", function () {
    isOpen = !isOpen;
    $form.slideToggle(200);
    $arrow.text(isOpen ? "▾" : "▸");
  });

  // Apply voucher
  $applyBtn.on("click", function () {
    applyVoucher();
  });

  $input.on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      applyVoucher();
    }
  });

  function applyVoucher() {
    var code = $.trim($input.val()).toUpperCase();
    if (code.length < 5) return;

    $applyBtn
      .prop("disabled", true)
      .text(couponus_bd.i18n.verifying);
    $message.html("").hide();

    $.post(couponus_bd.ajax_url, {
      action: "couponus_validate",
      nonce: couponus_bd.nonce,
      code: code,
    })
      .done(function (res) {
        $applyBtn.prop("disabled", false).text(couponus_bd.i18n.apply);

        if (res.success && res.data && res.data.valid) {
          var d = res.data;
          $input.prop("disabled", true);
          $applyBtn.hide();
          $appliedTitle.text(d.dealTitle || "Couponus Voucher");
          $appliedDiscount.text(
            "−" + (d.discountFormatted || "৳" + d.discount)
          );
          $applied.slideDown(200);
          $message
            .html(
              '<span class="couponus-msg-success">✓ Voucher applied! Discount will appear in your total.</span>'
            )
            .show();

          // Trigger WooCommerce cart update
          $(document.body).trigger("update_checkout");
        } else {
          var msg =
            (res.data && res.data.message) ||
            "Invalid or expired voucher code.";
          $message
            .html('<span class="couponus-msg-error">✕ ' + msg + "</span>")
            .show();
        }
      })
      .fail(function () {
        $applyBtn.prop("disabled", false).text(couponus_bd.i18n.apply);
        $message
          .html(
            '<span class="couponus-msg-error">✕ ' +
              couponus_bd.i18n.error +
              "</span>"
          )
          .show();
      });
  }

  // Remove voucher
  $removeBtn.on("click", function () {
    $.post(couponus_bd.ajax_url, {
      action: "couponus_remove",
      nonce: couponus_bd.nonce,
    }).done(function () {
      $applied.slideUp(200);
      $input.prop("disabled", false).val("");
      $applyBtn.show();
      $message.html("").hide();
      $(document.body).trigger("update_checkout");
    });
  });
})(jQuery);
