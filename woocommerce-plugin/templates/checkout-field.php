<?php
/**
 * Couponus BD — Checkout voucher field template
 * 
 * @var string $label
 * @var string $placeholder
 * @var string $color
 */
if ( ! defined( 'ABSPATH' ) ) exit;
?>

<div class="couponus-checkout-field" id="couponus-checkout-field">
    <div class="couponus-toggle" id="couponus-toggle" style="border-left-color: <?php echo esc_attr( $color ); ?>;">
        <span class="couponus-toggle-icon">🎫</span>
        <span class="couponus-toggle-label"><?php echo esc_html( $label ); ?></span>
        <span class="couponus-toggle-arrow" id="couponus-arrow">▸</span>
    </div>

    <div class="couponus-form" id="couponus-form" style="display: none;">
        <div class="couponus-input-group">
            <input
                type="text"
                id="couponus-code-input"
                class="couponus-code-input"
                placeholder="<?php echo esc_attr( $placeholder ); ?>"
                autocomplete="off"
                style="--brand-color: <?php echo esc_attr( $color ); ?>;"
            />
            <button
                type="button"
                id="couponus-apply-btn"
                class="couponus-apply-btn"
                style="background: <?php echo esc_attr( $color ); ?>;"
            >
                <?php esc_html_e( 'Apply', 'couponus-bd' ); ?>
            </button>
        </div>

        <div id="couponus-message" class="couponus-message"></div>

        <div id="couponus-applied" class="couponus-applied" style="display: none;">
            <div class="couponus-applied-info">
                <span class="couponus-applied-icon" style="color: <?php echo esc_attr( $color ); ?>;">✓</span>
                <div>
                    <span class="couponus-applied-title" id="couponus-applied-title"></span>
                    <span class="couponus-applied-discount" id="couponus-applied-discount" style="color: <?php echo esc_attr( $color ); ?>;"></span>
                </div>
            </div>
            <button type="button" id="couponus-remove-btn" class="couponus-remove-btn">
                <?php esc_html_e( 'Remove', 'couponus-bd' ); ?>
            </button>
        </div>
    </div>
</div>
