<?php
/**
 * Couponus BD — Checkout Integration
 *
 * Adds voucher input field at WooCommerce checkout,
 * handles AJAX validation, applies discount, and auto-redeems on order completion.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Couponus_BD_Checkout {

    public function __construct() {
        add_action( 'woocommerce_before_checkout_form', array( $this, 'render_voucher_field' ), 5 );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );

        add_action( 'wp_ajax_couponus_validate', array( $this, 'ajax_validate' ) );
        add_action( 'wp_ajax_nopriv_couponus_validate', array( $this, 'ajax_validate' ) );
        add_action( 'wp_ajax_couponus_remove', array( $this, 'ajax_remove' ) );
        add_action( 'wp_ajax_nopriv_couponus_remove', array( $this, 'ajax_remove' ) );

        add_action( 'woocommerce_cart_calculate_fees', array( $this, 'apply_discount' ) );

        add_action( 'woocommerce_order_status_completed', array( $this, 'redeem_on_complete' ) );
        add_action( 'woocommerce_order_status_processing', array( $this, 'redeem_on_complete' ) );

        add_action( 'woocommerce_checkout_create_order', array( $this, 'save_order_meta' ), 10, 2 );
        add_action( 'woocommerce_admin_order_data_after_billing_address', array( $this, 'display_order_meta' ) );
    }

    /**
     * Render the voucher input field at checkout
     */
    public function render_voucher_field() {
        $api = new Couponus_BD_API();
        if ( ! $api->is_configured() ) {
            return;
        }

        $label       = get_option( 'couponus_bd_field_label', 'Have a Couponus voucher?' );
        $placeholder = get_option( 'couponus_bd_field_placeholder', 'Enter Ref ID (e.g. CPB-A7F3BC)' );
        $color       = get_option( 'couponus_bd_brand_color', '#10b981' );

        include COUPONUS_BD_PLUGIN_DIR . 'templates/checkout-field.php';
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_assets() {
        if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
            return;
        }

        $api = new Couponus_BD_API();
        if ( ! $api->is_configured() ) {
            return;
        }

        wp_enqueue_style(
            'couponus-bd-checkout',
            COUPONUS_BD_PLUGIN_URL . 'assets/css/checkout-field.css',
            array(),
            COUPONUS_BD_VERSION
        );

        wp_enqueue_script(
            'couponus-bd-checkout',
            COUPONUS_BD_PLUGIN_URL . 'assets/js/checkout.js',
            array( 'jquery' ),
            COUPONUS_BD_VERSION,
            true
        );

        wp_localize_script( 'couponus-bd-checkout', 'couponus_bd', array(
            'ajax_url'    => admin_url( 'admin-ajax.php' ),
            'nonce'       => wp_create_nonce( 'couponus_bd_nonce' ),
            'brand_color' => get_option( 'couponus_bd_brand_color', '#10b981' ),
            'i18n'        => array(
                'verifying' => 'Verifying...',
                'apply'     => 'Apply',
                'remove'    => 'Remove',
                'error'     => 'Something went wrong. Please try again.',
            ),
        ) );
    }

    /**
     * AJAX: Validate voucher code
     */
    public function ajax_validate() {
        check_ajax_referer( 'couponus_bd_nonce', 'nonce' );

        $code = isset( $_POST['code'] ) ? sanitize_text_field( $_POST['code'] ) : '';
        if ( empty( $code ) ) {
            wp_send_json_error( array( 'message' => 'Please enter a voucher code.' ) );
            return;
        }

        $api = new Couponus_BD_API();
        $cart_total = 0;
        if ( function_exists( 'WC' ) && WC()->cart ) {
            $cart_total = WC()->cart->get_subtotal();
        }
        $result = $api->validate( $code, $cart_total );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array( 'message' => $result->get_error_message() ) );
            return;
        }

        if ( ! empty( $result['valid'] ) ) {
            $voucher_id = isset( $result['voucherId'] ) ? $result['voucherId'] : '';
            $discount   = isset( $result['discount'] ) ? floatval( $result['discount'] ) : 0;
            $deal_title = isset( $result['dealTitle'] ) ? $result['dealTitle'] : '';

            if ( function_exists( 'WC' ) && WC()->session ) {
                WC()->session->set( 'couponus_bd_voucher', array(
                    'code'       => strtoupper( trim( $code ) ),
                    'voucherId'  => $voucher_id,
                    'discount'   => $discount,
                    'dealTitle'  => $deal_title,
                ) );
            }

            wp_send_json_success( $result );
        } else {
            $msg = isset( $result['message'] ) ? $result['message'] : 'Invalid or expired voucher code.';
            wp_send_json_error( array( 'message' => $msg ) );
        }
    }

    /**
     * AJAX: Remove applied voucher
     */
    public function ajax_remove() {
        check_ajax_referer( 'couponus_bd_nonce', 'nonce' );

        if ( function_exists( 'WC' ) && WC()->session ) {
            WC()->session->set( 'couponus_bd_voucher', null );
        }
        wp_send_json_success( array( 'message' => 'Voucher removed.' ) );
    }

    /**
     * Apply discount as a negative fee
     */
    public function apply_discount( $cart ) {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
            return;
        }

        if ( ! function_exists( 'WC' ) || ! WC()->session ) {
            return;
        }

        $voucher = WC()->session->get( 'couponus_bd_voucher' );
        if ( empty( $voucher ) || empty( $voucher['discount'] ) ) {
            return;
        }

        $discount = floatval( $voucher['discount'] );
        $label = 'Couponus Voucher (' . $voucher['code'] . ')';

        $cart->add_fee( $label, -$discount, false );
    }

    /**
     * Save voucher data to order meta
     */
    public function save_order_meta( $order, $data ) {
        if ( ! function_exists( 'WC' ) || ! WC()->session ) {
            return;
        }

        $voucher = WC()->session->get( 'couponus_bd_voucher' );
        if ( empty( $voucher ) ) {
            return;
        }

        $order->update_meta_data( '_couponus_bd_code', $voucher['code'] );
        $order->update_meta_data( '_couponus_bd_voucher_id', $voucher['voucherId'] );
        $order->update_meta_data( '_couponus_bd_discount', $voucher['discount'] );
        $order->update_meta_data( '_couponus_bd_deal_title', $voucher['dealTitle'] );
        $order->update_meta_data( '_couponus_bd_redeemed', 'no' );

        WC()->session->set( 'couponus_bd_voucher', null );
    }

    /**
     * Auto-redeem when order is completed/processing
     */
    public function redeem_on_complete( $order_id ) {
        if ( ! function_exists( 'wc_get_order' ) ) {
            return;
        }

        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        $voucher_id = $order->get_meta( '_couponus_bd_voucher_id' );
        $redeemed   = $order->get_meta( '_couponus_bd_redeemed' );

        if ( empty( $voucher_id ) || $redeemed === 'yes' ) {
            return;
        }

        $api = new Couponus_BD_API();
        $result = $api->redeem( $voucher_id, $order_id );

        if ( ! is_wp_error( $result ) && ! empty( $result['success'] ) ) {
            $order->update_meta_data( '_couponus_bd_redeemed', 'yes' );
            $order->add_order_note( 'Couponus BD voucher ' . $order->get_meta( '_couponus_bd_code' ) . ' redeemed successfully.' );
            $order->save();
        }
    }

    /**
     * Display voucher info in admin order page
     */
    public function display_order_meta( $order ) {
        $code = $order->get_meta( '_couponus_bd_code' );
        if ( empty( $code ) ) {
            return;
        }

        $discount  = $order->get_meta( '_couponus_bd_discount' );
        $deal      = $order->get_meta( '_couponus_bd_deal_title' );
        $redeemed  = $order->get_meta( '_couponus_bd_redeemed' );
        $color     = get_option( 'couponus_bd_brand_color', '#10b981' );
        $status    = ( $redeemed === 'yes' ) ? 'Redeemed' : 'Pending';

        echo '<div class="couponus-order-info" style="margin-top:16px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">';
        echo '<h3 style="margin:0 0 8px;color:' . esc_attr( $color ) . ';">Couponus BD Voucher</h3>';
        echo '<p><strong>Code:</strong> <code>' . esc_html( $code ) . '</code></p>';
        echo '<p><strong>Deal:</strong> ' . esc_html( $deal ) . '</p>';
        echo '<p><strong>Discount:</strong> ' . esc_html( number_format( floatval( $discount ), 0 ) ) . '</p>';
        echo '<p><strong>Status:</strong> ' . esc_html( $status ) . '</p>';
        echo '</div>';
    }
}
