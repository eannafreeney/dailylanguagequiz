document.addEventListener("alpine:init", () => {
  Alpine.data("accountPage", () => ({
    supabaseUrl: document.body.dataset.supabaseUrl || "",
    anonKey: document.body.dataset.supabaseAnonKey || "",
    tokenKey: "dlq_access_token",
    token: "",
    status: "Checking account setup…",
    email: "",
    displayName: "",
    signedIn: false,
    sendingLink: false,
    savingProfile: false,
    selectedLanguage: "ga",
    leaderboardLoading: false,
    leaderboardError: "",
    leaderboardEntries: [],
    streaks: [],
    languageNames: { ga: "Irish", de: "German", ru: "Russian", it: "Italian", zh: "Chinese" },
    languages: [
      { code: "ga", name: "Irish" },
      { code: "de", name: "German" },
      { code: "ru", name: "Russian" },
      { code: "it", name: "Italian" },
      { code: "zh", name: "Chinese" }
    ],
    async init() {
      this.token = localStorage.getItem(this.tokenKey) || "";
      const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
      const incomingToken = hash.get("access_token");
      if (incomingToken) {
        this.token = incomingToken;
        localStorage.setItem(this.tokenKey, this.token);
        history.replaceState(null, "", location.pathname + location.search);
      }
      if (!this.supabaseUrl || !this.anonKey) {
        this.status = "Account sign-in is not configured on this deployment yet. Guest quizzes remain available.";
      } else if (this.token) {
        await this.loadMe();
      } else {
        this.status = "You can browse leaderboards without an account. Sign in to save your own progress.";
      }
      await this.loadLeaderboard();
    },
    async api(path, options = {}) {
      const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
      if (this.token) headers.Authorization = "Bearer " + this.token;
      const response = await fetch(path, Object.assign({}, options, { headers }));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ")");
      return data;
    },
    async sendMagicLink() {
      if (!this.supabaseUrl || !this.anonKey) return;
      this.sendingLink = true;
      try {
        const response = await fetch(new URL("/auth/v1/otp?redirect_to=" + encodeURIComponent(location.origin + "/account"), this.supabaseUrl), {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: this.anonKey },
          body: JSON.stringify({ email: this.email.trim(), create_user: true })
        });
        if (!response.ok) throw new Error("Could not send sign-in email. Check the address and try again.");
        this.status = "Check your inbox for your secure sign-in link. You can close this page while you wait.";
      } catch (error) {
        this.status = error instanceof Error ? error.message : "Could not send sign-in email.";
      } finally {
        this.sendingLink = false;
      }
    },
    async loadMe() {
      try {
        const me = await this.api("/api/me");
        this.displayName = me.displayName || "";
        this.signedIn = true;
        this.status = "Signed in. Save a display name to appear on leaderboards.";
        await this.loadStreaks();
      } catch {
        localStorage.removeItem(this.tokenKey);
        this.token = "";
        this.signedIn = false;
        this.status = "Your sign-in link may have expired. Please request a new one.";
      }
    },
    async saveProfile() {
      this.savingProfile = true;
      try {
        const data = await this.api("/api/profile", {
          method: "PUT",
          body: JSON.stringify({ displayName: this.displayName })
        });
        this.displayName = data.displayName;
        this.status = "Display name saved.";
        await this.loadLeaderboard();
      } catch (error) {
        this.status = error instanceof Error ? error.message : "Could not save display name.";
      } finally {
        this.savingProfile = false;
      }
    },
    signOut() {
      localStorage.removeItem(this.tokenKey);
      this.token = "";
      this.signedIn = false;
      this.streaks = [];
      this.status = "You are signed out. Your saved scores remain on the leaderboard.";
    },
    async loadStreaks() {
      try {
        const data = await this.api("/api/streaks");
        this.streaks = data.streaks;
      } catch (error) {
        this.status = error instanceof Error ? error.message : "Could not load streaks.";
      }
    },
    async loadLeaderboard() {
      this.leaderboardLoading = true;
      this.leaderboardError = "";
      try {
        const data = await this.api("/api/leaderboard?lang=" + encodeURIComponent(this.selectedLanguage));
        this.leaderboardEntries = data.entries || [];
      } catch (error) {
        this.leaderboardError = error instanceof Error ? error.message : "Could not load leaderboard.";
      } finally {
        this.leaderboardLoading = false;
      }
    }
  }));
});
