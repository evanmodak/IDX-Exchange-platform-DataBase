import { getFirstPhoto } from "../utils/parsePhotos";
import "./PropertyCard.css";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e2e2e2'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Photo Available%3C/text%3E%3C/svg%3E";

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

  const photoUrl = getFirstPhoto(L_Photos) || PLACEHOLDER_IMAGE;

  return (
    <div className="property-card">
      <div className="property-card-image-wrap">
        <img
          src={photoUrl}
          alt={address ? `Photo of ${address}` : "Property photo"}
          className="property-card-image"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>
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
<span>{sqft ? `${Number(sqft).toLocaleString()} lot sqft` : "— lot sqft"}</span>        </div>
      </div>
    </div>
  );
}
