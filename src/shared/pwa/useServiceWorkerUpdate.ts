import { useRegisterSW } from "virtual:pwa-register/react";

export interface ServiceWorkerUpdateState {
  /** True una vez que un nuevo service worker está instalado y esperando activarse. */
  updateAvailable: boolean;
  /** True una vez que el service worker actual terminó de precachear para uso offline. */
  offlineReady: boolean;
  /** Activa el service worker en espera y recarga para tomar los nuevos assets. */
  applyUpdate: () => Promise<void>;
  /** Descarta el aviso de "listo para offline" sin recargar. */
  dismissOfflineReady: () => void;
}

/**
 * Envuelve `virtual:pwa-register/react` para que la app pueda mostrar un
 * prompt personalizado de "nueva versión disponible" en lugar de reemplazar
 * silenciosamente el service worker a mitad de sesión (registerType es
 * 'prompt', no 'autoUpdate').
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
