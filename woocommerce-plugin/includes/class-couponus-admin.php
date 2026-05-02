<?php
/**
 * Couponus BD — Admin Settings Page
 *
 * WordPress admin page for configuring the plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Couponus_BD_Admin {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
    }

    /**
     * Add settings page under WooCommerce menu
     */
    public function add_settings_page() {
        add_submenu_page(
            'woocommerce',
            'Couponus BD Settings',
            'Couponus BD',
            'manage_woocommerce',
            'couponus-bd-settings',
            array( $this, 'render_settings_page' )
        );
    }

    /**
     * Register all settings
     */
    public function register_settings() {
        // API section
        add_settings_section(
            'couponus_bd_api_section',
            'API Configuration',
            array( $this, 'render_api_section' ),
            'couponus-bd-settings'
        );

        register_setting( 'couponus_bd_settings', 'couponus_bd_merchant_id', 'sanitize_text_field' );
        add_settings_field( 'couponus_bd_merchant_id', 'Merchant ID', array( $this, 'render_merchant_id_field' ), 'couponus-bd-settings', 'couponus_bd_api_section' );

        register_setting( 'couponus_bd_settings', 'couponus_bd_api_key', 'sanitize_text_field' );
        add_settings_field( 'couponus_bd_api_key', 'API Key', array( $this, 'render_api_key_field' ), 'couponus-bd-settings', 'couponus_bd_api_section' );

        register_setting( 'couponus_bd_settings', 'couponus_bd_api_base', 'sanitize_text_field' );
        add_settings_field( 'couponus_bd_api_base', 'API Base URL', array( $this, 'render_api_base_field' ), 'couponus-bd-settings', 'couponus_bd_api_section' );

        // Display section
        add_settings_section(
            'couponus_bd_display_section',
            'Checkout Display',
            array( $this, 'render_display_section' ),
            'couponus-bd-settings'
        );

        register_setting( 'couponus_bd_settings', 'couponus_bd_field_label', 'sanitize_text_field' );
        add_settings_field( 'couponus_bd_field_label', 'Field Label', array( $this, 'render_field_label_field' ), 'couponus-bd-settings', 'couponus_bd_display_section' );

        register_setting( 'couponus_bd_settings', 'couponus_bd_field_placeholder', 'sanitize_text_field' );
        add_settings_field( 'couponus_bd_field_placeholder', 'Placeholder', array( $this, 'render_placeholder_field' ), 'couponus-bd-settings', 'couponus_bd_display_section' );

        register_setting( 'couponus_bd_settings', 'couponus_bd_brand_color', 'sanitize_text_field' );
        add_settings_field( 'couponus_bd_brand_color', 'Brand Color', array( $this, 'render_color_field' ), 'couponus-bd-settings', 'couponus_bd_display_section' );
    }

    public function render_api_section() {
        echo '<p>Enter your credentials from the Couponus BD Merchant Portal &rarr; Integrations page.</p>';
    }

    public function render_display_section() {
        echo '<p>Customize how the voucher field appears at checkout.</p>';
    }

    public function render_merchant_id_field() {
        $value = get_option( 'couponus_bd_merchant_id', '' );
        echo '<input type="text" name="couponus_bd_merchant_id" value="' . esc_attr( $value ) . '" placeholder="MERCHANT_12345" class="regular-text" />';
    }

    public function render_api_key_field() {
        $value = get_option( 'couponus_bd_api_key', '' );
        echo '<input type="password" name="couponus_bd_api_key" value="' . esc_attr( $value ) . '" placeholder="cpb_live_..." class="regular-text" />';
    }

    public function render_api_base_field() {
        $value = get_option( 'couponus_bd_api_base', 'https://couponusbd.com/api' );
        echo '<input type="text" name="couponus_bd_api_base" value="' . esc_attr( $value ) . '" placeholder="https://couponusbd.com/api" class="regular-text" />';
    }

    public function render_field_label_field() {
        $value = get_option( 'couponus_bd_field_label', 'Have a Couponus voucher?' );
        echo '<input type="text" name="couponus_bd_field_label" value="' . esc_attr( $value ) . '" class="regular-text" />';
    }

    public function render_placeholder_field() {
        $value = get_option( 'couponus_bd_field_placeholder', 'Enter Ref ID (e.g. CPB-A7F3BC)' );
        echo '<input type="text" name="couponus_bd_field_placeholder" value="' . esc_attr( $value ) . '" class="regular-text" />';
    }

    public function render_color_field() {
        $value = get_option( 'couponus_bd_brand_color', '#10b981' );
        echo '<input type="color" name="couponus_bd_brand_color" value="' . esc_attr( $value ) . '" style="width:48px;height:48px;border:2px solid #e5e7eb;border-radius:10px;padding:2px;cursor:pointer;" />';
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        $api = new Couponus_BD_API();
        $is_configured = $api->is_configured();
        $brand_color = get_option( 'couponus_bd_brand_color', '#10b981' );
        $status_text = $is_configured ? 'Active' : 'Not configured';
        ?>
        <div class="wrap couponus-settings">
            <div class="couponus-header" style="background: linear-gradient(135deg, <?php echo esc_attr( $brand_color ); ?>, <?php echo esc_attr( $brand_color ); ?>cc); padding: 24px 28px; border-radius: 14px; color: #fff; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h1 style="margin:0;font-size:22px;color:#fff;">Couponus BD</h1>
                    <p style="margin:4px 0 0;font-size:14px;opacity:0.85;">Accept Couponus vouchers at your WooCommerce checkout</p>
                </div>
                <div style="padding: 8px 16px; border-radius: 50px; font-size: 13px; font-weight: 700; background: rgba(255,255,255,0.2);">
                    <?php echo esc_html( $status_text ); ?>
                </div>
            </div>

            <form method="post" action="options.php">
                <?php
                settings_fields( 'couponus_bd_settings' );
                do_settings_sections( 'couponus-bd-settings' );
                submit_button( 'Save Settings' );
                ?>
            </form>

            <div style="margin-top:24px;padding:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
                <h3 style="margin:0 0 8px;font-size:15px;color:#065f46;">Need help?</h3>
                <p style="margin:0;font-size:13px;color:#6b7280;">Get your Merchant ID and API Key from the <a href="https://couponusbd.com/merchant/integrations" target="_blank" style="color:<?php echo esc_attr( $brand_color ); ?>;font-weight:600;">Couponus BD Merchant Portal &rarr; Integrations</a> page.</p>
            </div>
        </div>
        <?php
    }

    /**
     * Enqueue admin styles
     */
    public function enqueue_admin_styles( $hook ) {
        if ( $hook !== 'woocommerce_page_couponus-bd-settings' ) {
            return;
        }
        wp_enqueue_style( 'couponus-bd-admin', COUPONUS_BD_PLUGIN_URL . 'assets/css/admin.css', array(), COUPONUS_BD_VERSION );
    }
}
