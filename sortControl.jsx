import "./SortControls.css";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "dateListed-desc", label: "Newest Listed" },
  { value: "dateListed-asc", label: "Oldest Listed" },
  { value: "sqft-desc", label: "Largest Sqft" },
  { value: "sqft-asc", label: "Smallest Sqft" },
  { value: "beds-desc", label: "Most Beds" },
  { value: "beds-asc", label: "Fewest Beds" },
];

export default function SortControls({ sortBy, sortOrder, onChange }) {
  const currentValue = sortBy ? sortBy + "-" + sortOrder : "";

  function handleChange(e) {
    const value = e.target.value;
    if (value === "") {
      onChange({ sortBy: undefined, sortOrder: undefined });
      return;
    }
    const parts = value.split("-");
    onChange({ sortBy: parts[0], sortOrder: parts[1] });
  }

  return (
    <div className="sort-controls">
      <label htmlFor="sort-select" className="sort-controls-label">
        Sort by
      </label>
      <select
        id="sort-select"
        className="sort-controls-select"
        value={currentValue}
        onChange={handleChange}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
