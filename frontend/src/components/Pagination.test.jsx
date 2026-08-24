import { render, screen, fireEvent } from "@testing-library/react";
import Pagination, { getPageNumbers } from "./Pagination";

describe("getPageNumbers (page number generation logic)", () => {
  test("returns all pages with no ellipsis when total pages is small", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test("shows ellipsis after the leading pages when current page is near the start", () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
  });

  test("shows ellipsis before the trailing pages when current page is near the end", () => {
    expect(getPageNumbers(10, 10)).toEqual([1, "ellipsis", 9, 10]);
    expect(getPageNumbers(9, 10)).toEqual([1, "ellipsis", 8, 9, 10]);
  });

  test("shows ellipsis on both sides when current page is in the middle", () => {
    expect(getPageNumbers(12, 24)).toEqual([1, "ellipsis", 11, 12, 13, "ellipsis", 24]);
  });

  test("debug challenge: last page never appears twice on pages near the end", () => {
    const result = getPageNumbers(24, 24);
    const occurrencesOfLastPage = result.filter((p) => p === 24).length;
    expect(occurrencesOfLastPage).toBe(1);
    expect(result).toEqual([1, "ellipsis", 23, 24]);
  });

  test("debug challenge: first page never appears twice on pages near the start", () => {
    const result = getPageNumbers(1, 24);
    const occurrencesOfFirstPage = result.filter((p) => p === 1).length;
    expect(occurrencesOfFirstPage).toBe(1);
  });
});

describe("Pagination component", () => {
  test("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("Previous button is disabled on the first page", () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  test("Next button is disabled on the last page", () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  test("Previous and Next are both enabled on a middle page", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  test("clicking a page number calls onPageChange with that page", () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  test("clicking Next calls onPageChange with currentPage + 1", () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  test("clicking Previous calls onPageChange with currentPage - 1", () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  test("renders ellipsis characters for large page counts", () => {
    render(<Pagination currentPage={12} totalPages={24} onPageChange={jest.fn()} />);
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBe(2);
  });

  test("the current page button is marked with aria-current", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
