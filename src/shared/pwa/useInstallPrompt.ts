import { useEffect, useState } from "react";

/**
 * Evento no estándar disparado por navegadores compatibles antes de mostrar
 * el prompt de instalación nativo. Todavía no forma parte de `lib.dom.d.ts`,
 * por eso se declara localmente.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallPromptState {
  /** True una vez que un navegador compatible disparó `beforeinstallprompt`. */
  canInstall: boolean;
  /** Dispara el flujo de instalación nativo diferido. No hace nada si no está soportado. */
  promptInstall: () => Promise<void>;
}

/**
 * Captura `beforeinstallprompt` para que la app pueda renderizar un
 * call-to-action de instalación personalizado en lugar de depender de la
 * mini-infobar propia del navegador. Nunca bloquea el uso central:
 * los navegadores que nunca disparan el evento simplemente mantienen
 * `canInstall` en false para siempre, según la spec (requisito de Custom Install Prompt).
 */
export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return {
    canInstall: deferredPrompt !== null,
    promptInstall: async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    },
  };
}
