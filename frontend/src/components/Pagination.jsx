import "./Pagination.css";


export function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages]);

  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);
  for (let p = windowStart; p <= windowEnd; p++) {
    pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    if (i > 0 && page - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }

  return result;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageItems = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <div className="pagination-pages">
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={
                item === currentPage
                  ? "pagination-page pagination-page-active"
                  : "pagination-page"
              }
              aria-current={item === currentPage ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}
