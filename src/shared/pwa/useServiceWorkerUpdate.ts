import { useRegisterSW } from "virtual:pwa-register/react";

export interface ServiceWorkerUpdateState {
  /** True once a new service worker is installed and waiting to activate. */
  updateAvailable: boolean;
  /** True once the current service worker finished precaching for offline use. */
  offlineReady: boolean;
  /** Activates the waiting service worker and reloads to pick up new assets. */
  applyUpdate: () => Promise<void>;
  /** Dismisses the "offline ready" notice without reloading. */
  dismissOfflineReady: () => void;
}

/**
 * Wraps `virtual:pwa-register/react` so the app can show a custom
 * "new version available" prompt instead of silently swapping the service
 * worker mid-session (registerType is 'prompt', not 'autoUpdate').
 */
export function useServiceWorkerUpdate(): ServiceWorkerUpdateState {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  return {
    updateAvailable: needRefresh,
    offlineReady,
    applyUpdate: () => updateServiceWorker(true),
    dismissOfflineReady: () => setOfflineReady(false),
  };
}
