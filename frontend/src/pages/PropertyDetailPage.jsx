import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPropertyDetail, fetchPropertyOpenHouses, ApiError } from "../api/client";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import PropertyOpenHouses from "../components/PropertyOpenHouses";
import "./PropertyDetailPage.css";

function formatPrice(price) {
  if (price == null) return "Price unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatSqft(sqft) {
  if (sqft == null) return "—";
  return `${new Intl.NumberFormat("en-US").format(sqft)} sqft`;
}

export default function PropertyDetailPage() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setProperty(null);
    setOpenHouses([]);

    Promise.all([
      fetchPropertyDetail(id),
      fetchPropertyOpenHouses(id).catch(() => []),
    ])
      .then(([detail, openHouseData]) => {
        if (cancelled) return;
        setProperty(detail);
        setOpenHouses(openHouseData || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading this property."
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="property-detail-status">
        <p>Loading property…</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-detail-status property-detail-error">
        <p>{error || "This property could not be found."}</p>
        <Link to="/" className="property-detail-back-link">
          ← Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="property-detail-page">
      <Link to="/" className="property-detail-back-link">
        ← Back to listings
      </Link>

      <PropertyImageGallery
        photos={property.L_Photos}
        alt={property.address || "Property photo"}
      />

      <div className="property-detail-header">
        <div className="property-detail-price">{formatPrice(property.price)}</div>
        <div className="property-detail-address">
          {property.address}
          {property.city ? `, ${property.city}` : ""}
          {property.state ? `, ${property.state}` : ""}
          {property.zipcode ? ` ${property.zipcode}` : ""}
        </div>
      </div>

      <div className="property-detail-stats">
        <div className="stat">
          <span className="stat-value">{property.beds ?? "—"}</span>
          <span className="stat-label">Beds</span>
        </div>
        <div className="stat">
          <span className="stat-value">{property.baths ?? "—"}</span>
          <span className="stat-label">Baths</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatSqft(property.sqft)}</span>
          <span className="stat-label">Size</span>
        </div>
        <div className="stat">
          <span className="stat-value">{property.yearBuilt ?? "—"}</span>
          <span className="stat-label">Year Built</span>
        </div>
      </div>

      {property.description && (
        <div className="property-detail-description">
          <h2>Description</h2>
          <p>{property.description}</p>
        </div>
      )}

      <div className="property-detail-map-section">
        <h2>Location</h2>
        <PropertyMap
          latitude={property.latitude}
          longitude={property.longitude}
          address={property.address}
        />
      </div>

      <PropertyOpenHouses openHouses={openHouses} />
    </div>
  );
}
