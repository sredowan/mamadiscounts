"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Gift,
  Lock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Send,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createCartItemFromDeal, getCheckoutBuyAsGift, getCheckoutCart } from "@/lib/checkout-cart";
import { DEMO_DEALS } from "@/lib/demo-data";
import { cn, formatBDT } from "@/lib/utils";
import type { CartItem, Deal } from "@/types";
import styles from "./page.module.css";

const INITIAL_CART: CartItem[] = [
  {
    dealId: "d1",
    optionId: "o1",
    optionTitle: "60-Min Thai Massage",
    quantity: 1,
    unitPrice: 1999,
    originalPrice: 5000,
    dealTitle: "Luxury Thai Spa Package",
    merchantName: "Serenity Thai Spa",
    imageUrl: "/images/deals/spa-1.jpg",
  },
  {
    dealId: "d2",
    optionId: "o3",
    optionTitle: "Sushi Platter for Two",
    quantity: 2,
    unitPrice: 1499,
    originalPrice: 3500,
    dealTitle: "Premium Sushi & Ramen Platter",
    merchantName: "Tokyo Ramen House",
    imageUrl: "/images/deals/food-1.jpg",
  },
];

const OFFER_ITEMS = {
  premiumGiftWrap: {
    label: "Premium gift packaging",
    price: 120,
    description: "Gold seal envelope, printed message, and COUPONUS presentation sleeve.",
  },
  priorityProcessing: {
    label: "Priority voucher processing",
    price: 80,
    description: "Move this order to the front of the voucher generation queue.",
  },
} as const;

type Step = "details" | "payment" | "confirm" | "success";
type GiftMode = "online" | "physical";
type DeliveryZone = "inside_dhaka" | "outside_dhaka";
type OfferKey = keyof typeof OFFER_ITEMS;

type BuyerInfo = {
  name: string;
  email: string;
  phone: string;
};

