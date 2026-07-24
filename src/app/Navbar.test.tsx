import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Navbar } from "./Navbar";

describe("Navbar (app-shell)", () => {
  it("renderiza el título de la app", () => {
    render(<Navbar />);

    expect(screen.getByText("Explorador Urbano")).toBeInTheDocument();
  });

  it("muestra el ítem de inicio de sesión sin sesión iniciada al abrir el menú", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("el menú está colapsado por defecto y el toggle lo indica de forma accesible", () => {
    render(<Navbar />);

    const toggle = screen.getByRole("button", { name: "Abrir menú" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("navigation", { hidden: true })).not.toBeVisible();
  });

  it("el toggle de hamburguesa abre y cierra el menú", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const toggle = screen.getByRole("button", { name: "Abrir menú" });

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeVisible();

    const closeToggle = screen.getByRole("button", { name: "Cerrar menú" });
    await user.click(closeToggle);

    expect(closeToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("navigation", { hidden: true })).not.toBeVisible();
  });

  it("el ítem de inicio de sesión es alcanzable por teclado", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const loginItem = screen.getByRole("button", { name: "Iniciar sesión" });

    loginItem.focus();

    expect(loginItem).toHaveFocus();
  });
});
