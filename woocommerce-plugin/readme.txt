=== Couponus BD — Voucher Redemption ===
Contributors: couponusbd
Tags: coupon, voucher, woocommerce, discount, checkout
Requires at least: 5.8
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Accept Couponus BD vouchers at your WooCommerce checkout. Customers enter their Ref ID and get instant discount.

== Description ==

**Couponus BD** is a voucher and deal platform for businesses in Bangladesh. This plugin integrates your WooCommerce store with Couponus BD, allowing customers to redeem their purchased vouchers during online checkout.

**Features:**

* 🎫 Voucher input field at checkout
* ✅ Real-time AJAX validation against Couponus BD API
* 💰 Automatic discount application to cart
* 🔄 Auto-redemption on order completion
* 🎨 Customizable brand colors and labels
* 📋 Voucher details saved to order meta
* 🔒 Secure server-side API communication

**How it works:**

1. Customer adds items to cart and goes to checkout
2. Customer clicks "Have a Couponus voucher?" toggle
3. Customer enters their Ref ID (e.g. CPB-A7F3BC)
4. Plugin validates the code with Couponus BD API
5. Discount is applied to the order total
6. After payment, the voucher is automatically redeemed

== Installation ==

1. Upload the `couponus-bd` folder to `/wp-content/plugins/`
2. Activate the plugin through WordPress admin
3. Go to **WooCommerce → Couponus BD** settings
4. Enter your **Merchant ID** and **API Key** from the [Couponus BD Merchant Portal](https://couponusbd.com/merchant/integrations)
5. Customize the checkout field label and brand color
6. Save settings — you're live!

== Frequently Asked Questions ==

= Where do I get my Merchant ID and API Key? =

Log in to the [Couponus BD Merchant Portal](https://couponusbd.com/merchant/integrations) and go to the **Integrations** page. You can generate your API key there.

= Does it work with all WooCommerce themes? =

Yes, the plugin uses standard WooCommerce hooks and should work with any properly coded theme.

= Is the API call secure? =

Yes. All API communication happens server-side from your WordPress server to Couponus BD. No API keys are exposed to the browser.

= Can I customize the appearance? =

Yes. You can change the field label, placeholder text, and brand color from the settings page.

== Changelog ==

= 1.0.0 =
* Initial release
* Checkout voucher field with AJAX validation
* Automatic discount application
* Auto-redemption on order completion
* Admin settings page with brand customization
