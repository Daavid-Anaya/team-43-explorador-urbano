import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useOnlineStatus } from "./useOnlineStatus";

describe("useOnlineStatus", () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: originalOnLine,
    });
  });

  function setNavigatorOnLine(value: boolean) {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value,
    });
  }

  it("reflects navigator.onLine as the initial value", () => {
    setNavigatorOnLine(true);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);
  });

  it("switches to false when the offline event fires", () => {
    setNavigatorOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      setNavigatorOnLine(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toBe(false);
  });

  it("switches back to true when the online event fires", () => {
    setNavigatorOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      setNavigatorOnLine(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });
});
