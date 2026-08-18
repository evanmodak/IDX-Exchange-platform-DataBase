import { useEffect, useRef, useState } from "react";
import { fetchProperties, ApiError } from "../api/client";
import PropertyCard from "./PropertyCard";
import PropertyFilters from "./PropertyFilters";
import SortControls from "./SortControls";
import Pagination from "./Pagination";
import "./ListingsPage.css";

const ITEMS_PER_PAGE = 20;

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});
  const [sort, setSort] = useState({ sortBy: undefined, sortOrder: undefined });

  const latestRequestId = useRef(0);

  function loadProperties(filters, page, sortState) {
    const requestId = ++latestRequestId.current;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    setLoading(true);
    setError(null);

    fetchProperties({
      ...filters,
      limit: ITEMS_PER_PAGE,
      offset,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    })
      .then((data) => {
        if (requestId !== latestRequestId.current) return;
        setProperties(data.results || []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        if (requestId !== latestRequestId.current) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading properties."
        );
      })
      .finally(() => {
        if (requestId !== latestRequestId.current) return;
        setLoading(false);
      });
  }

  useEffect(() => {
    loadProperties({}, 1, { sortBy: undefined, sortOrder: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(filters) {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value != null)
    );
    const resetSort = { sortBy: undefined, sortOrder: undefined };
    setActiveFilters(cleaned);
    setSort(resetSort);
    setCurrentPage(1);
    loadProperties(cleaned, 1, resetSort);
  }

  function handleClear() {
    const resetSort = { sortBy: undefined, sortOrder: undefined };
    setActiveFilters({});
    setSort(resetSort);
    setCurrentPage(1);
    loadProperties({}, 1, resetSort);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    loadProperties(activeFilters, page, sort);
    window.scrollTo(0, 0);
  }

  function handleSortChange(newSort) {
    setSort(newSort);
    setCurrentPage(1);
    loadProperties(activeFilters, 1, newSort);
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="listings-page">
      <PropertyFilters onSearch={handleSearch} onClear={handleClear} />

      {loading && (
        <div className="listings-status">
          <p>Loading properties…</p>
        </div>
      )}

      {!loading && error && (
        <div className="listings-status listings-error">
          <p>We couldn't load properties: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="listings-toolbar">
            <div className="listings-count">
              {total > 0
                ? "Showing " + rangeStart + "-" + rangeEnd + " of " + total + " properties"
                : "No properties found matching your filters."}
            </div>
            <SortControls
              sortBy={sort.sortBy}
              sortOrder={sort.sortOrder}
              onChange={handleSortChange}
            />
          </div>

          {properties.length === 0 ? (
            <div className="listings-status listings-empty">
              <p>
                No properties match your search. Try adjusting or clearing your
                filters.
              </p>
            </div>
          ) : (
            <>
              <div className="listings-grid">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.listingId || property.id}
                    property={property}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