type GiftInfo = {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  address: string;
  note: string;
};

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [step, setStep] = useState<Step>("details");
  const [buyer, setBuyer] = useState<BuyerInfo>({ name: "", email: "", phone: "" });
  const [buyAsGift, setBuyAsGift] = useState(false);
  const [giftMode, setGiftMode] = useState<GiftMode>("online");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_dhaka");
  const [giftInfo, setGiftInfo] = useState<GiftInfo>({
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    address: "",
    note: "",
  });
  const [selectedOffers, setSelectedOffers] = useState<Record<OfferKey, boolean>>({
    premiumGiftWrap: false,
    priorityProcessing: false,
  });
  const [digitalMessage, setDigitalMessage] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [bkashPhone, setBkashPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const serviceFee = Math.round((subtotal - discount) * 0.025);
  const addOnTotal = Object.entries(selectedOffers).reduce((sum, [key, enabled]) => {
    return enabled ? sum + OFFER_ITEMS[key as OfferKey].price : sum;
  }, 0);
  const deliveryFee = buyAsGift && giftMode === "physical" ? (deliveryZone === "inside_dhaka" ? 50 : 90) : 0;
  const total = subtotal - discount + serviceFee + addOnTotal + deliveryFee;
  const savings = cart.reduce((sum, item) => sum + (item.originalPrice - item.unitPrice) * item.quantity, 0) + discount;

  const suggestedDeals = useMemo(() => getSuggestedDeals(cart), [cart]);
  const detailsReady = isBuyerReady(buyer) && (!buyAsGift || isGiftReady(giftInfo, giftMode));

  function updateQuantity(dealId: string, delta: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.dealId === dealId
          ? { ...item, quantity: Math.max(1, Math.min(5, item.quantity + delta)) }
          : item
      )
    );
  }

  function removeItem(dealId: string) {
    setCart((prev) => prev.filter((item) => item.dealId !== dealId));
  }

  function addSuggestedDeal(deal: Deal) {
    const option = deal.options[0];
    const item = createCartItemFromDeal(deal, option, 1);

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.dealId === deal.id);
      if (existing) return prev.map((cartItem) => cartItem.dealId === deal.id ? { ...cartItem, quantity: Math.min(5, cartItem.quantity + 1) } : cartItem);
      return [...prev, item];
    });
  }

  function toggleOffer(key: OfferKey) {
    setSelectedOffers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function applyPromo() {
    if (promoCode.trim().toUpperCase() === "BDDEALS") setPromoApplied(true);
  }

  async function handlePaymentStep(nextStep: Step) {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStep(nextStep);
    setIsProcessing(false);
  }

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setCart(getCheckoutCart(INITIAL_CART));
      setBuyAsGift(getCheckoutBuyAsGift());
      setIsMounted(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isMounted) {
    return null; // Prevent hydration mismatch by rendering nothing on server pass
  }

  if (cart.length === 0 && step !== "success") {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyContent}>
          <ShoppingBag size={52} className={styles.emptyIcon} />
          <h1>Your cart is empty</h1>
          <p>Choose a deal first, then come back for the premium checkout flow.</p>
          <Link href="/">
            <Button variant="primary" size="lg">Browse Deals</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}><CheckCircle2 size={48} /></div>
          <p className={styles.successKicker}>Order confirmed</p>
          <h1 className={styles.successTitle}>Your COUPONUS vouchers are ready.</h1>
          <p className={styles.successText}>
            {buyAsGift
              ? giftMode === "physical"
                ? "We will prepare the physical gift card and send it to the recipient address."
                : "The online gift voucher will be sent to the recipient details you provided."
              : "Your vouchers have been generated and sent to your account."}
          </p>
          <div className={styles.successVouchers}>
            <div className={styles.voucherPreview}>
              <span className={styles.voucherRibbon}>Gift-ready</span>
              <p className={styles.voucherLabel}>Voucher Code</p>
              <p className={styles.voucherCode}>CPB-A7F3BC-M2K9X</p>
              <p className={styles.voucherExpiry}>Expires: May 15, 2026</p>
            </div>
          </div>
          <div className={styles.successActions}>
            <Link href="/account/vouchers"><Button variant="primary" size="lg">View My Vouchers</Button></Link>
            <Link href="/"><Button variant="outline" size="lg">Continue Shopping</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.hero}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <Link href="/" className={styles.backLink} style={{ marginBottom: 0 }}><ArrowLeft size={18} /> Continue Shopping</Link>
            <div className={styles.steps} style={{ marginTop: 0 }} aria-label="Checkout progress">
              <StepPill active={step === "details"} done={step !== "details"} label="Details" />
              <ChevronRight size={15} />
              <StepPill active={step === "payment"} done={step === "confirm"} label="Payment" />
              <ChevronRight size={15} />
              <StepPill active={step === "confirm"} done={false} label="Confirm" />
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <main className={styles.mainCol}>
            {step === "details" && (
              <>
                <section className={styles.panel}>
                  <PanelHeader icon={User} eyebrow="Short information" title="Buyer details" text="Only the essentials needed to generate and deliver your voucher." />
                  <div className={styles.fieldGrid}>
                    <TextField label="Full name" icon={User} value={buyer.name} onChange={(value) => setBuyer({ ...buyer, name: value })} placeholder="Your full name" autoComplete="name" />
                    <TextField label="Email" icon={Mail} type="email" value={buyer.email} onChange={(value) => setBuyer({ ...buyer, email: value })} placeholder="you@example.com" autoComplete="email" />
                    <TextField label="Phone number" icon={Phone} type="tel" value={buyer.phone} onChange={(value) => setBuyer({ ...buyer, phone: value.replace(/[^0-9+]/g, "") })} placeholder="01XXXXXXXXX" autoComplete="tel" />
                  </div>
                </section>

                <section className={styles.panel}>
                  <PanelHeader icon={Gift} eyebrow="Gift mode" title="Are you buying this as a gift?" text="Send online instantly, or make it feel premium with a physical voucher card." />
                  <div className={styles.giftToggleRow}>
                    <button className={cn(styles.choiceCard, !buyAsGift && styles.choiceActive)} onClick={() => setBuyAsGift(false)} type="button">
                      <Sparkles size={20} />
                      <span>For myself</span>
                      <small>Voucher goes to my account</small>
                    </button>
                    <button className={cn(styles.choiceCard, buyAsGift && styles.choiceActive)} onClick={() => setBuyAsGift(true)} type="button">
                      <Gift size={20} />
                      <span>Buy as gift</span>
                      <small>Add recipient and delivery</small>
                    </button>
                  </div>

                  {buyAsGift && (
                    <div className={styles.giftBox}>
                      <div className={styles.segmentedControl}>
                        <button className={cn(styles.segment, giftMode === "online" && styles.segmentActive)} onClick={() => setGiftMode("online")} type="button">
                          <Send size={16} /> Online voucher
                        </button>
                        <button className={cn(styles.segment, giftMode === "physical" && styles.segmentActive)} onClick={() => setGiftMode("physical")} type="button">
                          <Truck size={16} /> Physical gift card
                        </button>
                      </div>

                      <div className={styles.fieldGrid}>
                        <TextField label="Recipient name" icon={User} value={giftInfo.recipientName} onChange={(value) => setGiftInfo({ ...giftInfo, recipientName: value })} placeholder="Gift receiver name" />
                        <TextField label="Recipient phone" icon={Phone} type="tel" value={giftInfo.recipientPhone} onChange={(value) => setGiftInfo({ ...giftInfo, recipientPhone: value.replace(/[^0-9+]/g, "") })} placeholder="01XXXXXXXXX" />
                        <TextField label="Recipient email (optional)" icon={Mail} type="email" value={giftInfo.recipientEmail} onChange={(value) => setGiftInfo({ ...giftInfo, recipientEmail: value })} placeholder="Send online voucher by email" />
                      </div>

                      {giftMode === "physical" && (
                        <div className={styles.deliveryBlock}>
                          <TextField label="Delivery address" icon={MapPin} value={giftInfo.address} onChange={(value) => setGiftInfo({ ...giftInfo, address: value })} placeholder="House, road, area, city" />
                          <div className={styles.deliveryChoices}>
                            <button className={cn(styles.deliveryChoice, deliveryZone === "inside_dhaka" && styles.deliveryActive)} onClick={() => setDeliveryZone("inside_dhaka")} type="button">
                              <span>Inside Dhaka</span>
                              <strong>{formatBDT(50)}</strong>
                            </button>
                            <button className={cn(styles.deliveryChoice, deliveryZone === "outside_dhaka" && styles.deliveryActive)} onClick={() => setDeliveryZone("outside_dhaka")} type="button">
                              <span>Outside Dhaka</span>
                              <strong>{formatBDT(90)}</strong>
                            </button>
                          </div>
                        </div>
                      )}

                      <label className={styles.noteField}>
                        <span>Gift message</span>
                        <textarea value={giftInfo.note} onChange={(event) => setGiftInfo({ ...giftInfo, note: event.target.value })} placeholder="Write a short message for the receiver..." rows={3} />
                      </label>
                    </div>
                  )}
                </section>

                <section className={cn(styles.panel, styles.optionalPanel)}>
                  <PanelHeader icon={Zap} eyebrow="Smart offers" title="Upgrade the order" text="Premium add-ons are optional and easy to remove before payment." />
                  <div className={styles.offerGrid}>
                    {(Object.keys(OFFER_ITEMS) as OfferKey[]).map((key) => {
                      const offer = OFFER_ITEMS[key];
                      const selected = selectedOffers[key];
                      return (
                        <button key={key} className={cn(styles.offerCard, selected && styles.offerSelected)} onClick={() => toggleOffer(key)} type="button">
                          <span className={styles.offerIcon}>{key === "premiumGiftWrap" ? <Gift size={20} /> : <Zap size={20} />}</span>
                          <span className={styles.offerTitle}>{offer.label}</span>
                          <span className={styles.offerText}>{offer.description}</span>
                          <strong>{formatBDT(offer.price)}</strong>
                        </button>
                      );
                    })}
                  </div>
                  {buyAsGift && !selectedOffers.premiumGiftWrap && (
                    <button className={cn(styles.downsellCard, digitalMessage && styles.downsellActive)} onClick={() => setDigitalMessage((value) => !value)} type="button">
                      <BadgePercent size={18} />
                      <span><strong>Free downsell:</strong> Add a digital gift message instead of premium packaging.</span>
                    </button>
                  )}
                </section>

                <section className={cn(styles.panel, styles.optionalPanel)}>
                  <PanelHeader icon={ShoppingBag} eyebrow="Cross-sell" title="Pairs well with your order" text="Add one more voucher while checkout is open." />
                  <div className={styles.crossSellGrid}>
                    {suggestedDeals.map((deal) => (
                      <article key={deal.id} className={styles.crossSellCard}>
                        <Image src={deal.images[0] || "/placeholder-deal.jpg"} alt={deal.title} width={96} height={72} className={styles.crossSellImage} />
                        <div className={styles.crossSellInfo}>
                          <p>{deal.title}</p>
                          <span>{deal.merchant.businessName}</span>
                          <strong>{formatBDT(deal.dealPrice)}</strong>
                        </div>
                        <button onClick={() => addSuggestedDeal(deal)} type="button">Add</button>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}

            {step === "payment" && (
              <section className={styles.panel}>
                <PanelHeader icon={Smartphone} eyebrow="Payment" title="Pay with bKash" text="Enter the bKash number that will approve this payment." />
                <div className={styles.bkashCard}>
                  <div className={styles.bkashHeader}>
                    <div className={styles.bkashLogo}><Smartphone size={24} /><span>bKash</span></div>
                    <span>Mobile Payment</span>
                  </div>
                  <div className={styles.bkashForm}>
                    <label className={styles.formLabel}>bKash Account Number</label>
                    <div className={styles.phoneInput}>
                      <span className={styles.phonePrefix}>+880</span>
                      <input type="tel" placeholder="1XXXXXXXXX" value={bkashPhone} onChange={(event) => setBkashPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} className={styles.phoneField} />
                    </div>
                    <p className={styles.bkashNote}>You will receive a payment confirmation on your bKash app. Demo OTP: <strong>123456</strong></p>
                  </div>
                </div>
              </section>
            )}

            {step === "confirm" && (
              <section className={styles.confirmCard}>
                <div className={styles.confirmIcon}><Lock size={32} /></div>
                <p className={styles.confirmKicker}>Final confirmation</p>
                <h2>Confirm {formatBDT(total)} payment</h2>
                <p>Payment from bKash account <strong>+880{bkashPhone || "1XXXXXXXXX"}</strong>. Your voucher will be issued immediately after confirmation.</p>
                <div className={styles.otpInputs}>
                  {[1, 2, 3, 4, 5, 6].map((digit) => <input key={digit} type="text" maxLength={1} defaultValue={String(digit)} className={styles.otpDigit} aria-label={`OTP digit ${digit}`} />)}
                </div>
              </section>
            )}
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <h3>Order Summary</h3>
                <span>{cart.length} item{cart.length === 1 ? "" : "s"}</span>
              </div>

              <div className={styles.cartItemsMini}>
                {cart.map((item) => (
                  <div key={item.dealId} className={styles.cartItem}>
                    <Image src={item.imageUrl} alt={item.dealTitle} width={76} height={58} className={styles.cartImage} />
                    <div className={styles.cartInfo}>
                      <p>{item.dealTitle}</p>
                      <span>{item.optionTitle}</span>
                      <small>{item.merchantName}</small>
                    </div>
                    <div className={styles.cartRight}>
                      <div className={styles.cartQuantity}>
                        <button onClick={() => updateQuantity(item.dealId, -1)} type="button"><Minus size={13} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.dealId, 1)} type="button"><Plus size={13} /></button>
                      </div>
                      <strong>{formatBDT(item.unitPrice * item.quantity)}</strong>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.dealId)} type="button" aria-label={`Remove ${item.dealTitle}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.promoSection}>
                <Tag size={16} />
                <input type="text" placeholder="Promo code (BDDEALS)" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
                <button onClick={applyPromo} disabled={promoApplied} type="button">{promoApplied ? "Applied" : "Apply"}</button>
              </div>

              <div className={styles.summaryRows}>
                <SummaryRow label="Subtotal" value={formatBDT(subtotal)} />
                {discount > 0 && <SummaryRow label="Promo discount" value={`-${formatBDT(discount)}`} tone="discount" />}
                <SummaryRow label="Service fee" value={formatBDT(serviceFee)} />
                {addOnTotal > 0 && <SummaryRow label="Premium add-ons" value={formatBDT(addOnTotal)} />}
                {deliveryFee > 0 && <SummaryRow label={deliveryZone === "inside_dhaka" ? "Inside Dhaka delivery" : "Outside Dhaka delivery"} value={formatBDT(deliveryFee)} />}
                <div className={styles.summaryTotal}><span>Total</span><strong>{formatBDT(total)}</strong></div>
              </div>

              <div className={styles.savingsCard}>
                <Star size={16} /> You save {formatBDT(savings)} on this order.
              </div>

              {step === "details" && (
                <Button variant="primary" size="lg" fullWidth onClick={() => setStep("payment")} disabled={!detailsReady}>
                  Continue to payment <CreditCard size={18} />
                </Button>
              )}
              {step === "payment" && (
                <Button variant="primary" size="lg" fullWidth onClick={() => handlePaymentStep("confirm")} loading={isProcessing} disabled={bkashPhone.length < 10}>
                  Pay {formatBDT(total)} with bKash <Smartphone size={18} />
                </Button>
              )}
              {step === "confirm" && (
                <Button variant="primary" size="lg" fullWidth onClick={() => handlePaymentStep("success")} loading={isProcessing}>
                  Confirm Payment <CheckCircle2 size={18} />
                </Button>
              )}

              <div className={styles.trustRow}><Shield size={14} /><span>Secure checkout. Voucher support if merchant redemption fails.</span></div>
            </div>
          </aside>
        </div>

        <div className={styles.mobileCheckoutBar}>
          <div>
            <span>Total</span>
            <strong>{formatBDT(total)}</strong>
          </div>
          {step === "details" && (
            <button onClick={() => setStep("payment")} disabled={!detailsReady} type="button">
              {detailsReady ? "Continue to payment" : "Fill details"}
            </button>
          )}
          {step === "payment" && (
            <button onClick={() => handlePaymentStep("confirm")} disabled={bkashPhone.length < 10 || isProcessing} type="button">
              {isProcessing ? "Processing..." : "Pay now"}
            </button>
          )}
          {step === "confirm" && (
            <button onClick={() => handlePaymentStep("success")} disabled={isProcessing} type="button">
              {isProcessing ? "Confirming..." : "Confirm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepPill({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return <span className={cn(styles.stepPill, active && styles.stepActive, done && styles.stepDone)}>{done ? <CheckCircle2 size={14} /> : null}{label}</span>;
}

function PanelHeader({ icon: Icon, eyebrow, title, text }: { icon: React.ElementType; eyebrow: string; title: string; text: string }) {
  return (
    <div className={styles.panelHeader}>
      <div className={styles.panelIcon}><Icon size={20} /></div>
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{text}</span>
      </div>
    </div>
  );
}

function TextField({ label, icon: Icon, value, onChange, placeholder, type = "text", autoComplete }: { label: string; icon: React.ElementType; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.inputShell}>
        <Icon size={16} />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} />
      </div>
    </label>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "discount" }) {
  return <div className={cn(styles.summaryRow, tone === "discount" && styles.summaryDiscount)}><span>{label}</span><strong>{value}</strong></div>;
}

function getSuggestedDeals(cart: CartItem[]) {
  const cartDealIds = new Set(cart.map((item) => item.dealId));
  const cartMerchantNames = new Set(cart.map((item) => item.merchantName));
  return DEMO_DEALS
    .filter((deal) => !cartDealIds.has(deal.id))
    .sort((a, b) => Number(cartMerchantNames.has(b.merchant.businessName)) - Number(cartMerchantNames.has(a.merchant.businessName)) || b.discountPercent - a.discountPercent)
    .slice(0, 3);
}

function isBuyerReady(buyer: BuyerInfo) {
  return buyer.name.trim().length >= 2 && buyer.email.includes("@") && buyer.phone.replace(/\D/g, "").length >= 10;
}

function isGiftReady(giftInfo: GiftInfo, giftMode: GiftMode) {
  const hasRecipient = giftInfo.recipientName.trim().length >= 2 && giftInfo.recipientPhone.replace(/\D/g, "").length >= 10;
  if (giftMode === "online") return hasRecipient;
  return hasRecipient && giftInfo.address.trim().length >= 8;
}
