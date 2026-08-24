import { render, screen, fireEvent } from "@testing-library/react";
import PropertyFilters from "./PropertyFilters";

describe("PropertyFilters", () => {
  test("renders all six filter inputs", () => {
    render(<PropertyFilters onSearch={jest.fn()} onClear={jest.fn()} />);

    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^beds$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^baths$/i)).toBeInTheDocument();
  });

  test("calls onSearch with the entered filter values when the form is submitted", () => {
    const handleSearch = jest.fn();
    render(<PropertyFilters onSearch={handleSearch} onClear={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "Beverly Hills" },
    });
    fireEvent.change(screen.getByLabelText(/min price/i), {
      target: { value: "500000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        city: "Beverly Hills",
        minPrice: "500000",
      })
    );
  });

  test("combines multiple filters into a single onSearch call", () => {
    const handleSearch = jest.fn();
    render(<PropertyFilters onSearch={handleSearch} onClear={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "Alhambra" },
    });
    fireEvent.change(screen.getByLabelText(/zip code/i), {
      target: { value: "91801" },
    });
    fireEvent.change(screen.getByLabelText(/^beds$/i), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        city: "Alhambra",
        zipcode: "91801",
        beds: "3",
      })
    );
  });

  test("Clear Filters button resets all inputs and calls onClear", () => {
    const handleClear = jest.fn();
    render(<PropertyFilters onSearch={jest.fn()} onClear={handleClear} />);

    const cityInput = screen.getByLabelText(/city/i);
    fireEvent.change(cityInput, { target: { value: "Calabasas" } });
    expect(cityInput.value).toBe("Calabasas");

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(cityInput.value).toBe("");
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  test("does not call onSearch when Clear Filters is clicked", () => {
    const handleSearch = jest.fn();
    render(<PropertyFilters onSearch={handleSearch} onClear={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(handleSearch).not.toHaveBeenCalled();
  });
});
