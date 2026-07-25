import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("../features/discovery/DiscoveryView", () => ({
  DiscoveryView: () => <section aria-label="Retos urbanos cercanos" />,
}));

describe("App", () => {
  it("renders the application shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Explorador Urbano" }),
    ).toBeInTheDocument();
  });
});
