import { useEffect, useState } from "react";

/**
 * Non-standard event fired by supporting browsers before showing the native
 * install prompt. Not yet part of `lib.dom.d.ts`, so it's declared locally.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallPromptState {
  /** True once a supporting browser fired `beforeinstallprompt`. */
  canInstall: boolean;
  /** Triggers the deferred native install flow. No-op if unsupported. */
  promptInstall: () => Promise<void>;
}

/**
 * Captures `beforeinstallprompt` so the app can render a custom install
 * call-to-action instead of relying on the browser's own mini-infobar.
 * Never blocks core usage: browsers that never fire the event simply keep
 * `canInstall` false forever, per spec (Custom Install Prompt requirement).
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
