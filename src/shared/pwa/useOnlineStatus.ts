import { useEffect, useState } from "react";

/**
 * Rastrea la conectividad del navegador vía `navigator.onLine` más los
 * eventos `online`/`offline` de window, para que la UI pueda distinguir
 * contenido cacheado navegable de acciones que requieren conexión de red.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
