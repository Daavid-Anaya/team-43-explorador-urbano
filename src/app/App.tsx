import { useOnlineStatus } from "../shared/pwa/useOnlineStatus";
import { useServiceWorkerUpdate } from "../shared/pwa/useServiceWorkerUpdate";

export function App() {
  const isOnline = useOnlineStatus();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  return (
    <main>
      <h1>Explorador Urbano</h1>
      <p>Base de aplicación lista para construir el MVP.</p>

      <p role="status">
        {isOnline
          ? "En línea"
          : "Sin conexión — mostrando contenido guardado. Completar un desafío requiere conexión."}
      </p>

      {updateAvailable && (
        <div role="alert">
          <p>Nueva versión disponible</p>
          <button type="button" onClick={() => void applyUpdate()}>
            Actualizar
          </button>
        </div>
      )}
    </main>
  );
}
