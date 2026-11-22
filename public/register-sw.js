let deferredInstallPrompt = null;
const installButton = document.getElementById("install-app-button");
const helpPanel = document.getElementById("install-app-help");
const helpCopy = document.getElementById("install-app-help-copy");
const closeHelp = document.getElementById("install-app-help-close");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

document.querySelectorAll("[data-install-app-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => installButton?.click());
});

if (installButton) {
  if (isStandalone) {
    installButton.closest("#install-app-container")?.remove();
  } else {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });

    installButton.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        return;
      }

      if (helpCopy) {
        helpCopy.textContent = isIos
          ? "In Safari, tap the Share button, scroll down, then choose “Add to Home Screen”. Tap Add to finish."
          : "Open your browser menu and choose “Install app” or “Add to Home Screen”. If the option is not shown yet, try again after visiting a few pages."
      }
      if (helpPanel) helpPanel.hidden = false;
    });

    closeHelp?.addEventListener("click", () => {
      if (helpPanel) helpPanel.hidden = true;
    });

    window.addEventListener("appinstalled", () => {
      installButton.closest("#install-app-container")?.remove();
    });
  }
}
