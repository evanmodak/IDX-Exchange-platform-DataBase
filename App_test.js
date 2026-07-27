import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the property filters form", () => {
  render(<App />);
  expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
});
