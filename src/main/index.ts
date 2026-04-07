import { app, globalShortcut, ipcMain } from "electron";
import { store } from "./store";
import { checkAuthStatus, createLoginWindow, logout } from "./auth";
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

async function startApp() {
  const isLoggedIn = await checkAuthStatus();

  if (!isLoggedIn) {
    createLoginWindow(() => {
      launchDashboard();
    });
    return;
  }

  launchDashboard();
}

function launchDashboard() {
  const win = createMainWindow();
  win.show();

  trayController = createTray({
    onToggleFullscreen: toggleFullscreen,
    onRefresh: reloadMainWindow,
    onLogout: async () => {
      await logout();
      getMainWindow()?.close();
      createLoginWindow(() => launchDashboard());
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
  ipcMain.on("logout", async () => {
    await logout();
    getMainWindow()?.close();
    createLoginWindow(() => launchDashboard());
  });

  app.setLoginItemSettings({
    openAtLogin: store.get("launchAtStartup"),
    openAsHidden: true,
  });

  startApp();
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
    startApp();
  } else {
    win.show();
  }
});
