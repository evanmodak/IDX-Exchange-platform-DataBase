import { render, screen } from "@testing-library/react";
import App from "./App";

// App renders ListingsPage at the root route, which calls fetchProperties
// on mount. Mock fetch so this smoke test doesn't depend on a live
// backend being reachable during CI.
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ total: 0, limit: 20, offset: 0, results: [] }),
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders the listings page with the property filters form at the root route", async () => {
  render(<App />);
  // PropertyFilters' City input is a reliable, stable landmark that the
  // root route renders correctly regardless of what the (mocked) API
  // call returns.
  expect(await screen.findByLabelText(/city/i)).toBeInTheDocument();
});
