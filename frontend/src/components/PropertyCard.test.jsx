import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const baseProperty = {
  listingId: "1234567890",
  address: "123 Main St",
  city: "Beverly Hills",
  state: "CA",
  zipcode: "90210",
  price: 1500000,
  beds: 4,
  baths: "2.5",
  sqft: 5000,
  L_Photos: JSON.stringify(["https://example.com/photo1.jpg"]),
};

// PropertyCard renders a react-router <Link>, which needs a router
// context above it or it throws -- MemoryRouter provides that context
// without touching the real browser URL.
function renderCard(property = baseProperty) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<PropertyCard property={property} />} />
        <Route path="/property/:id" element={<div>Property Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PropertyCard", () => {
  test("renders the property's price, address, and city/state/zip", () => {
    renderCard();

    expect(screen.getByText("$1,500,000")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText(/Beverly Hills, CA 90210/)).toBeInTheDocument();
  });

  test("renders beds, baths, and sqft stats", () => {
    renderCard();

    expect(screen.getByText("4 bd")).toBeInTheDocument();
    expect(screen.getByText("2.5 ba")).toBeInTheDocument();
    expect(screen.getByText("5,000 lot sqft")).toBeInTheDocument();
  });

  test("falls back to placeholder text when price is missing", () => {
    renderCard({ ...baseProperty, price: null });
    expect(screen.getByText("Price unavailable")).toBeInTheDocument();
  });

  test("falls back to placeholder text when address is missing", () => {
    renderCard({ ...baseProperty, address: null });
    expect(screen.getByText("Address unavailable")).toBeInTheDocument();
  });

  test("links to the correct property detail route", () => {
    renderCard();
    // A <Link> renders as an <a>, so its href is the most direct way to
    // confirm it points at the right route without simulating a click.
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/property/1234567890");
  });

  test("falls back to id when listingId is not present", () => {
    renderCard({ ...baseProperty, listingId: undefined, id: 42 });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/property/42");
  });

  test("clicking the card navigates to the property detail page", () => {
    renderCard();

    // Before the click, the detail route's content shouldn't be rendered yet.
    expect(screen.queryByText("Property Detail Page")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link"));

    expect(screen.getByText("Property Detail Page")).toBeInTheDocument();
  });

  test("shows an em dash when baths is not a valid number", () => {
    renderCard({ ...baseProperty, baths: "not-a-number" });
    expect(screen.getByText("— ba")).toBeInTheDocument();
  });
});
