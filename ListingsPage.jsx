import { useEffect, useState } from "react";
import { fetchProperties, ApiError } from "../api/client";
import PropertyCard from "./PropertyCard";
import "./ListingsPage.css";

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProperties({ limit: 20, offset: 0 });
        if (!cancelled) {
          setProperties(data.results || []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Something went wrong while loading properties."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="listings-status">
        <p>Loading properties…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="listings-status listings-error">
        <p>We couldn't load properties: {error}</p>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="listings-count">
        Showing {properties.length} of {total} properties
      </div>
      <div className="listings-grid">
        {properties.map((property) => (
          <PropertyCard key={property.listingId || property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
