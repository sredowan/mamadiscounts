"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import styles from "./HeroSlider.module.css";

const SLIDES = [
  {
    id: 1,
    image: "/images/hero/slide1.png",
    title: "Discover Amazing Local Deals",
    subtitle: "Up to 90% Off Top Spas, Restaurants, and Activities Near You.",
    ctaText: "Explore Now",
    ctaLink: "/deals",
  },
  {
    id: 2,
    image: "/images/hero/slide2.jpg",
    title: "Weekend Brunch Specials",
    subtitle: "Taste the best buffet and premium dining across Dhaka for less.",
    ctaText: "See Food Deals",
    ctaLink: "/category/food-and-drink",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  return (
    <div className={styles.sliderContainer}>
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${index === currentSlide ? styles.active : ""}`}
        >
          <div className={styles.imageOverlay}></div>
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            className={styles.backgroundImage}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />

          <div className={styles.slideContent}>
            <div className="container">
              <div className={styles.textWrapper}>
                <h1 className={styles.title}>{slide.title}</h1>
                <p className={styles.subtitle}>{slide.subtitle}</p>
                
                <div className={styles.searchPrompt}>
                  <div className={styles.fakeSearch}>
                    <Search size={20} className={styles.searchIcon} />
                    <span>What are you looking for today?</span>
                  </div>
                  <Link href={slide.ctaLink} className={styles.ctaButton}>
                    {slide.ctaText}
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={goToPrev}>
        <ChevronLeft size={24} />
      </button>
      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={goToNext}>
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className={styles.dots}>
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ""}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
