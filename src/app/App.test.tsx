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

  it("renders the application shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Explorador Urbano" }),
    ).toBeInTheDocument();
  });

  it("shows an online indicator when connected", () => {
    mockUseOnlineStatus.mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("En línea");
  });

  it("shows an offline indicator when disconnected", () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Sin conexión");
  });

  it("hides the update banner when no update is available", () => {
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: false,
      offlineReady: false,
      applyUpdate: vi.fn(),
      dismissOfflineReady: vi.fn(),
    });

    render(<App />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an update banner and applies the update on click", async () => {
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
