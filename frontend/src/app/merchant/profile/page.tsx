"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Camera, Image as ImageIcon, MapPin, Plus, Save, Store, Trash2 } from "lucide-react";
import styles from "../merchant.module.css";

function filesToPreviews(files: FileList | null) {
  if (!files) return [];
  return Array.from(files).map((file) => URL.createObjectURL(file));
}

export default function MerchantProfilePage() {
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  function updateLogo(event: ChangeEvent<HTMLInputElement>) {
    setLogoPreview(filesToPreviews(event.target.files)[0] || "");
  }

  function updateCover(event: ChangeEvent<HTMLInputElement>) {
    setCoverPreview(filesToPreviews(event.target.files)[0] || "");
  }

  function addGalleryImages(event: ChangeEvent<HTMLInputElement>) {
    setGalleryPreviews((current) => [...current, ...filesToPreviews(event.target.files)].slice(0, 8));
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Store size={16} /> Storefront profile</span>
          <h1 className={styles.heroTitle}>Your public business profile</h1>
          <p className={styles.heroText}>Control what customers see before buying — details, photos, hours, and policies.</p>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Profile complete</p>
          <p className={styles.heroPanelValue}>72%</p>
          <p className={styles.heroPanelMeta}>Add gallery to improve trust</p>
        </div>
      </section>

      {/* Progress Ring */}
      <div className={styles.progressRing}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-primary-100)" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-primary-500)" strokeWidth="4" strokeDasharray={`${0.72 * 125.6} 125.6`} strokeLinecap="round" transform="rotate(-90 24 24)" style={{ transition: "stroke-dasharray 0.6s ease-out" }} />
          <text x="24" y="28" textAnchor="middle" fill="var(--color-primary-700)" fontSize="11" fontWeight="800">72%</text>
        </svg>
        <div>
          <p className={styles.ringLabel}>Profile completion</p>
          <p className={styles.ringSub}>Add gallery photos and cover image to reach 100%</p>
        </div>
      </div>

      <section className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Business details</h2>
              <p className={styles.sectionSubtitle}>Appears on profile, deal pages, and vouchers.</p>
            </div>
            <button className={styles.primaryButton} type="button"><Save size={16} /> Save</button>
          </div>
          <form className={styles.formGrid}>
            <div className={styles.field}><label htmlFor="businessName">Business name</label><input id="businessName" defaultValue="Serenity Thai Spa" /></div>
            <div className={styles.field}><label htmlFor="businessCategory">Category</label><select id="businessCategory" defaultValue="beauty"><option value="beauty">Spa, salon, beauty</option><option value="restaurant">Restaurant</option><option value="hotel">Hotel bookings</option><option value="retail">Retail and clothing</option><option value="health">Hospital and clinic</option></select></div>
            <div className={styles.field}><label htmlFor="phone">Phone</label><input id="phone" defaultValue="01700-000000" /></div>
            <div className={styles.field}><label htmlFor="website">Website / booking URL</label><input id="website" placeholder="https://yourbusiness.com/book" /></div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}><label htmlFor="description">Description</label><textarea id="description" defaultValue="Premium spa with authentic Thai massage, aromatherapy, and relaxation treatments in Gulshan." /></div>
          </form>
        </div>

        <aside className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Preview</h2>
              <p className={styles.sectionSubtitle}>Live visual preview.</p>
            </div>
          </div>
          <div className={styles.profilePreview}>
            <div className={styles.coverPreview} style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined}>
              {!coverPreview && <span>Cover image</span>}
            </div>
            <div className={styles.profilePreviewBody}>
              <div className={styles.logoPreview} style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : undefined}>{!logoPreview && "SS"}</div>
              <div><p className={styles.itemTitle}>Serenity Thai Spa</p><p className={styles.itemMeta}>Gulshan 1, Dhaka - 4.8 ★</p></div>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Photos and media</h2>
            <p className={styles.sectionSubtitle}>Logo, cover, gallery, and service photos.</p>
          </div>
        </div>
        <div className={styles.mediaGrid}>
          <label className={styles.uploadBox}><input type="file" accept="image/*" onChange={updateLogo} /><Camera size={24} /><strong>Upload logo</strong><span>Square recommended</span></label>
          <label className={styles.uploadBox}><input type="file" accept="image/*" onChange={updateCover} /><ImageIcon size={24} /><strong>Upload cover</strong><span>Wide image for hero</span></label>
          <label className={styles.uploadBox}><input type="file" accept="image/*" multiple onChange={addGalleryImages} /><Plus size={24} /><strong>Add gallery</strong><span>Up to 8 photos</span></label>
        </div>
        {galleryPreviews.length > 0 && (
          <div className={styles.galleryGrid}>
            {galleryPreviews.map((preview, index) => (
              <div className={styles.galleryItem} key={preview} style={{ backgroundImage: `url(${preview})` }}>
                <button type="button" aria-label="Remove image" onClick={() => setGalleryPreviews((c) => c.filter((_, j) => j !== index))}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Location and hours</h2>
            <p className={styles.sectionSubtitle}>Single or multi-branch support.</p>
          </div>
          <button className={styles.secondaryButton} type="button"><Plus size={16} /> Add branch</button>
        </div>
        <form className={styles.formGrid}>
          <div className={styles.field}><label htmlFor="address">Address</label><input id="address" defaultValue="House 45, Road 12" /></div>
          <div className={styles.field}><label htmlFor="area">Area</label><input id="area" defaultValue="Gulshan 1" /></div>
          <div className={styles.field}><label htmlFor="city">City</label><input id="city" defaultValue="Dhaka" /></div>
          <div className={styles.field}><label htmlFor="hours">Opening hours</label><input id="hours" defaultValue="10:00 AM - 9:00 PM" /></div>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}><label htmlFor="rules">Booking rules</label><textarea id="rules" defaultValue="Appointment required. Valid Sunday to Thursday. Call for same-day bookings." /></div>
        </form>
        <div className={styles.statusCard} style={{ marginTop: "var(--space-4)" }}><MapPin size={18} /><p className={styles.itemMeta} style={{ marginLeft: "var(--space-2)" }}>Map pin and branch-specific hours coming soon.</p></div>
      </section>
    </div>
  );
}
