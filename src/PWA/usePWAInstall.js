import { useEffect, useState } from "react";

let deferredPrompt;

export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // browser default popup roko
      deferredPrompt = e;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // 🔥 real install popup
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("User installed the app");
    }

    deferredPrompt = null;
    setCanInstall(false);
  };

  return { canInstall, installApp };
};
