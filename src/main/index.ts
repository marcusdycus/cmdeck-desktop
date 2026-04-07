import { app, globalShortcut, ipcMain } from "electron";
import { store } from "./store";
import { checkAuthStatus, createLoginWindow, logout } from "./auth";
import {
  createWallpaperWindow,
  createEditWindow,
  attachWallpaper,
  detachWallpaper,
  getWallpaperWindow,
  getEditWindow,
} from "./wallpaper";
import { createTray } from "./tray";
import {
  startIdleDetection,
  showScreensaver,
  dismissScreensaver,
  stopIdleDetection,
} from "./screensaver";

let mode: "wallpaper" | "windowed" = "wallpaper";
let trayController: { updateMenu: () => void } | null = null;

function toggleMode() {
  if (mode === "wallpaper") {
    // Switch to windowed edit mode
    detachWallpaper();
    getWallpaperWindow()?.hide();

    let editWin = getEditWindow();
    if (!editWin || editWin.isDestroyed()) {
      editWin = createEditWindow();
    }
    editWin.show();
    editWin.focus();

    mode = "windowed";
  } else {
    // Switch back to wallpaper mode
    getEditWindow()?.hide();

    const wallpaperWin = getWallpaperWindow();
    if (wallpaperWin) {
      // Reload to pick up any changes made in edit mode
      wallpaperWin.loadURL("https://cmdeck.io/wallpaper");
      wallpaperWin.show();
      attachWallpaper();
    }

    mode = "wallpaper";
  }

  store.set("lastMode", mode);
  trayController?.updateMenu();
}

async function startApp() {
  const isLoggedIn = await checkAuthStatus();

  if (!isLoggedIn) {
    createLoginWindow(() => {
      startWallpaper();
    });
    return;
  }

  startWallpaper();
}

function startWallpaper() {
  createWallpaperWindow();

  // Small delay to let the page load before attaching
  setTimeout(() => {
    attachWallpaper();
  }, 2000);

  // Set up tray
  trayController = createTray({
    onToggleMode: toggleMode,
    onRefresh: () => {
      getWallpaperWindow()?.loadURL("https://cmdeck.io/wallpaper");
    },
    onLogout: async () => {
      await logout();
      getWallpaperWindow()?.close();
      getEditWindow()?.close();
      createLoginWindow(() => startWallpaper());
    },
    getMode: () => mode,
  });

  // Set up screensaver
  startIdleDetection(
    () => showScreensaver(),
    () => dismissScreensaver()
  );

  // Register global hotkey
  globalShortcut.register("CommandOrControl+Shift+D", toggleMode);
}

// IPC handlers
ipcMain.handle("get-mode", () => mode);
ipcMain.handle("get-version", () => app.getVersion());
ipcMain.on("toggle-mode", toggleMode);
ipcMain.on("logout", async () => {
  await logout();
  getWallpaperWindow()?.close();
  getEditWindow()?.close();
  createLoginWindow(() => startWallpaper());
});

// App lifecycle
app.whenReady().then(startApp);

app.on("window-all-closed", () => {
  // Don't quit — keep running in tray
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  stopIdleDetection();
});

// macOS: re-open when clicking dock icon
app.on("activate", () => {
  if (!getWallpaperWindow() && !getEditWindow()) {
    startApp();
  }
});

// Auto-launch on startup
app.setLoginItemSettings({
  openAtLogin: store.get("launchAtStartup"),
  openAsHidden: true,
});
