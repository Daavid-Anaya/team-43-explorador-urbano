import type { LocationErrorReason } from "../../shared/browser/locationService";

const DISCOVERY_EVENT = {
  CATALOG_LOAD_FAILED: "catalog-load-failed",
  GEOLOCATION_FALLBACK: "geolocation-fallback",
} as const;

export type DiscoveryEventName = (typeof DISCOVERY_EVENT)[keyof typeof DISCOVERY_EVENT];

export interface DiscoveryEvent {
  name: DiscoveryEventName;
  message?: string;
  reason?: LocationErrorReason;
}

export interface DiscoveryObservability {
  capture(event: DiscoveryEvent): void;
}

interface BrowserDiscoveryObservabilityOptions {
  endpoint?: string;
  sendBeacon?: Navigator["sendBeacon"];
  warn?: typeof console.warn;
}

function getBrowserSendBeacon(): Navigator["sendBeacon"] | undefined {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) {
    return undefined;
  }

  return navigator.sendBeacon.bind(navigator);
}

function getObservabilityEndpoint(): string | undefined {
  const endpoint = import.meta.env.VITE_OBSERVABILITY_ENDPOINT?.trim();
  return endpoint ? endpoint : undefined;
}

export function createBrowserDiscoveryObservability({
  endpoint = getObservabilityEndpoint(),
  sendBeacon = getBrowserSendBeacon(),
  warn = console.warn,
}: BrowserDiscoveryObservabilityOptions = {}): DiscoveryObservability {
  return {
    capture(event) {
      if (endpoint && sendBeacon) {
        try {
          const sent = sendBeacon(
            endpoint,
            JSON.stringify({
              feature: "discovery",
              event,
              capturedAt: new Date().toISOString(),
            }),
          );

          if (sent) {
            return;
          }
        } catch {
          // Keep discovery usable even if remote capture is unavailable.
        }
      }

      warn("[discovery]", event);
    },
  };
}

export const browserDiscoveryObservability = createBrowserDiscoveryObservability();

export function createCatalogLoadFailedEvent(error: unknown): DiscoveryEvent {
  return {
    name: DISCOVERY_EVENT.CATALOG_LOAD_FAILED,
    message: error instanceof Error ? error.message : "Unknown catalog load failure",
  };
}

export function createGeolocationFallbackEvent(reason: LocationErrorReason): DiscoveryEvent {
  return {
    name: DISCOVERY_EVENT.GEOLOCATION_FALLBACK,
    reason,
  };
}
