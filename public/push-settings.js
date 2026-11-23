(() => {
  const enableButton = document.getElementById("enable-daily-reminder");
  const disableButton = document.getElementById("disable-daily-reminder");
  const timeInput = document.getElementById("daily-reminder-time");
  const status = document.getElementById("daily-reminder-status");
  if (!enableButton || !disableButton || !timeInput || !status) return;

  const TOKEN_KEY = "daily-language-quiz-push-token";
  const languageCode = document.documentElement.lang === "de" ? "de"
    : document.documentElement.lang === "zh" ? "zh" : "ga";
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("text-red-700", error);
    status.classList.toggle("text-slate-600", !error);
  };
  const setEnabled = (enabled) => {
    enableButton.hidden = enabled;
    disableButton.hidden = !enabled;
    timeInput.disabled = !enabled;
  };
  const base64UrlToBytes = (value) => {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
  };
  const readToken = () => localStorage.getItem(TOKEN_KEY);

  const saveSettings = async (subscription) => {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reminderTime: timeInput.value,
        langCode: languageCode,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not save reminder settings.");
    localStorage.setItem(TOKEN_KEY, data.token);
  };

  const refresh = async () => {
    const token = readToken();
    if (!token) {
      setEnabled(false);
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        localStorage.removeItem(TOKEN_KEY);
        setEnabled(false);
        return;
      }
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          reminderTime: timeInput.value,
          langCode: languageCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load reminder settings.");
      localStorage.setItem(TOKEN_KEY, data.token);
      setEnabled(true);
      setStatus("Daily reminders are enabled on this device.");
    } catch (error) {
      setStatus(error.message || "Could not load reminder settings.", true);
    }
  };

  enableButton.addEventListener("click", async () => {
    enableButton.disabled = true;
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        throw new Error("This browser does not support web push notifications.");
      }
      const configResponse = await fetch("/api/push/config");
      const config = await configResponse.json();
      if (!configResponse.ok) throw new Error(config.error || "Notifications are not configured yet.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Allow notifications in your browser settings to enable reminders.");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(config.publicKey),
        });
      }
      await saveSettings(subscription);
      setEnabled(true);
      setStatus("Daily reminders are enabled on this device.");
    } catch (error) {
      setStatus(error.message || "Could not enable reminders.", true);
    } finally {
      enableButton.disabled = false;
    }
  });

  disableButton.addEventListener("click", async () => {
    disableButton.disabled = true;
    try {
      const token = readToken();
      if (token) {
        await fetch("/api/push/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      localStorage.removeItem(TOKEN_KEY);
      setEnabled(false);
      setStatus("Daily reminders are turned off.");
    } catch (error) {
      setStatus(error.message || "Could not turn off reminders.", true);
    } finally {
      disableButton.disabled = false;
    }
  });

  timeInput.addEventListener("change", async () => {
    if (!readToken()) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) throw new Error("Please enable notifications again.");
      await saveSettings(subscription);
      setStatus("Your daily reminder time has been updated.");
    } catch (error) {
      setStatus(error.message || "Could not update reminder time.", true);
    }
  });

  if (!timeInput.value) timeInput.value = "09:00";
  refresh();
})();