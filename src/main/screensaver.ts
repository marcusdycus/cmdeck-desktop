import { BrowserWindow, powerMonitor } from "electron";
import path from "path";
import { store } from "./store";

let screensaverWin: BrowserWindow | null = null;
let idleCheckInterval: NodeJS.Timeout | null = null;

export function startIdleDetection(onIdle: () => void, onActive: () => void) {
  const threshold = store.get("idleTimeout");
  if (!store.get("screensaverEnabled")) return;

  idleCheckInterval = setInterval(() => {
    const idleTime = powerMonitor.getSystemIdleTime();
    if (idleTime >= threshold && !screensaverWin) {
      onIdle();
    }
  }, 10000); // Check every 10 seconds

  powerMonitor.on("user-did-become-active", () => {
    if (screensaverWin) onActive();
  });

  powerMonitor.on("lock-screen", () => {
    if (screensaverWin) onActive();
  });
}

export function showScreensaver() {
  if (screensaverWin) return;

  screensaverWin = new BrowserWindow({
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#1A1A1A",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  screensaverWin.loadFile(
    path.join(__dirname, "../../src/renderer/screensaver.html")
  );

  // Dismiss on any mouse movement or keypress
  screensaverWin.webContents.on("before-input-event", () => {
    dismissScreensaver();
  });
}

export function dismissScreensaver() {
  if (screensaverWin && !screensaverWin.isDestroyed()) {
    screensaverWin.close();
  }
  screensaverWin = null;
}

export function stopIdleDetection() {
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
    idleCheckInterval = null;
  }
}
