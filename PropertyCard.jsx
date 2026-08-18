import { Link } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";
import "./PropertyCard.css";

function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) {
    return "Price unavailable";
  }
  return `$${Number(price).toLocaleString()}`;
}

function formatBaths(baths) {
  if (baths === null || baths === undefined) return "—";
  const n = parseFloat(baths);
  return isNaN(n) ? "—" : n;
}

export default function PropertyCard({ property }) {
  const {
    listingId,
    address,
    city,
    state,
    zipcode,
    price,
    beds,
    baths,
    sqft,
    L_Photos,
  } = property;

  return (
    <Link to={`/property/${listingId}`} className="property-card">
      <PropertyImageCarousel
        photos={L_Photos}
        alt={address ? `Photo of ${address}` : "Property photo"}
      />
      <div className="property-card-body">
        <div className="property-card-price">{formatPrice(price)}</div>
        <div className="property-card-address">{address || "Address unavailable"}</div>
        <div className="property-card-citystate">
          {city || "Unknown city"}
          {state ? `, ${state}` : ""} {zipcode || ""}
        </div>
        <div className="property-card-stats">
          <span>{beds ?? "—"} bd</span>
          <span>{formatBaths(baths)} ba</span>
          <span>{sqft ? `${Number(sqft).toLocaleString()} lot sqft` : "— lot sqft"}</span>
        </div>
      </div>
    </Link>
  );
}
