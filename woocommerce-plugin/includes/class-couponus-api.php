<?php
/**
 * Couponus BD — API Client
 *
 * Handles all communication with the Couponus BD API.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Couponus_BD_API {

    private $api_base;
    private $api_key;
    private $merchant_id;

    public function __construct() {
        $this->api_base    = get_option( 'couponus_bd_api_base', 'https://couponusbd.com/api' );
        $this->api_key     = get_option( 'couponus_bd_api_key', '' );
        $this->merchant_id = get_option( 'couponus_bd_merchant_id', '' );
    }

    /**
     * Validate a voucher code
     *
     * @param string $code       The voucher ref ID or code
     * @param float  $order_total The current order total
     * @return array|WP_Error
     */
    public function validate( $code, $order_total = 0 ) {
        if ( empty( $this->api_key ) || empty( $this->merchant_id ) ) {
            return new WP_Error( 'couponus_not_configured', 'Couponus BD is not configured. Please set your Merchant ID and API Key.' );
        }

        $response = wp_remote_post( $this->api_base . '/voucher/validate', array(
            'timeout' => 15,
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ),
            'body' => wp_json_encode( array(
                'merchantId'  => $this->merchant_id,
                'code'        => strtoupper( trim( $code ) ),
                'orderAmount' => floatval( $order_total ),
            ) ),
        ) );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'couponus_connection_error', 'Could not connect to Couponus BD. Please try again.' );
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $status_code !== 200 || empty( $body ) ) {
            return new WP_Error( 'couponus_api_error', 'Invalid response from Couponus BD.' );
        }

        return $body;
    }

    /**
     * Confirm redemption after payment
     *
     * @param string $voucher_id The voucher ID from validation
     * @param string $order_id   The WooCommerce order ID
     * @return array|WP_Error
     */
    public function redeem( $voucher_id, $order_id ) {
        if ( empty( $this->api_key ) || empty( $this->merchant_id ) ) {
            return new WP_Error( 'couponus_not_configured', 'Couponus BD is not configured.' );
        }

        $response = wp_remote_post( $this->api_base . '/voucher/redeem', array(
            'timeout' => 15,
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ),
            'body' => wp_json_encode( array(
                'merchantId' => $this->merchant_id,
                'voucherId'  => $voucher_id,
                'orderId'    => strval( $order_id ),
            ) ),
        ) );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'couponus_connection_error', 'Could not connect to Couponus BD.' );
        }

        return json_decode( wp_remote_retrieve_body( $response ), true );
    }

    /**
     * Check if the plugin is configured
     *
     * @return bool
     */
    public function is_configured() {
        return ! empty( $this->api_key ) && ! empty( $this->merchant_id );
    }
}
