import { useEffect, useRef, useState } from "react";
import { parsePhotos } from "./parsePhotos";
import "./PropertyImageGallery.css";

export default function PropertyImageGallery({ photos, alt = "Property photo" }) {
  const images = parsePhotos(photos);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef(null);

  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [lightboxOpen]);

  function showPrev() {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function showNext() {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setLightboxOpen(false);
    } else if (e.key === "ArrowLeft") {
      showPrev();
    } else if (e.key === "ArrowRight") {
      showNext();
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      setLightboxOpen(false);
    }
  }

  if (images.length === 0) {
    return (
      <div className="gallery gallery-empty">
        <span>No photos available</span>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-main" onClick={() => setLightboxOpen(true)}>
        <img src={images[activeIndex]} alt={alt} className="gallery-main-image" />
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={
                i === activeIndex
                  ? "gallery-thumb gallery-thumb-active"
                  : "gallery-thumb"
              }
              onClick={() => setActiveIndex(i)}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="gallery-lightbox-overlay"
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            ×
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox-arrow gallery-lightbox-arrow-prev"
              onClick={showPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            src={images[activeIndex]}
            alt={alt}
            className="gallery-lightbox-image"
          />

          {images.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox-arrow gallery-lightbox-arrow-next"
              onClick={showNext}
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <div className="gallery-lightbox-counter">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
