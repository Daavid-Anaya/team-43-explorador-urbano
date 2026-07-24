import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { useOnlineStatus } from "../shared/pwa/useOnlineStatus";
import { useServiceWorkerUpdate } from "../shared/pwa/useServiceWorkerUpdate";

vi.mock("../shared/pwa/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(),
}));

vi.mock("../shared/pwa/useServiceWorkerUpdate", () => ({
  useServiceWorkerUpdate: vi.fn(),
}));

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);
const mockUseServiceWorkerUpdate = vi.mocked(useServiceWorkerUpdate);

describe("App", () => {
  beforeEach(() => {
    mockUseOnlineStatus.mockReturnValue(true);
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: false,
      offlineReady: false,
      applyUpdate: vi.fn(),
      dismissOfflineReady: vi.fn(),
    });
  });

  it("renderiza el shell de la aplicación", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Explorador Urbano" }),
    ).toBeInTheDocument();
  });

  it("muestra un indicador de en línea cuando hay conexión", () => {
    mockUseOnlineStatus.mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("En línea");
  });

  it("muestra un indicador de sin conexión cuando no hay conexión", () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Sin conexión");
  });

  it("oculta el banner de actualización cuando no hay actualización disponible", () => {
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: false,
      offlineReady: false,
      applyUpdate: vi.fn(),
      dismissOfflineReady: vi.fn(),
    });

    render(<App />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra un banner de actualización y aplica la actualización al hacer clic", async () => {
    const applyUpdate = vi.fn().mockResolvedValue(undefined);
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: true,
      offlineReady: false,
      applyUpdate,
      dismissOfflineReady: vi.fn(),
    });
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nueva versión disponible",
    );

    await user.click(screen.getByRole("button", { name: "Actualizar" }));

    expect(applyUpdate).toHaveBeenCalledTimes(1);
  });
});
