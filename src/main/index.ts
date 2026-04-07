import { app, globalShortcut, ipcMain } from "electron";
import { store } from "./store";
import { createMainWindow, getMainWindow, reloadMainWindow } from "./wallpaper";
import { createTray } from "./tray";
import {
  startIdleDetection,
  showScreensaver,
  dismissScreensaver,
  stopIdleDetection,
} from "./screensaver";

let trayController: { updateMenu: () => void } | null = null;

function toggleFullscreen() {
  const win = getMainWindow();
  if (!win || win.isDestroyed()) return;
  win.setFullScreen(!win.isFullScreen());
}

function launchDashboard() {
  const win = createMainWindow();
  win.show();

  trayController = createTray({
    onToggleFullscreen: toggleFullscreen,
    onRefresh: reloadMainWindow,
    onLogout: () => {
      // Navigate to cmdeck.io logout, then back to login
      const win = getMainWindow();
      if (win && !win.isDestroyed()) {
        win.loadURL("https://cmdeck.io/api/auth/signout");
      }
    },
  });

  startIdleDetection(
    () => showScreensaver(),
    () => dismissScreensaver()
  );

  globalShortcut.register("CommandOrControl+Shift+D", toggleFullscreen);
}

// App lifecycle
app.whenReady().then(() => {
  ipcMain.handle("get-version", () => app.getVersion());
  ipcMain.on("toggle-fullscreen", toggleFullscreen);

  app.setLoginItemSettings({
    openAtLogin: store.get("launchAtStartup"),
    openAsHidden: true,
  });

  launchDashboard();
});

app.on("window-all-closed", () => {
  // Don't quit — keep running in tray
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  stopIdleDetection();
});

app.on("activate", () => {
  const win = getMainWindow();
  if (!win || win.isDestroyed()) {
    launchDashboard();
  } else {
    win.show();
  }
});
