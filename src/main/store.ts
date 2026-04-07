import Store from "electron-store";

interface StoreSchema {
  isLoggedIn: boolean;
  idleTimeout: number;
  screensaverEnabled: boolean;
  launchAtStartup: boolean;
  lastMode: "wallpaper" | "windowed";
}

export const store = new Store<StoreSchema>({
  defaults: {
    isLoggedIn: false,
    idleTimeout: 300, // 5 minutes
    screensaverEnabled: true,
    launchAtStartup: true,
    lastMode: "wallpaper",
  },
});
