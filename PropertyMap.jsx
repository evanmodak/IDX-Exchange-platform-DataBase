import "./PropertyMap.css";

export default function PropertyMap({ latitude, longitude, address }) {
  if (latitude == null || longitude == null || latitude === "" || longitude === "") {
    return null;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const coords = `${latitude},${longitude}`;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coords}&zoom=15`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;

  if (!apiKey) {
    return (
      <div className="property-map property-map-missing-key">
        Map unavailable: REACT_APP_GOOGLE_MAPS_API_KEY is not set.
      </div>
    );
  }

  return (
    <div className="property-map">
      <iframe
        title={address ? `Map showing ${address}` : "Property location map"}
        className="property-map-frame"
        src={embedUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="property-map-directions">
        Get Directions
      </a>
    </div>
  );
}
