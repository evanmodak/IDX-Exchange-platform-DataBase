import { useState } from "react";
import "./PropertyFilters.css";

const BEDS_OPTIONS = [1, 2, 3, 4, 5];
const BATHS_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5];

const EMPTY_FILTERS = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

export default function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  function handleChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    onClear();
  }

  return (
    <form className="property-filters" onSubmit={handleSubmit}>
      <div className="property-filters-row">
        <div className="property-filters-field">
          <label htmlFor="filter-city">City</label>
          <input
            id="filter-city"
            type="text"
            value={filters.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="e.g. Beverly Hills"
          />
        </div>

        <div className="property-filters-field">
          <label htmlFor="filter-zipcode">Zip Code</label>
          <input
            id="filter-zipcode"
            type="text"
            value={filters.zipcode}
            onChange={(e) => handleChange("zipcode", e.target.value)}
            placeholder="e.g. 90210"
          />
        </div>

        <div className="property-filters-field">
          <label htmlFor="filter-min-price">Min Price</label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => handleChange("minPrice", e.target.value)}
            placeholder="No min"
          />
        </div>

        <div className="property-filters-field">
          <label htmlFor="filter-max-price">Max Price</label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
            placeholder="No max"
          />
        </div>

        <div className="property-filters-field">
          <label htmlFor="filter-beds">Beds</label>
          <select
            id="filter-beds"
            value={filters.beds}
            onChange={(e) => handleChange("beds", e.target.value)}
          >
            <option value="">Any</option>
            {BEDS_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>

        <div className="property-filters-field">
          <label htmlFor="filter-baths">Baths</label>
          <select
            id="filter-baths"
            value={filters.baths}
            onChange={(e) => handleChange("baths", e.target.value)}
          >
            <option value="">Any</option>
            {BATHS_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="property-filters-actions">
        <button type="submit" className="property-filters-search">
          Search
        </button>
        <button
          type="button"
          className="property-filters-clear"
          onClick={handleClear}
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
}
