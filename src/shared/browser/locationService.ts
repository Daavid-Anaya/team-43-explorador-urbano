export interface BrowserLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

const LOCATION_ERROR_REASON = {
  PERMISSION_DENIED: "permission-denied",
  UNAVAILABLE: "unavailable",
  TIMEOUT: "timeout",
  UNSUPPORTED: "unsupported",
} as const;

export type LocationErrorReason =
  (typeof LOCATION_ERROR_REASON)[keyof typeof LOCATION_ERROR_REASON];

export type LocationResult =
  | { status: "granted"; location: BrowserLocation }
  | { status: "denied"; reason: LocationErrorReason };

export interface LocationService {
  getCurrentLocation(): Promise<LocationResult>;
}

function mapGeolocationError(error: GeolocationPositionError): LocationErrorReason {
  if (error.code === error.PERMISSION_DENIED) {
    return LOCATION_ERROR_REASON.PERMISSION_DENIED;
  }

  if (error.code === error.TIMEOUT) {
    return LOCATION_ERROR_REASON.TIMEOUT;
  }

  return LOCATION_ERROR_REASON.UNAVAILABLE;
}

export const browserLocationService: LocationService = {
  getCurrentLocation() {
    if (!navigator.geolocation) {
      return Promise.resolve({
        status: "denied",
        reason: LOCATION_ERROR_REASON.UNSUPPORTED,
      });
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            status: "granted",
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracyMeters: position.coords.accuracy,
            },
          });
        },
        (error) => {
          resolve({
            status: "denied",
            reason: mapGeolocationError(error),
          });
        },
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
      );
    });
  },
};
