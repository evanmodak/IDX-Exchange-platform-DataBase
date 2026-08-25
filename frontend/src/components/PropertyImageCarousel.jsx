import { useState } from "react";
import { parsePhotos } from "../utils/parsePhotos";
import "./PropertyImageCarousel.css";

export default function PropertyImageCarousel({ photos, alt = "Property photo" }) {
  const images = parsePhotos(photos);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="carousel carousel-empty">
        <span>No photo available</span>
      </div>
    );
  }

  function goPrev(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goNext(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="carousel">
      <img className="carousel-image" src={images[index]} alt={alt} />

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev"
            onClick={goPrev}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-next"
            onClick={goNext}
            aria-label="Next photo"
          >
            ›
          </button>
          <div className="carousel-counter">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
