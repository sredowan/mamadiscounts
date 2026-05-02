<?php
/**
 * Plugin Name: Couponus BD — Voucher Redemption
 * Plugin URI: https://couponusbd.com/integrations/woocommerce
 * Description: Accept Couponus BD vouchers at WooCommerce checkout. Customers enter their Ref ID and get instant discount.
 * Version: 1.0.0
 * Author: Couponus BD
 * Author URI: https://couponusbd.com
 * Text Domain: couponus-bd
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 * WC tested up to: 8.5
 * License: GPL v2 or later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'COUPONUS_BD_VERSION', '1.0.0' );
define( 'COUPONUS_BD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'COUPONUS_BD_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Initialize plugin after all plugins are loaded
 */
function couponus_bd_init() {
    // Only load if WooCommerce is active
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', 'couponus_bd_wc_missing_notice' );
        return;
    }

    require_once COUPONUS_BD_PLUGIN_DIR . 'includes/class-couponus-api.php';
    require_once COUPONUS_BD_PLUGIN_DIR . 'includes/class-couponus-admin.php';
    require_once COUPONUS_BD_PLUGIN_DIR . 'includes/class-couponus-checkout.php';

    new Couponus_BD_Admin();
    new Couponus_BD_Checkout();
}
add_action( 'plugins_loaded', 'couponus_bd_init', 20 );

/**
 * Admin notice when WooCommerce is not installed
 */
function couponus_bd_wc_missing_notice() {
    echo '<div class="error"><p><strong>Couponus BD</strong> requires WooCommerce to be installed and active.</p></div>';
}

/**
 * Activation hook — set default options
 */
function couponus_bd_activate() {
    add_option( 'couponus_bd_merchant_id', '' );
    add_option( 'couponus_bd_api_key', '' );
    add_option( 'couponus_bd_api_base', 'https://couponusbd.com/api' );
    add_option( 'couponus_bd_field_label', 'Have a Couponus voucher?' );
    add_option( 'couponus_bd_field_placeholder', 'Enter Ref ID (e.g. CPB-A7F3BC)' );
    add_option( 'couponus_bd_brand_color', '#10b981' );
}
register_activation_hook( __FILE__, 'couponus_bd_activate' );

/**
 * Add settings link on plugins page
 */
function couponus_bd_settings_link( $links ) {
    $settings = '<a href="' . admin_url( 'admin.php?page=couponus-bd-settings' ) . '">Settings</a>';
    array_unshift( $links, $settings );
    return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'couponus_bd_settings_link' );
